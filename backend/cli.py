# ============================================================================
# CLI — Meeting Transcript Summarizer Command Line Interface (cli.py)
# ============================================================================

import sys
import json
import argparse
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.pipeline import run_pipeline


def main():
    parser = argparse.ArgumentParser(
        description="Meeting Transcript Summarizer with Deterministic Quote Verification"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--file", "-f", type=str, help="Path to .txt transcript file")
    group.add_argument("--text", "-t", type=str, help="Raw pasted transcript text string")

    parser.add_argument(
        "--provider", "-p", default="auto", choices=["auto", "mock", "gemini", "anthropic"],
        help="LLM provider (default: auto)"
    )
    parser.add_argument("--output", "-o", type=str, help="Optional output JSON file path")
    parser.add_argument("--indent", type=int, default=2, help="JSON indentation")

    args = parser.parse_args()

    try:
        input_data = Path(args.file) if args.file else args.text
        filename = args.file if args.file else None

        print(f"[*] Processing transcript using provider: '{args.provider}'...")
        summary = run_pipeline(
            input_data=input_data,
            filename=filename,
            provider_name=args.provider
        )

        json_output = summary.model_dump_json(indent=args.indent)

        if args.output:
            out_path = Path(args.output)
            out_path.write_text(json_output, encoding="utf-8")
            print(f"[+] Successfully wrote MeetingSummary to: {out_path}")
        else:
            print("\n" + "=" * 60)
            print("                MEETING SUMMARY (Pydantic Schema)")
            print("=" * 60)
            print(f"Title: {summary.title}")
            print(f"Routing Path: {summary.metadata.routing_path.upper()} ({summary.metadata.clean_word_count} words, {summary.metadata.num_chunks} chunk(s))")
            print(f"Attendees: {', '.join(summary.attendees)}")
            print(f"Verification: {'PASSED' if summary.verification_report.passed_verification else 'WARNED'}")
            print(f"  - Quotes: {summary.verification_report.quotes_passed}/{summary.verification_report.total_quotes_checked} verified verbatim")
            print(f"  - Owners: {summary.verification_report.owners_passed}/{summary.verification_report.total_owners_checked} matched to attendees")
            print(f"  - Deadlines: {summary.verification_report.deadlines_passed}/{summary.verification_report.total_deadlines_checked} validated")
            print("-" * 60)
            print(f"Overview:\n{summary.overview}\n")
            print("Action Items:")
            for item in summary.action_items:
                status = "[VERIFIED]" if item.all_verified else "[UNVERIFIED]"
                print(f"  {status} {item.id}: {item.task}")
                print(f"      Owner: {item.owner} | Deadline: {item.deadline} | Ref: {item.line_reference}")
                print(f"      Verbatim Quote: \"{item.quote}\"")
            print("=" * 60)

    except Exception as e:
        print(f"[!] Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

