"""Test PDF processor text extraction and chunking."""

import os
import io
from app.services.pdf_processor import PDFProcessor
from pypdf import PdfWriter


def test_chunking_preserves_page_numbers():
    processor = PDFProcessor(chunk_size=10, chunk_overlap=2)
    fake_pages = [
        {"page_number": 1, "text": "This is page one text with several words to test chunking behaviour."},
        {"page_number": 2, "text": "Page two has different statements and citations [1] that must be preserved."},
    ]

    chunks = processor.chunk_pages(fake_pages)
    assert len(chunks) >= 2
    assert chunks[0]["page_number"] == 1
    assert "page_number" in chunks[-1]
    assert chunks[-1]["page_number"] == 2
    assert "chunk_text" in chunks[0]


def test_process_pdf_returns_three_values(tmp_path):
    processor = PDFProcessor()
    test_pdf = tmp_path / "test.pdf"
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    with open(test_pdf, "wb") as f:
        writer.write(f)

    res = processor.process_pdf(str(test_pdf))
    assert len(res) == 3
    pages, chunks, page_count = res
    assert page_count == 1
