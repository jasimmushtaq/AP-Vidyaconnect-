# ============================================================================
# FastAPI Server — Meeting Transcript Summarizer REST API (api.py)
# ============================================================================

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from .models import MeetingSummary
from .validators import TranscriptValidationError
from .pipeline import run_pipeline, TRANSCRIPT_SIZE_THRESHOLD_WORDS, CHUNK_SIZE_WORDS, CHUNK_OVERLAP_WORDS

app = FastAPI(
    title="Meeting Transcript Summarization Service",
    description="Deterministic verified LLM summarizer with dynamic chunking, map-reduce, and quote verification.",
    version="1.0.0",
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextSummarizeRequest(BaseModel):
    text: str = Field(description="Raw transcript text pasted by user")
    provider: str = Field(default="auto", description="LLM provider: 'auto', 'mock', 'gemini', 'anthropic'")


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "meeting-transcript-summarizer",
        "version": "1.0.0",
    }


@app.get("/api/architecture")
def get_architecture_spec():
    """Returns the operational architecture details conforming to the design diagram."""
    return {
        "title": "Meeting Transcript Summarization System Architecture",
        "steps": [
            {
                "step": 1,
                "name": "User Input",
                "types": ["paste text", "upload .txt"],
            },
            {
                "step": 2,
                "name": "Validation",
                "module": "validators.py",
                "checks": ["Format check (.txt)", "Non-empty check", "Word count bounds", "Sanitization"],
            },
            {
                "step": 3,
                "name": "Preprocess",
                "features": ["clean", "line numbers", "speaker detect"],
            },
            {
                "step": 4,
                "name": "Transcript size?",
                "threshold_words": TRANSCRIPT_SIZE_THRESHOLD_WORDS,
                "branch_small": {
                    "condition": "<= 4000 words",
                    "action": "Single-pass LLM call",
                },
                "branch_large": {
                    "condition": "> 4000 words",
                    "chunker": f"{CHUNK_SIZE_WORDS}-word chunks + {CHUNK_OVERLAP_WORDS}-word overlap",
                    "map": "Extract per chunk",
                    "reduce": "merge · dedupe · resolve",
                },
            },
            {
                "step": 5,
                "name": "Verifier",
                "type": "deterministic, no LLM",
                "checks": ["quotes (verbatim in source lines)", "owners (attendee registry match)", "deadlines (date/relative parser)"],
            },
            {
                "step": 6,
                "name": "MeetingSummary",
                "schema": "Pydantic schema",
            },
        ],
    }


@app.post("/api/summarize/text", response_model=MeetingSummary)
def summarize_text(request: TextSummarizeRequest):
    """Summarizes raw pasted transcript text."""
    try:
        summary = run_pipeline(
            input_data=request.text,
            filename=None,
            provider_name=request.provider,
        )
        return summary
    except TranscriptValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline error: {str(e)}",
        )


@app.post("/api/summarize/file", response_model=MeetingSummary)
async def summarize_file(
    file: UploadFile = File(...),
    provider: str = Form(default="auto"),
):
    """Summarizes an uploaded .txt transcript file."""
    try:
        content_bytes = await file.read()
        summary = run_pipeline(
            input_data=content_bytes,
            filename=file.filename,
            provider_name=provider,
        )
        return summary
    except TranscriptValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline error: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api:app", host="127.0.0.1", port=8000, reload=True)

