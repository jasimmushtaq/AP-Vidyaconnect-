# ============================================================================
# Preprocess — Clean · Line Numbers · Speaker Detect (preprocessor.py)
# ============================================================================

import re
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional


@dataclass
class PreprocessedTranscript:
    """Preprocessed transcript with cleaning, line indexing, and speaker detection."""
    clean_text: str
    numbered_text: str
    indexed_lines: Dict[int, str]  # line_num -> cleaned text of the line
    line_speaker_map: Dict[int, Optional[str]]  # line_num -> detected speaker
    detected_speakers: List[str]
    word_count: int
    line_count: int


# Patterns to strip audio/transcript noise
TIMESTAMP_REGEX = re.compile(
    r"(?:\[|\()?\b\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?\b(?:\s*(?:AM|PM|am|pm))?(?:\]|\))?"
)
NOISE_TAGS_REGEX = re.compile(
    r"\[(?:laughter|applause|crosstalk|music|inaudible|pause|cough|sigh)\]|\((?:laughter|applause|crosstalk|music|inaudible|pause)\)",
    re.IGNORECASE,
)

# Patterns for speaker identification
SPEAKER_PATTERNS = [
    # 1. Standard "Name:" or "Name (Role):"
    re.compile(r"^([A-Z][A-Za-z0-9\.\s\-]{1,35}(?:\s*\([A-Za-z0-9\.\s\-]{1,25}\))?):\s*(.*)$"),
    # 2. Bracketed "[Name]:" or "[Name]"
    re.compile(r"^\[([A-Z][A-Za-z0-9\.\s\-]{1,35})\]:?\s*(.*)$"),
    # 3. Markdown bold "**Name**:"
    re.compile(r"^\*\*([A-Z][A-Za-z0-9\.\s\-]{1,35})\*\*:?\s*(.*)$"),
    # 4. Name followed by dash "Name - Message"
    re.compile(r"^([A-Z][A-Za-z0-9\.\s\-]{1,35})\s+[-–—]\s+(.*)$"),
]


def clean_line(line: str) -> str:
    """Cleans a single transcript line by removing timestamps and noise tags."""
    # Remove timestamps
    cleaned = TIMESTAMP_REGEX.sub("", line)
    # Remove noise tags
    cleaned = NOISE_TAGS_REGEX.sub("", cleaned)
    # Collapse multiple spaces
    cleaned = re.sub(r"[ \t]+", " ", cleaned).strip()
    return cleaned


def detect_speaker_in_line(line: str) -> Tuple[Optional[str], str]:
    """
    Detects if line begins with a speaker designation.
    Returns (speaker_name, dialogue_content).
    """
    for pattern in SPEAKER_PATTERNS:
        match = pattern.match(line)
        if match:
            speaker = match.group(1).strip()
            # Basic sanity check on speaker name (not an ordinary sentence)
            if len(speaker.split()) <= 4 and not speaker.lower().startswith(("http", "note", "item")):
                content = match.group(2).strip()
                return speaker, content
    return None, line


def preprocess(raw_text: str) -> PreprocessedTranscript:
    """
    Executes the complete Preprocessing stage:
    1. Clean: normalizes newlines, removes timestamps, noise tags, excess whitespace.
    2. Speaker detect: parses speaker names across utterances.
    3. Line numbers: assigns sequential [L1], [L2] labels and creates indexed maps.
    
    Args:
        raw_text: Validated raw transcript text.
        
    Returns:
        PreprocessedTranscript with indexed lines, detected speakers, and telemetry.
    """
    # 1. Normalize line breaks
    normalized = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    raw_lines = normalized.split("\n")

    cleaned_lines: List[str] = []
    indexed_lines: Dict[int, str] = {}
    line_speaker_map: Dict[int, Optional[str]] = {}
    detected_speakers_set = set()
    detected_speakers_list: List[str] = []
    
    current_speaker: Optional[str] = None
    line_counter = 1

    for line in raw_lines:
        c_line = clean_line(line)
        if not c_line:
            continue

        # Check speaker
        speaker, dialogue = detect_speaker_in_line(c_line)
        if speaker:
            current_speaker = speaker
            if current_speaker not in detected_speakers_set:
                detected_speakers_set.add(current_speaker)
                detected_speakers_list.append(current_speaker)
            formatted_line = f"{current_speaker}: {dialogue}" if dialogue else f"{current_speaker}:"
        else:
            # Continues previous speaker turn or unassigned dialogue
            formatted_line = c_line

        indexed_lines[line_counter] = formatted_line
        line_speaker_map[line_counter] = current_speaker
        cleaned_lines.append(f"[L{line_counter}] {formatted_line}")
        line_counter += 1

    numbered_text = "\n".join(cleaned_lines)
    clean_text = "\n".join(indexed_lines.values())

    # Count total words across cleaned transcript
    words = re.findall(r"\b\w+\b", clean_text)
    word_count = len(words)

    return PreprocessedTranscript(
        clean_text=clean_text,
        numbered_text=numbered_text,
        indexed_lines=indexed_lines,
        line_speaker_map=line_speaker_map,
        detected_speakers=detected_speakers_list,
        word_count=word_count,
        line_count=len(indexed_lines),
    )

