# College Knowledge Assistant (RAG + LangChain)

AI assistant that answers student questions using official college
documents (syllabus, notices, academic calendar) via Retrieval-Augmented
Generation.

## Stack
- Frontend: React (Vite)
- Backend: FastAPI (Python)
- RAG: LangChain + FAISS + Gemini API

## Setup (Backend)
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env         # then add your GEMINI_API_KEY
uvicorn main:app --reload
```

## Setup (Frontend)
```bash
cd frontend
npm install
npm run dev
```

## Status
Scaffold only — RAG pipeline (ingest → embed → retrieve → answer) is
stubbed and will be filled in step by step.
