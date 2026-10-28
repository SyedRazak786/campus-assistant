from dotenv import load_dotenv
load_dotenv()

from rag.vectorstore import load_vectorstore

query = "what is the unit-3 syllabus of BCT"

store = load_vectorstore()
retriever = store.as_retriever(search_kwargs={"k": 4})
docs = retriever.invoke(query)

print(f"Query: {query}")
print(f"Retrieved {len(docs)} chunks:")
for i, doc in enumerate(docs):
    print(f"--- Chunk {i+1} (source: {doc.metadata.get('source')}, page: {doc.metadata.get('page')}) ---")
    print(doc.page_content)
    print()
