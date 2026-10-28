"""
Quick test of the full RAG pipeline: ask a question, get an answer.
Usage: python test_chain.py
"""

from dotenv import load_dotenv
load_dotenv()

from rag.chain import get_answer

if __name__ == "__main__":
    question = "What is covered in Unit IV of the blockchain syllabus?"
    print(f"Question: {question}\n")
    answer = get_answer(question)
    print(f"Answer: {answer}")