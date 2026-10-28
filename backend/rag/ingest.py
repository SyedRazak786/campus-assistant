"""
Step: Document Ingestion
Reads PDF and TXT files from data/documents/. For PDF pages with no text
layer (scanned/photographed pages) it falls back to OCR.
"""

import io
import os
import glob

import pymupdf
import pytesseract
from PIL import Image
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

DOCS_PATH = "data/documents"

# Windows install location of Tesseract (ignored on machines where it doesn't exist)
_TESSERACT_WIN = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(_TESSERACT_WIN):
    pytesseract.pytesseract.tesseract_cmd = _TESSERACT_WIN


def _ocr_page(page) -> str:
    """Render a PDF page as an image and run OCR on it."""
    pix = page.get_pixmap(dpi=300)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    return pytesseract.image_to_string(img)


def load_file(path: str):
    """Load ONE .pdf or .txt file as a list of page-level Documents."""
    filename = os.path.basename(path)
    ext = os.path.splitext(filename)[1].lower()
    documents = []

    if ext == ".txt":
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read().strip()
        documents.append(Document(page_content=text, metadata={"source": filename, "page": 1}))
        return documents

    if ext == ".pdf":
        pdf = pymupdf.open(path)
        try:
            for page_num in range(len(pdf)):
                page = pdf[page_num]
                text = page.get_text().strip()

                if not text:
                    print(f"  [OCR] {filename} page {page_num + 1} has no text layer, running OCR...")
                    text = _ocr_page(page).strip()

                documents.append(
                    Document(
                        page_content=text,
                        metadata={"source": filename, "page": page_num + 1},
                    )
                )
        finally:
            pdf.close()
        return documents

    return documents


def load_documents():
    """Load every PDF and TXT file in the documents folder."""
    documents = []
    paths = sorted(
        glob.glob(os.path.join(DOCS_PATH, "*.pdf")) + glob.glob(os.path.join(DOCS_PATH, "*.txt"))
    )
    for path in paths:
        documents.extend(load_file(path))
    return documents


def split_documents(documents):
    """Split loaded documents into overlapping chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=250,
    )
    return splitter.split_documents(documents)