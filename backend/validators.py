# ============================================================================
# Validation — Input Validators for Meeting Transcripts (validators.py)
# ============================================================================

import os
import re
from pathlib import Path
from typing import Union, BinaryIO, Optional


class TranscriptValidationError(ValueError):
    """Base exception for transcript validation failures."""
    pass


class EmptyTranscriptError(TranscriptValidationError):
    """Raised when the submitted transcript is empty or whitespace only."""
    pass


class UnsupportedFormatError(TranscriptValidationError):
    """Raised when an uploaded file is not a supported text format (.txt)."""
    pass


class TranscriptTooShortError(TranscriptValidationError):
    """Raised when transcript does not meet minimum length requirement."""
    pass


class TranscriptTooLargeError(TranscriptValidationError):
    """Raised when transcript exceeds safe processing limits."""
    pass


MIN_WORD_COUNT = 5
MAX_WORD_COUNT = 150_000
ALLOWED_EXTENSIONS = {".txt"}


def validate_file_extension(filename: str) -> None:
    """
    Validates that uploaded file has an allowed extension (.txt).
    
    Raises:
        UnsupportedFormatError if extension is not allowed.
    """
    if not filename:
        return
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise UnsupportedFormatError(
            f"Invalid file format '{ext}'. Only plain text (.txt) files are supported."
        )


def decode_bytes(content: bytes) -> str:
    """
    Decodes raw file bytes into string trying common encodings.
    """
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
    for enc in encodings:
        try:
            return content.decode(enc)
        except UnicodeDecodeError:
            continue
    raise TranscriptValidationError(
        "Could not decode text file. Please ensure it is saved in UTF-8 encoding."
    )


def sanitize_text(text: str) -> str:
    """
    Removes null bytes and control characters while preserving newlines and standard text.
    """
    # Remove null bytes and non-printable control chars except \n, \r, \t
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
    return cleaned.strip()


def validate_input(
    input_data: Union[str, bytes, BinaryIO, Path],
    filename: Optional[str] = None,
    min_words: int = MIN_WORD_COUNT,
    max_words: int = MAX_WORD_COUNT,
) -> str:
    """
    Validates and standardizes transcript input from either raw text or uploaded .txt file.
    
    Args:
        input_data: String text, bytes from file, open file buffer, or Path.
        filename: Optional filename for extension checking.
        min_words: Minimum allowed word count.
        max_words: Maximum allowed word count.
        
    Returns:
        Clean, validated plain text string.
        
    Raises:
        TranscriptValidationError on any validation failure.
    """
    if filename:
        validate_file_extension(filename)

    # 1. Resolve input_data to raw string
    if isinstance(input_data, Path):
        validate_file_extension(str(input_data))
        if not input_data.exists():
            raise TranscriptValidationError(f"File not found: {input_data}")
        raw_bytes = input_data.read_bytes()
        raw_text = decode_bytes(raw_bytes)
    elif isinstance(input_data, bytes):
        raw_text = decode_bytes(input_data)
    elif hasattr(input_data, "read"):
        content = input_data.read()
        if isinstance(content, bytes):
            raw_text = decode_bytes(content)
        else:
            raw_text = str(content)
    elif isinstance(input_data, str):
        raw_text = input_data
    else:
        raise TranscriptValidationError(
            f"Unsupported input type '{type(input_data).__name__}'. Expected string, bytes, or Path."
        )

    # 2. Sanitize
    sanitized = sanitize_text(raw_text)

    # 3. Check for emptiness
    if not sanitized:
        raise EmptyTranscriptError("Transcript content is empty. Please provide valid meeting text.")

    # 4. Word count checks
    words = re.findall(r"\b\w+\b", sanitized)
    word_count = len(words)

    if word_count < min_words:
        raise TranscriptTooShortError(
            f"Transcript is too short ({word_count} words). Minimum required is {min_words} words."
        )

    if word_count > max_words:
        raise TranscriptTooLargeError(
            f"Transcript exceeds maximum limit ({word_count} words > {max_words} allowed)."
        )

    return sanitized

