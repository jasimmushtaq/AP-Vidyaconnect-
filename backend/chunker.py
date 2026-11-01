# ============================================================================
# Chunker — 3000-word Chunks + 200-word Overlap (chunker.py)
# ============================================================================

import re
from dataclasses import dataclass
from typing import List, Dict
from .preprocessor import PreprocessedTranscript


@dataclass
class TranscriptChunk:
    """Represents a discrete line-boundary-aware chunk with overlap telemetry."""
    chunk_index: int
    start_line: int
    end_line: int
    word_count: int
    text: str
    line_indices: List[int]


def count_words(text: str) -> int:
    """Counts words using word boundary tokenization."""
    return len(re.findall(r"\b\w+\b", text))


def chunk_transcript(
    preprocessed: PreprocessedTranscript,
    chunk_size: int = 3000,
    overlap: int = 200,
) -> List[TranscriptChunk]:
    """
    Splits a preprocessed transcript into overlapping chunks respecting line boundaries:
    - Target chunk size: 3000 words
    - Overlap: 200 words
    - Never breaks in the middle of a speaker turn or utterance.
    
    Args:
        preprocessed: PreprocessedTranscript with indexed lines.
        chunk_size: Target words per chunk (default 3000).
        overlap: Target overlap words between consecutive chunks (default 200).
        
    Returns:
        List of TranscriptChunk objects.
    """
    total_lines = preprocessed.line_count
    if total_lines == 0:
        return []

    # Pre-calculate word counts for each line
    line_words: Dict[int, int] = {}
    for line_num, line_str in preprocessed.indexed_lines.items():
        line_words[line_num] = count_words(line_str)

    chunks: List[TranscriptChunk] = []
    chunk_idx = 1
    current_start_line = 1

    while current_start_line <= total_lines:
        accumulated_words = 0
        chunk_line_nums: List[int] = []
        line_ptr = current_start_line

        # Accumulate lines up to chunk_size
        while line_ptr <= total_lines:
            w_count = line_words[line_ptr]
            chunk_line_nums.append(line_ptr)
            accumulated_words += w_count
            line_ptr += 1

            if accumulated_words >= chunk_size:
                break

        end_line = chunk_line_nums[-1] if chunk_line_nums else current_start_line

        # Build chunk text from preprocessed numbered lines
        chunk_text_lines = [
            f"[L{ln}] {preprocessed.indexed_lines[ln]}" for ln in chunk_line_nums
        ]
        chunk_text = "\n".join(chunk_text_lines)

        chunk = TranscriptChunk(
            chunk_index=chunk_idx,
            start_line=current_start_line,
            end_line=end_line,
            word_count=accumulated_words,
            text=chunk_text,
            line_indices=list(chunk_line_nums),
        )
        chunks.append(chunk)

        # If we have reached the end of all lines, stop
        if end_line >= total_lines:
            break

        # Calculate overlap starting point for next chunk
        # Walk backwards from end_line until we accumulate approx `overlap` words
        overlap_words = 0
        overlap_start = end_line
        while overlap_start > current_start_line:
            overlap_words += line_words[overlap_start]
            if overlap_words >= overlap:
                break
            overlap_start -= 1

        # Advance start_line for the next chunk
        # Guard against zero progress: must advance at least 1 line past current_start_line
        next_start = max(overlap_start, current_start_line + 1)
        if next_start <= current_start_line:
            next_start = current_start_line + 1

        current_start_line = next_start
        chunk_idx += 1

    return chunks

