from rag.ingest import load_documents

docs = load_documents()
for i, doc in enumerate(docs):
    print(f"--- Page {i} ---")
    print(f"Length: {len(doc.page_content)} characters")
    print(doc.page_content[:200])
    print()