import logging
import time
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag_system import RAGSystem


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="YouTube AI Chatbot Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    video_id: str
    history: Optional[List[Dict[str, Any]]] = []


class ProcessVideoRequest(BaseModel):
    video_id: str


# Initialize RAG system
rag_system = RAGSystem()


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
    except Exception as exc:
        logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, str(exc))
        raise
    duration_ms = (time.time() - start_time) * 1000
    logger.info("%s %s -> %s (%.1f ms)", request.method, request.url.path, response.status_code, duration_ms)
    return response


@app.get("/status")
def status() -> Dict[str, str]:
    return {"status": "active", "message": "Backend is running"}


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True, "llm": "groq", "embeddings": "fastembed"}


@app.post("/chat")
def chat(payload: ChatRequest) -> Dict[str, str]:
    try:
        if not payload.message:
            raise HTTPException(status_code=400, detail="Message is required")
        if not payload.video_id:
            raise HTTPException(status_code=400, detail="Video ID is required")

        response = rag_system.process_query(
            payload.message,
            payload.video_id,
            payload.history or [],
        )
        return {"response": response}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error processing chat request: %s", str(exc))
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/process-video")
def process_video(payload: ProcessVideoRequest) -> Dict[str, Any]:
    try:
        if not payload.video_id:
            raise HTTPException(status_code=400, detail="Video ID is required")

        result = rag_system.process_video(payload.video_id)
        return result
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error processing video: %s", str(exc))
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/")
def home() -> Dict[str, str]:
    return {"message": "Welcome to the YouTube AI Chatbot Backend!"}