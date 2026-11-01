# ============================================================================
# Verifier — Deterministic, Zero-LLM Verification Engine (verifier.py)
# quotes · owners · deadlines
# ============================================================================

import re
from datetime import datetime
from typing import List, Dict, Tuple, Optional
from dateutil import parser as date_parser

from .models import MeetingSummary, ActionItem, Decision, VerificationReport
from .preprocessor import PreprocessedTranscript


# Common relative deadline patterns
RELATIVE_DEADLINE_PATTERNS = [
    re.compile(r"\b(?:by|before|until|due)?\s*(?:eod|end of day|end of the day)\b", re.IGNORECASE),
    re.compile(r"\b(?:by|before|until|due)?\s*(?:eow|end of week|end of the week)\b", re.IGNORECASE),
    re.compile(r"\b(?:by|before|until|due)?\s*(?:next|this)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b", re.IGNORECASE),
    re.compile(r"\b(?:by|before|until|due)?\s*(?:tomorrow|tonight)\b", re.IGNORECASE),
    re.compile(r"\b(?:within|in)\s+\d+\s+(?:days?|weeks?|months?|hours?)\b", re.IGNORECASE),
    re.compile(r"\b(?:q[1-4]|quarter\s*[1-4])\b", re.IGNORECASE),
    re.compile(r"\b(?:by|before)?\s*(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?\b", re.IGNORECASE),
    re.compile(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b"),
    re.compile(r"\b\d{4}-\d{2}-\d{2}\b"),
]


def normalize_for_matching(text: str) -> str:
    """Removes punctuation and normalizes whitespace for robust quote comparison."""
    cleaned = re.sub(r"[^\w\s]", "", text.lower())
    return re.sub(r"\s+", " ", cleaned).strip()


def find_quote_in_transcript(
    quote: str,
    preprocessed: PreprocessedTranscript,
) -> Tuple[bool, Optional[int], str]:
    """
    Deterministically searches for quote in preprocessed transcript without using LLM.
    
    Returns:
        (is_verified, line_number, detail_message)
    """
    if not quote or not quote.strip():
        return False, None, "No quote provided to verify."

    clean_q = quote.strip()
    norm_q = normalize_for_matching(clean_q)
    
    if not norm_q:
        return False, None, "Quote contains only whitespace or punctuation."

    # 1. Exact string match across lines
    for line_num, line_text in preprocessed.indexed_lines.items():
        if clean_q in line_text:
            return True, line_num, f"Exact verbatim match found on line L{line_num}."

    # 2. Case-insensitive & normalized whitespace match on single line
    for line_num, line_text in preprocessed.indexed_lines.items():
        norm_line = normalize_for_matching(line_text)
        if norm_q in norm_line:
            return True, line_num, f"Normalized verbatim match found on line L{line_num}."

    # 3. Check for multi-line span match (quote spanned across two consecutive lines)
    line_keys = sorted(preprocessed.indexed_lines.keys())
    for i in range(len(line_keys) - 1):
        l1 = line_keys[i]
        l2 = line_keys[i + 1]
        combined = f"{preprocessed.indexed_lines[l1]} {preprocessed.indexed_lines[l2]}"
        if norm_q in normalize_for_matching(combined):
            return True, l1, f"Multi-line verbatim match spanning lines L{l1}-L{l2}."

    # 4. Check if the entire transcript clean text contains the quote
    if norm_q in normalize_for_matching(preprocessed.clean_text):
        return True, None, "Verbatim match found in transcript body."

    return False, None, f"HALLUCINATION: Quote '{clean_q[:50]}...' was not found verbatim in source transcript."


def verify_owner(
    owner: Optional[str],
    detected_speakers: List[str],
) -> Tuple[bool, str]:
    """
    Deterministically validates whether an assigned owner exists among the detected meeting speakers.
    """
    if not owner or not owner.strip():
        return False, "Unassigned owner."

    clean_owner = owner.strip()
    owner_lower = clean_owner.lower()

    # Exact or case-insensitive match
    for spk in detected_speakers:
        if owner_lower == spk.lower():
            return True, f"Owner '{clean_owner}' verified as meeting attendee '{spk}'."

    # Token match (e.g. "Alice" matches "Alice Johnson", or "Dr. Smith" matches "Smith")
    owner_tokens = set(normalize_for_matching(clean_owner).split())
    for spk in detected_speakers:
        spk_tokens = set(normalize_for_matching(spk).split())
        if owner_tokens and owner_tokens.issubset(spk_tokens):
            return True, f"Owner '{clean_owner}' matched to attendee '{spk}'."
        if spk_tokens and spk_tokens.issubset(owner_tokens):
            return True, f"Owner '{clean_owner}' matched to attendee '{spk}'."

    return False, f"UNVERIFIED OWNER: '{clean_owner}' not found in detected speakers: {detected_speakers}."


def verify_deadline(
    deadline: Optional[str],
    supporting_quote: Optional[str] = None,
) -> Tuple[bool, Optional[str], str]:
    """
    Deterministically validates deadline string format and consistency without using LLM.
    """
    if not deadline or not deadline.strip():
        return True, None, "No deadline specified (optional)."

    clean_dl = deadline.strip()

    # 1. Check relative date patterns
    for pat in RELATIVE_DEADLINE_PATTERNS:
        if pat.search(clean_dl):
            return True, clean_dl, f"Relative deadline expression verified: '{clean_dl}'."

    # 2. Try dateutil parser
    try:
        parsed_dt = date_parser.parse(clean_dl, fuzzy=True)
        iso_format = parsed_dt.strftime("%Y-%m-%d")
        return True, iso_format, f"Absolute deadline parsed successfully: {iso_format}."
    except Exception:
        pass

    # 3. If deadline is mentioned in the quote, give contextual validation
    if supporting_quote and clean_dl.lower() in supporting_quote.lower():
        return True, clean_dl, f"Deadline found verbatim in supporting quote: '{clean_dl}'."

    return False, None, f"INVALID DEADLINE: Could not parse deadline format '{clean_dl}'."


def verify_meeting_summary(
    summary: MeetingSummary,
    preprocessed: PreprocessedTranscript,
) -> MeetingSummary:
    """
    Executes the deterministic verification engine on the generated MeetingSummary:
    1. Quotes verification: checks verbatim existence against indexed transcript lines.
    2. Owners verification: checks owners against detected speakers.
    3. Deadlines verification: checks format validity and presence.
    
    Updates the MeetingSummary in-place and attaches the detailed VerificationReport.
    """
    report = VerificationReport()
    speakers = preprocessed.detected_speakers

    # -------------------------------------------------------------------------
    # 1. Verify Action Items
    # -------------------------------------------------------------------------
    for item in summary.action_items:
        notes: List[str] = []

        # A. Quote verification
        report.total_quotes_checked += 1
        if item.quote:
            q_valid, line_num, q_msg = find_quote_in_transcript(item.quote, preprocessed)
            item.quote_verified = q_valid
            if q_valid:
                report.quotes_passed += 1
                if line_num and not item.line_reference:
                    item.line_reference = f"L{line_num}"
                notes.append(f"Quote: {q_msg}")
            else:
                report.quotes_failed += 1
                report.hallucinations_flagged += 1
                report.issues.append(f"Action '{item.id}': {q_msg}")
                notes.append(f"Quote Warning: {q_msg}")
        else:
            item.quote_verified = False
            report.quotes_failed += 1
            notes.append("No verbatim quote provided for action item.")

        # B. Owner verification
        report.total_owners_checked += 1
        if item.owner:
            o_valid, o_msg = verify_owner(item.owner, speakers)
            item.owner_verified = o_valid
            if o_valid:
                report.owners_passed += 1
                notes.append(f"Owner: {o_msg}")
            else:
                report.owners_failed += 1
                report.issues.append(f"Action '{item.id}': {o_msg}")
                notes.append(f"Owner Warning: {o_msg}")
        else:
            item.owner_verified = False
            report.owners_failed += 1
            notes.append("Unassigned owner.")

        # C. Deadline verification
        if item.deadline:
            report.total_deadlines_checked += 1
            d_valid, d_parsed, d_msg = verify_deadline(item.deadline, item.quote)
            item.deadline_verified = d_valid
            item.deadline_parsed = d_parsed
            if d_valid:
                report.deadlines_passed += 1
                notes.append(f"Deadline: {d_msg}")
            else:
                report.deadlines_failed += 1
                report.issues.append(f"Action '{item.id}': {d_msg}")
                notes.append(f"Deadline Warning: {d_msg}")
        else:
            item.deadline_verified = True
            item.deadline_parsed = None

        item.all_verified = bool(item.quote_verified and item.owner_verified and item.deadline_verified)
        item.verification_notes = notes

    # -------------------------------------------------------------------------
    # 2. Verify Decisions
    # -------------------------------------------------------------------------
    for dec in summary.decisions:
        # Quote verification on decisions
        if dec.quote:
            report.total_quotes_checked += 1
            q_valid, line_num, q_msg = find_quote_in_transcript(dec.quote, preprocessed)
            dec.quote_verified = q_valid
            if q_valid:
                report.quotes_passed += 1
                if line_num and not dec.line_reference:
                    dec.line_reference = f"L{line_num}"
            else:
                report.quotes_failed += 1
                report.hallucinations_flagged += 1
                report.issues.append(f"Decision '{dec.id}': {q_msg}")

        # Owner / proposer verification
        if dec.made_by:
            report.total_owners_checked += 1
            o_valid, o_msg = verify_owner(dec.made_by, speakers)
            dec.owner_verified = o_valid
            if o_valid:
                report.owners_passed += 1
            else:
                report.owners_failed += 1
                report.issues.append(f"Decision '{dec.id}': {o_msg}")

    # Set overall pass status
    report.passed_verification = bool(report.hallucinations_flagged == 0 and report.quotes_failed == 0)
    summary.verification_report = report
    return summary

