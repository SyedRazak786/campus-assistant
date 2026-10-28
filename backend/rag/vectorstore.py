"""
Step: Vector Store
Builds / loads the FAISS index, keeps it cached in memory (so answering a
question does not re-read the disk), and supports adding or removing one
document at a time.

Embedding is done in batches with a pause between them to stay under the
Gemini free-tier limit (100 embedding requests per minute).
"""

import threading
import time

from langchain_community.vectorstores import FAISS
from rag.embeddings import get_embedding_model

INDEX_PATH = "vector_store"
BATCH_SIZE = 90
PAUSE_SECONDS = 65

_write_lock = threading.RLock()
_store = None  # cached index


def _embed_into(store, chunks):
    """Embed chunks in rate-limit-safe batches, adding them to `store`
    (or creating the store if it is None). Returns the store."""
    embeddings = get_embedding_model()
    total_batches = (len(chunks) + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        print(f"  Embedding batch {i // BATCH_SIZE + 1}/{total_batches} ({len(batch)} chunks)...")

        if store is None:
            store = FAISS.from_documents(batch, embeddings)
        else:
            store.add_documents(batch)

        if i + BATCH_SIZE < len(chunks):
            print(f"  Pausing {PAUSE_SECONDS}s to stay under rate limit...")
            time.sleep(PAUSE_SECONDS)

    return store


def build_vectorstore(chunks):
    """Build a brand-new index from all chunks and save it to disk."""
    global _store
    with _write_lock:
        store = _embed_into(None, chunks)
        store.save_local(INDEX_PATH)
        _store = store
        return store


def load_vectorstore():
    """Load the saved FAISS index from disk."""
    embeddings = get_embedding_model()
    return FAISS.load_local(INDEX_PATH, embeddings, allow_dangerous_deserialization=True)


def get_store():
    """The cached index (loaded from disk the first time it is needed)."""
    global _store
    if _store is None:
        with _write_lock:
            if _store is None:
                _store = load_vectorstore()
    return _store


def add_chunks(chunks):
    """Add chunks of one new document to the existing index and save."""
    global _store
    with _write_lock:
        try:
            store = get_store()
        except Exception:
            store = None  # no index yet - start a new one
        store = _embed_into(store, chunks)
        store.save_local(INDEX_PATH)
        _store = store


def remove_source(filename: str) -> int:
    """Remove every chunk that came from `filename`. Returns how many were removed."""
    global _store
    with _write_lock:
        try:
            store = get_store()
        except Exception:
            return 0

        ids = [
            doc_id
            for doc_id, doc in store.docstore._dict.items()
            if doc.metadata.get("source") == filename
        ]
        if ids:
            store.delete(ids)
            store.save_local(INDEX_PATH)
            _store = store
        return len(ids)