# ============================================================================
# Meeting Transcript Summarizer — Pydantic Schemas & Data Models
# ============================================================================

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class QuoteEvidence(BaseModel):
    """Verbatim quote evidence linked directly to indexed transcript lines."""
    quote: str = Field(description="Exact verbatim excerpt from the transcript")
    line_number: Optional[int] = Field(default=None, description="Line number [Ln] where quote originates")
    speaker: Optional[str] = Field(default=None, description="Speaker who uttered the quote")
    is_verified: bool = Field(default=False, description="Whether the quote was verified verbatim by deterministic verifier")
    verification_detail: Optional[str] = Field(default=None, description="Deterministic match details or mismatch reason")


class ActionItem(BaseModel):
    """Action item with deterministic owner, deadline, and quote verification."""
    id: str = Field(description="Unique action item identifier e.g. ACT-1")
    task: str = Field(description="Actionable task description")
    owner: Optional[str] = Field(default=None, description="Assigned owner or participant")
    owner_verified: bool = Field(default=False, description="Whether owner exists in detected attendees")
    deadline: Optional[str] = Field(default=None, description="Extracted deadline string")
    deadline_verified: bool = Field(default=False, description="Whether deadline parsed to a valid calendar/relative date")
    deadline_parsed: Optional[str] = Field(default=None, description="ISO-8601 or normalized deadline representation")
    quote: Optional[str] = Field(default=None, description="Verbatim transcript quote backing this action item")
    line_reference: Optional[str] = Field(default=None, description="Line reference e.g. 'L14'")
    quote_verified: bool = Field(default=False, description="Whether quote matches verbatim in preprocessed lines")
    all_verified: bool = Field(default=False, description="True if quote, owner, and deadline all pass verification")
    verification_notes: List[str] = Field(default_factory=list, description="Audit notes from deterministic verifier")


class Decision(BaseModel):
    """Key decision made during the meeting."""
    id: str = Field(description="Unique decision identifier e.g. DEC-1")
    decision: str = Field(description="Agreed decision statement")
    context: Optional[str] = Field(default=None, description="Context or reasoning for the decision")
    made_by: Optional[str] = Field(default=None, description="Speaker who proposed or finalized the decision")
    owner_verified: bool = Field(default=False, description="Whether proposing speaker is verified attendee")
    quote: Optional[str] = Field(default=None, description="Verbatim quote substantiating the decision")
    line_reference: Optional[str] = Field(default=None, description="Line reference e.g. 'L28'")
    quote_verified: bool = Field(default=False, description="Whether quote matches verbatim in transcript")


class KeyPoint(BaseModel):
    """Core discussion point or agenda topic."""
    topic: str = Field(description="High-level topic or discussion theme")
    summary: str = Field(description="Synthesis of what was discussed")
    speakers: List[str] = Field(default_factory=list, description="Speakers who contributed to this discussion")
    key_quote: Optional[str] = Field(default=None, description="Optional supporting verbatim quote")


class VerificationReport(BaseModel):
    """Deterministic, zero-LLM audit report verifying quotes, owners, and deadlines."""
    total_quotes_checked: int = Field(default=0)
    quotes_passed: int = Field(default=0)
    quotes_failed: int = Field(default=0)
    
    total_owners_checked: int = Field(default=0)
    owners_passed: int = Field(default=0)
    owners_failed: int = Field(default=0)
    
    total_deadlines_checked: int = Field(default=0)
    deadlines_passed: int = Field(default=0)
    deadlines_failed: int = Field(default=0)
    
    hallucinations_flagged: int = Field(default=0, description="Count of hallucinated quotes/owners prevented")
    passed_verification: bool = Field(default=True, description="Overall verification outcome")
    issues: List[str] = Field(default_factory=list, description="Detailed list of validation issues found")


class TranscriptMetadata(BaseModel):
    """Execution metadata tracking size, chunking, and routing path."""
    raw_word_count: int = Field(description="Word count of initial user input")
    clean_word_count: int = Field(description="Word count after preprocessing and cleaning")
    line_count: int = Field(description="Total indexed lines in transcript")
    detected_speakers: List[str] = Field(default_factory=list, description="Unique speakers detected in preprocessor")
    routing_path: Literal["single_pass", "map_reduce"] = Field(
        description="Path selected: 'single_pass' (<=4000 words) or 'map_reduce' (>4000 words)"
    )
    num_chunks: int = Field(default=1, description="Number of chunks created by chunker")
    chunk_size_words: int = Field(default=3000, description="Target words per chunk")
    chunk_overlap_words: int = Field(default=200, description="Overlap words between consecutive chunks")
    processing_time_sec: float = Field(default=0.0, description="Pipeline wall-clock duration in seconds")


class MeetingSummary(BaseModel):
    """Top-level Meeting Summary conforming to the final architecture schema."""
    title: str = Field(description="Synthesized title or meeting subject")
    meeting_date: Optional[str] = Field(default=None, description="Date of meeting if mentioned in transcript")
    attendees: List[str] = Field(default_factory=list, description="List of recognized attendees / speakers")
    overview: str = Field(description="Comprehensive executive summary of the meeting")
    key_points: List[KeyPoint] = Field(default_factory=list, description="Synthesized discussion points")
    decisions: List[Decision] = Field(default_factory=list, description="Explicit decisions made in meeting")
    action_items: List[ActionItem] = Field(default_factory=list, description="Action items with owners & deadlines")
    verification_report: VerificationReport = Field(description="Deterministic audit report (quotes, owners, deadlines)")
    metadata: TranscriptMetadata = Field(description="Pipeline processing metadata and telemetry")

