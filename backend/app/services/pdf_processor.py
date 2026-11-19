"""Universal document text extraction — PDF, DOCX, ODT, TXT, MD, README, and more."""

from typing import List, Dict
import logging
import os

logger = logging.getLogger(__name__)

# Supported file extensions → extraction method
SUPPORTED_EXTENSIONS = {
    ".pdf":    "pdf",
    ".docx":   "docx",
    ".doc":    "docx",
    ".odt":    "odt",
    ".odp":    "odp",
    ".pptx":   "pptx",
    ".ppt":    "pptx",
    ".txt":    "text",
    ".md":     "text",
    ".markdown": "text",
    ".rst":    "text",
    ".tex":    "text",
    ".rtf":    "rtf",
    ".html":   "html",
    ".htm":    "html",
}

# Human-readable label for UI/error messages
SUPPORTED_EXTENSIONS_LABEL = (
    "PDF, DOCX, DOC, ODT, ODP, PPTX, TXT, MD, RST, TEX, RTF, HTML"
)


def _get_ext(path: str) -> str:
    return os.path.splitext(path)[1].lower()


class PDFProcessor:
    """Extract text from many document types and chunk it for processing."""

    def __init__(self, chunk_size: int = 400, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    # ------------------------------------------------------------------ #
    # Public API                                                           #
    # ------------------------------------------------------------------ #

    def extract_text(self, file_path: str) -> List[Dict]:
        """
        Extract text from any supported document, page by page.

        Returns:
            List of dicts: [{"page_number": 1, "text": "..."}, ...]
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = _get_ext(file_path)
        method = SUPPORTED_EXTENSIONS.get(ext)

        if method == "pdf":
            return self._extract_pdf(file_path)
        elif method == "docx":
            return self._extract_docx(file_path)
        elif method == "odt":
            return self._extract_odt(file_path)
        elif method == "odp":
            return self._extract_odp(file_path)
        elif method == "pptx":
            return self._extract_pptx(file_path)
        elif method == "text":
            return self._extract_text_file(file_path)
        elif method == "rtf":
            return self._extract_rtf(file_path)
        elif method == "html":
            return self._extract_html(file_path)
        else:
            # Try plain-text fallback for unknown files (e.g. README, .bib)
            return self._extract_text_file(file_path)

    def get_page_count(self, file_path: str) -> int:
        """Return best-effort page count."""
        ext = _get_ext(file_path)
        if ext == ".pdf":
            return self._pdf_page_count(file_path)
        pages = self.extract_text(file_path)
        return max(len(pages), 1)

    def chunk_pages(self, pages: List[Dict]) -> List[Dict]:
        """Chunk extracted pages into smaller pieces for embedding and retrieval."""
        chunks = []
        chunk_index = 0

        for page_data in pages:
            page_number = page_data["page_number"]
            text = page_data["text"]
            words = text.split()

            if not words:
                continue

            start = 0
            while start < len(words):
                end = start + self.chunk_size
                chunk_text = " ".join(words[start:end])
                if chunk_text.strip():
                    chunks.append({
                        "chunk_text": chunk_text,
                        "page_number": page_number,
                        "chunk_index": chunk_index,
                    })
                    chunk_index += 1
                start += self.chunk_size - self.chunk_overlap
                if start >= len(words):
                    break

        logger.info(f"Created {len(chunks)} chunks from {len(pages)} pages")
        return chunks

    def process_pdf(self, file_path: str) -> tuple:
        """
        Full pipeline: extract text and create chunks.
        (Kept as `process_pdf` for backward compatibility — now works on all types.)
        """
        pages = self.extract_text(file_path)
        chunks = self.chunk_pages(pages)
        page_count = self.get_page_count(file_path) or len(pages)
        return pages, chunks, page_count

    # ------------------------------------------------------------------ #
    # Extractors                                                           #
    # ------------------------------------------------------------------ #

    def _extract_pdf(self, path: str) -> List[Dict]:
        pages: List[Dict] = []
        extracted = False

        # Try pypdf first
        try:
            import pypdf
            reader = pypdf.PdfReader(path)
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages.append({"page_number": idx + 1, "text": text.strip()})
            extracted = bool(pages)
            logger.info(f"pypdf extracted {len(pages)} pages")
        except Exception as e:
            logger.warning(f"pypdf failed: {e}")

        if not extracted:
            try:
                import pdfplumber
                pages = []
                with pdfplumber.open(path) as pdf:
                    for idx, page in enumerate(pdf.pages):
                        text = page.extract_text() or ""
                        if text.strip():
                            pages.append({"page_number": idx + 1, "text": text.strip()})
                extracted = bool(pages)
                logger.info(f"pdfplumber extracted {len(pages)} pages")
            except Exception as e:
                logger.warning(f"pdfplumber failed: {e}")

        if not extracted:
            try:
                import fitz
                doc = fitz.open(path)
                pages = []
                for idx in range(len(doc)):
                    text = doc[idx].get_text("text") or ""
                    if text.strip():
                        pages.append({"page_number": idx + 1, "text": text.strip()})
                doc.close()
                logger.info(f"fitz extracted {len(pages)} pages")
            except Exception as e:
                logger.error(f"fitz failed: {e}")

        return pages

    def _extract_docx(self, path: str) -> List[Dict]:
        try:
            from docx import Document as DocxDoc
            doc = DocxDoc(path)
            full_text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            return self._split_into_virtual_pages(full_text)
        except ImportError:
            logger.warning("python-docx not installed; trying fallback")
        except Exception as e:
            logger.warning(f"docx extraction failed: {e}")

        # Fallback: treat as zip and read XML
        return self._extract_text_file(path)

    def _extract_odt(self, path: str) -> List[Dict]:
        try:
            from odf.opendocument import load as odf_load
            from odf.text import P
            doc = odf_load(path)
            paragraphs = [
                str(p) for p in doc.getElementsByType(P) if str(p).strip()
            ]
            return self._split_into_virtual_pages("\n".join(paragraphs))
        except ImportError:
            logger.warning("odfpy not installed; ODT extraction skipped")
        except Exception as e:
            logger.warning(f"ODT extraction failed: {e}")
        return [{"page_number": 1, "text": "ODT extraction requires odfpy package."}]

    def _extract_odp(self, path: str) -> List[Dict]:
        """ODP (OpenDocument Presentation) — extract slide text."""
        try:
            from odf.opendocument import load as odf_load
            from odf.draw import Page
            from odf.text import P
            doc = odf_load(path)
            pages: List[Dict] = []
            for slide_idx, slide in enumerate(doc.getElementsByType(Page), start=1):
                texts = [str(p) for p in slide.getElementsByType(P) if str(p).strip()]
                if texts:
                    pages.append({"page_number": slide_idx, "text": "\n".join(texts)})
            return pages or [{"page_number": 1, "text": ""}]
        except ImportError:
            logger.warning("odfpy not installed; ODP extraction skipped")
        except Exception as e:
            logger.warning(f"ODP extraction failed: {e}")
        return [{"page_number": 1, "text": "ODP extraction requires odfpy package."}]

    def _extract_pptx(self, path: str) -> List[Dict]:
        try:
            from pptx import Presentation
            prs = Presentation(path)
            pages: List[Dict] = []
            for slide_idx, slide in enumerate(prs.slides, start=1):
                texts = []
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text.strip():
                        texts.append(shape.text.strip())
                if texts:
                    pages.append({"page_number": slide_idx, "text": "\n".join(texts)})
            return pages or [{"page_number": 1, "text": ""}]
        except ImportError:
            logger.warning("python-pptx not installed; PPTX extraction skipped")
        except Exception as e:
            logger.warning(f"PPTX extraction failed: {e}")
        return [{"page_number": 1, "text": "PPTX extraction requires python-pptx package."}]

    def _extract_text_file(self, path: str) -> List[Dict]:
        """Read plain-text formats (TXT, MD, RST, TEX, README, etc.)."""
        try:
            for enc in ("utf-8", "latin-1", "cp1252"):
                try:
                    with open(path, "r", encoding=enc) as f:
                        text = f.read()
                    break
                except UnicodeDecodeError:
                    continue
            else:
                return [{"page_number": 1, "text": ""}]

            return self._split_into_virtual_pages(text)
        except Exception as e:
            logger.warning(f"Text file extraction failed: {e}")
            return [{"page_number": 1, "text": ""}]

    def _extract_rtf(self, path: str) -> List[Dict]:
        try:
            from striprtf.striprtf import rtf_to_text
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                raw = f.read()
            return self._split_into_virtual_pages(rtf_to_text(raw))
        except ImportError:
            logger.warning("striprtf not installed; falling back to raw text")
            return self._extract_text_file(path)
        except Exception as e:
            logger.warning(f"RTF extraction failed: {e}")
            return self._extract_text_file(path)

    def _extract_html(self, path: str) -> List[Dict]:
        try:
            from bs4 import BeautifulSoup
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                soup = BeautifulSoup(f.read(), "html.parser")
            text = soup.get_text(separator="\n")
            return self._split_into_virtual_pages(text)
        except ImportError:
            logger.warning("beautifulsoup4 not installed; using raw text fallback")
            return self._extract_text_file(path)
        except Exception as e:
            logger.warning(f"HTML extraction failed: {e}")
            return self._extract_text_file(path)

    # ------------------------------------------------------------------ #
    # Helpers                                                              #
    # ------------------------------------------------------------------ #

    def _split_into_virtual_pages(self, text: str, words_per_page: int = 500) -> List[Dict]:
        """Split a flat text blob into virtual pages of ~500 words each."""
        words = text.split()
        if not words:
            return [{"page_number": 1, "text": ""}]
        pages: List[Dict] = []
        for i, start in enumerate(range(0, len(words), words_per_page), start=1):
            chunk = " ".join(words[start: start + words_per_page])
            if chunk.strip():
                pages.append({"page_number": i, "text": chunk})
        return pages or [{"page_number": 1, "text": ""}]

    def _pdf_page_count(self, path: str) -> int:
        try:
            import pypdf
            return len(pypdf.PdfReader(path).pages)
        except Exception:
            pass
        try:
            import pdfplumber
            with pdfplumber.open(path) as pdf:
                return len(pdf.pages)
        except Exception:
            pass
        try:
            import fitz
            doc = fitz.open(path)
            count = len(doc)
            doc.close()
            return count
        except Exception:
            pass
        return 1


pdf_processor = PDFProcessor()
