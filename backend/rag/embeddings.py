"""
Step: Embeddings
Wraps the Gemini embedding model so other modules can just call
get_embedding_model() without worrying about setup.
"""

import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def get_embedding_model():
    """Returns a configured Gemini embeddings object."""
    return GoogleGenerativeAIEmbeddings(
        model="gemini-embedding-001",
        google_api_key=GEMINI_API_KEY,
    )
