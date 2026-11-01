# ============================================================================
# Unit & Integration Tests — Meeting Transcript Summarization Architecture
# ============================================================================

import pytest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.models import MeetingSummary, ActionItem, Decision, KeyPoint
from backend.validators import (
    validate_input,
    EmptyTranscriptError,
    UnsupportedFormatError,
    TranscriptTooShortError,
)
from backend.preprocessor import preprocess, PreprocessedTranscript
from backend.chunker import chunk_transcript
from backend.verifier import (
    find_quote_in_transcript,
    verify_owner,
    verify_deadline,
    verify_meeting_summary,
)
from backend.pipeline import run_pipeline


SAMPLE_TRANSCRIPT_SHORT = """
Alice: Welcome everyone. We need to finalize the Q4 roadmap by next Friday.
Bob: I will prepare the technical architecture documentation before Wednesday EOD.
Charlie: That sounds good. We decided to adopt PostgreSQL for our primary datastore.
Alice: Great, I will review Bob's architecture document on Thursday morning.
"""


def test_validator_rejects_empty():
    with pytest.raises(EmptyTranscriptError):
        validate_input("   \n\t  ")


def test_validator_rejects_unsupported_extension():
    with pytest.raises(UnsupportedFormatError):
        validate_input("Some valid text content here", filename="notes.pdf")


def test_validator_accepts_txt():
    clean = validate_input(SAMPLE_TRANSCRIPT_SHORT, filename="meeting.txt")
    assert "Alice: Welcome everyone" in clean


def test_preprocessor_cleans_and_detects_speakers():
    dirty_text = """
    [00:01:23] Alice: Welcome everyone [laughter]. We will start now.
    [00:01:45] Bob: I will submit the quarterly report by Friday EOD.
    """
    prep = preprocess(dirty_text)
    assert prep.line_count == 2
    assert prep.detected_speakers == ["Alice", "Bob"]
    assert "[00:01:23]" not in prep.numbered_text
    assert "[laughter]" not in prep.numbered_text
    assert "[L1]" in prep.numbered_text
    assert "[L2]" in prep.numbered_text


def test_verifier_detects_verbatim_quote():
    prep = preprocess(SAMPLE_TRANSCRIPT_SHORT)
    found, line_num, msg = find_quote_in_transcript(
        "I will prepare the technical architecture documentation before Wednesday EOD.",
        prep
    )
    assert found is True
    assert line_num == 2


def test_verifier_flags_hallucinated_quote():
    prep = preprocess(SAMPLE_TRANSCRIPT_SHORT)
    found, line_num, msg = find_quote_in_transcript(
        "We are launching a completely unrelated cryptocurrency project tomorrow.",
        prep
    )
    assert found is False
    assert "HALLUCINATION" in msg


def test_verifier_validates_owner():
    speakers = ["Alice", "Bob", "Charlie"]
    valid, msg = verify_owner("Alice", speakers)
    assert valid is True

    valid_invalid, msg_inv = verify_owner("GhostParticipant", speakers)
    assert valid_invalid is False


def test_verifier_validates_deadline():
    valid, val, msg = verify_deadline("next Friday")
    assert valid is True

    valid_iso, val_iso, _ = verify_deadline("2026-11-15")
    assert valid_iso is True
    assert val_iso == "2026-11-15"


def test_pipeline_single_pass_execution():
    """Tests the <= 4000 words branch (Single-pass LLM call)."""
    summary = run_pipeline(
        input_data=SAMPLE_TRANSCRIPT_SHORT,
        provider_name="mock"
    )
    assert isinstance(summary, MeetingSummary)
    assert summary.metadata.routing_path == "single_pass"
    assert summary.metadata.num_chunks == 1
    assert "Alice" in summary.attendees
    assert "Bob" in summary.attendees
    assert len(summary.action_items) > 0
    # Verifier check
    assert summary.verification_report.quotes_passed > 0


def test_pipeline_map_reduce_execution():
    """Tests the > 4000 words branch (Chunker 3000w + 200w overlap -> MAP -> REDUCE)."""
    # Create a synthetic transcript with > 4000 words
    repeated_block = (
        "Alice: We are discussing section items for the comprehensive report. "
        "Bob: I will handle database migration and indexing tasks by Monday. "
        "Charlie: I will verify performance benchmarks before next Tuesday. "
    )
    # Each repeated block is ~30 words. 150 repetitions = ~4500 words.
    large_transcript = "\n".join([f"[{i}] " + repeated_block for i in range(150)])
    
    summary = run_pipeline(
        input_data=large_transcript,
        provider_name="mock"
    )
    assert isinstance(summary, MeetingSummary)
    assert summary.metadata.routing_path == "map_reduce"
    assert summary.metadata.num_chunks >= 2
    assert summary.metadata.chunk_size_words == 3000
    assert summary.metadata.chunk_overlap_words == 200
    assert len(summary.action_items) > 0

