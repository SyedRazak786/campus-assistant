"""
Run this once (or whenever documents change) to build the FAISS index.
Usage: python build_index.py
"""

from dotenv import load_dotenv
load_dotenv()

from rag.ingest import load_documents, split_documents
from rag.vectorstore import build_vectorstore

def main():
    print("Loading documents...")
    docs = load_documents()
    print(f"Loaded {len(docs)} pages.")

    print("Splitting into chunks...")
    chunks = split_documents(docs)
    print(f"Created {len(chunks)} chunks.")

    print("Embedding and building FAISS index (this calls the Gemini API)...")
    build_vectorstore(chunks)
    print("Done. Index saved to vector_store/")

if __name__ == "__main__":
    main()