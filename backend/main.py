"""
FastAPI entry point for the College Knowledge Assistant.

  POST   /ask                        any logged-in user
  GET    /faculty/documents          faculty only
  POST   /faculty/upload             faculty only  (PDF / TXT file)
  POST   /faculty/note               faculty only  (typed text)
  DELETE /faculty/documents/{name}   faculty only
"""

import os
import re

from dotenv import load_dotenv

load_dotenv()

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import get_current_user, require_faculty
from rag import vectorstore
from rag.chain import get_answer
from rag.ingest import DOCS_PATH, load_file, split_documents

app = FastAPI(title="College Knowledge Assistant API")

origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_EXT = {".pdf", ".txt"}


class Question(BaseModel):
    query: str


class Note(BaseModel):
    title: str
    text: str


@app.get("/")
def root():
    return {"status": "College Knowledge Assistant API is running"}


@app.post("/ask")
def ask(question: Question, user: dict = Depends(get_current_user)):
    query = question.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Please type a question.")
    if len(query) > 1000:
        raise HTTPException(status_code=400, detail="Question is too long (max 1000 characters).")
    return {"answer": get_answer(query)}


# ---------------------------------------------------------------- faculty --


def _safe_filename(name: str):
    """Return (clean_filename, extension) - no folders, no odd characters."""
    base = os.path.basename(name or "")
    stem, ext = os.path.splitext(base)
    ext = ext.lower()
    stem = re.sub(r"[^A-Za-z0-9._ -]", "_", stem).strip(" .") or "document"
    return stem + ext, ext


def _ingest(filename: str, data: bytes) -> dict:
    """Save the file, read it, and add it to the knowledge base."""
    os.makedirs(DOCS_PATH, exist_ok=True)
    path = os.path.join(DOCS_PATH, filename)

    replaced = os.path.exists(path)
    if replaced:
        vectorstore.remove_source(filename)  # re-upload replaces the old version

    with open(path, "wb") as f:
        f.write(data)

    try:
        chunks = split_documents(load_file(path))
        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No readable text was found in this file.",
            )
        vectorstore.add_chunks(chunks)
    except HTTPException:
        os.remove(path)
        raise
    except Exception as err:
        os.remove(path)
        raise HTTPException(status_code=500, detail=f"Could not process the file: {err}")

    return {"filename": filename, "sections": len(chunks), "replaced": replaced}


@app.get("/faculty/documents")
def list_documents(user: dict = Depends(require_faculty)):
    items = []
    if os.path.isdir(DOCS_PATH):
        for name in sorted(os.listdir(DOCS_PATH)):
            path = os.path.join(DOCS_PATH, name)
            if os.path.isfile(path) and os.path.splitext(name)[1].lower() in ALLOWED_EXT:
                items.append({"name": name, "size": os.path.getsize(path)})
    return {"documents": items}


@app.post("/faculty/upload")
def upload_document(file: UploadFile = File(...), user: dict = Depends(require_faculty)):
    filename, ext = _safe_filename(file.filename)
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are allowed.")

    data = file.file.read(MAX_UPLOAD_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail="The file is empty.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File is too large (max 15 MB).")

    return _ingest(filename, data)


@app.post("/faculty/note")
def add_note(note: Note, user: dict = Depends(require_faculty)):
    title = note.title.strip()
    text = note.text.strip()
    if not title or not text:
        raise HTTPException(status_code=400, detail="Please enter both a title and the text.")
    if len(text) > 50000:
        raise HTTPException(status_code=413, detail="Text is too long (max 50,000 characters).")

    stem = re.sub(r"[^A-Za-z0-9 _-]", "", title).strip()[:60] or "note"
    filename = f"note - {stem}.txt"
    content = f"{title}\n\n{text}\n"
    return _ingest(filename, content.encode("utf-8"))


@app.delete("/faculty/documents/{filename}")
def delete_document(filename: str, user: dict = Depends(require_faculty)):
    if os.path.basename(filename) != filename:
        raise HTTPException(status_code=400, detail="Invalid file name.")

    path = os.path.join(DOCS_PATH, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Document not found.")

    removed = vectorstore.remove_source(filename)
    os.remove(path)
    return {"filename": filename, "sections_removed": removed}