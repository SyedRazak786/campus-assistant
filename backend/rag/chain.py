"""
Step: RAG Chain
Wires retrieval (FAISS) + the Gemini LLM together so a question
in -> grounded answer out.
"""

import os
from langchain_google_genai import ChatGoogleGenerativeAI
from rag.vectorstore import get_store

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

PROMPT_TEMPLATE = """You are a helpful college assistant. Answer the
student's question using the context below, taken from official
college documents.

The context may use different wording than the question (e.g. the
student may write "3rd year 2nd sem" while the document says
"III Year II Semester" or "III-II") - treat these as the same thing.
Read the full context carefully and combine information from
multiple parts of it if needed to give a complete answer.

Only say you don't have the information if the context truly
contains nothing relevant to the question - don't refuse just
because the wording doesn't match exactly.

Context:
{context}

Question: {question}

Answer:"""


def get_answer(query: str) -> str:
    """
    Takes a student's question, retrieves relevant document chunks,
    and asks Gemini to answer using that context.
    """
    store = get_store()
    retriever = store.as_retriever(search_kwargs={"k": 8})

    relevant_docs = retriever.invoke(query)
    context = "\n\n".join(doc.page_content for doc in relevant_docs)

    prompt = PROMPT_TEMPLATE.format(context=context, question=query)

    llm = ChatGoogleGenerativeAI(
        model="gemini-3.5-flash",
        google_api_key=GEMINI_API_KEY,
        temperature=0.2,
    )

    response = llm.invoke(prompt)

    # Newer Gemini models can return content as a list of blocks
    # (text + internal metadata) instead of a plain string.
    if isinstance(response.content, list):
        text_parts = [
            block.get("text", "")
            for block in response.content
            if isinstance(block, dict) and block.get("type") == "text"
        ]
        return "".join(text_parts).strip()

    return response.content