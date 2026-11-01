# ============================================================================
# Pipeline — Meeting Transcript Summarization Architecture Orchestrator (pipeline.py)
# ============================================================================

import time
from typing import Union, BinaryIO, Optional
from pathlib import Path

from .models import (
    MeetingSummary,
    ActionItem,
    Decision,
    KeyPoint,
    VerificationReport,
    TranscriptMetadata,
)
from .validators import validate_input
from .preprocessor import preprocess, PreprocessedTranscript
from .chunker import chunk_transcript, TranscriptChunk
from .verifier import verify_meeting_summary
from .llm_provider import get_llm_provider, BaseLLMProvider

TRANSCRIPT_SIZE_THRESHOLD_WORDS = 4000
CHUNK_SIZE_WORDS = 3000
CHUNK_OVERLAP_WORDS = 200


def run_pipeline(
    input_data: Union[str, bytes, BinaryIO, Path],
    filename: Optional[str] = None,
    provider: Optional[BaseLLMProvider] = None,
    provider_name: str = "auto",
) -> MeetingSummary:
    r"""
    Executes the end-to-end Meeting Transcript Summarization System Architecture:
    
    [User input (paste text / upload .txt)]
                     │
                     ▼
        [Validation (validators.py)]
                     │
                     ▼
               [Preprocess]
       (clean · line numbers · speaker detect)
                     │
                     ▼
            [Transcript size?]
           /                  \
    <= 4000 words        > 4000 words
         /                      \
    [Single-pass LLM call]   [Chunker: 3000w + 200w overlap]
         │                              │
         │                            [MAP: extract per chunk]
         │                              │
         │                           [REDUCE: merge · dedupe · resolve]
         \                              /
          ─────────► [Verifier] ◄───────
       (deterministic, no LLM: quotes · owners · deadlines)
                     │
                     ▼
         [MeetingSummary (Pydantic schema)]
    """
    start_time = time.perf_counter()

    # Step 1 & 2: Input Validation (validators.py)
    validated_text = validate_input(input_data=input_data, filename=filename)

    # Step 3: Preprocess (clean · line numbers · speaker detect)
    preprocessed: PreprocessedTranscript = preprocess(validated_text)

    # Resolve LLM provider
    llm = provider or get_llm_provider(provider_name)

    # Step 4: Transcript size decision
    word_count = preprocessed.word_count
    if word_count <= TRANSCRIPT_SIZE_THRESHOLD_WORDS:
        # Branch 1: Single-pass LLM call
        routing_path = "single_pass"
        num_chunks = 1
        raw_summary_dict = llm.extract_single_pass(
            numbered_text=preprocessed.numbered_text,
            speakers=preprocessed.detected_speakers,
        )
    else:
        # Branch 2: Chunker -> MAP -> REDUCE
        routing_path = "map_reduce"
        chunks = chunk_transcript(
            preprocessed=preprocessed,
            chunk_size=CHUNK_SIZE_WORDS,
            overlap=CHUNK_OVERLAP_WORDS,
        )
        num_chunks = len(chunks)

        # MAP: extract per chunk
        chunk_summaries = []
        for chk in chunks:
            chunk_extract = llm.map_chunk(
                chunk_text=chk.text,
                chunk_index=chk.chunk_index,
                total_chunks=num_chunks,
            )
            chunk_summaries.append(chunk_extract)

        # REDUCE: merge · dedupe · resolve
        raw_summary_dict = llm.reduce_chunks(
            chunk_summaries=chunk_summaries,
            all_speakers=preprocessed.detected_speakers,
        )

    # Parse raw summary into typed Pydantic models (pre-verification)
    action_items = [
        ActionItem(
            id=item.get("id", f"ACT-{i+1}"),
            task=item.get("task", ""),
            owner=item.get("owner"),
            deadline=item.get("deadline"),
            quote=item.get("quote"),
            line_reference=item.get("line_reference"),
        )
        for i, item in enumerate(raw_summary_dict.get("action_items", []))
    ]

    decisions = [
        Decision(
            id=dec.get("id", f"DEC-{i+1}"),
            decision=dec.get("decision", ""),
            context=dec.get("context"),
            made_by=dec.get("made_by"),
            quote=dec.get("quote"),
            line_reference=dec.get("line_reference"),
        )
        for i, dec in enumerate(raw_summary_dict.get("decisions", []))
    ]

    key_points = [
        KeyPoint(
            topic=kp.get("topic", "Discussion Point"),
            summary=kp.get("summary", ""),
            speakers=kp.get("speakers", []),
            key_quote=kp.get("key_quote"),
        )
        for kp in raw_summary_dict.get("key_points", [])
    ]

    end_time = time.perf_counter()
    duration = round(end_time - start_time, 3)

    metadata = TranscriptMetadata(
        raw_word_count=len(validated_text.split()),
        clean_word_count=preprocessed.word_count,
        line_count=preprocessed.line_count,
        detected_speakers=preprocessed.detected_speakers,
        routing_path=routing_path,
        num_chunks=num_chunks,
        chunk_size_words=CHUNK_SIZE_WORDS,
        chunk_overlap_words=CHUNK_OVERLAP_WORDS,
        processing_time_sec=duration,
    )

    unverified_summary = MeetingSummary(
        title=raw_summary_dict.get("title", "Meeting Summary"),
        meeting_date=raw_summary_dict.get("meeting_date"),
        attendees=preprocessed.detected_speakers or raw_summary_dict.get("attendees", []),
        overview=raw_summary_dict.get("overview", "Executive meeting summary."),
        key_points=key_points,
        decisions=decisions,
        action_items=action_items,
        verification_report=VerificationReport(),
        metadata=metadata,
    )

    # Step 5: Verifier (deterministic, no LLM: quotes · owners · deadlines)
    verified_summary = verify_meeting_summary(
        summary=unverified_summary,
        preprocessed=preprocessed,
    )

    # Step 6: Return final MeetingSummary conforming to Pydantic schema
    return verified_summary
