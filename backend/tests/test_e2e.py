"""End-to-end integration test for CiteVerify."""

import os
import io
from fastapi.testclient import TestClient
from app.main import app
from pypdf import PdfWriter

client = TestClient(app)


def create_sample_pdf() -> bytes:
    """Create a minimal real PDF with academic statements."""
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    stream = io.BytesIO()
    writer.write(stream)
    stream.seek(0)
    return stream.getvalue()


def test_full_auth_and_document_lifecycle():
    # 1. Signup
    signup_data = {
        "email": "researcher@citeverify.edu",
        "password": "securepassword123",
        "full_name": "Dr. Alan Turing",
    }
    signup_resp = client.post("/api/auth/signup", json=signup_data)
    # If already created in prior run, accept 200 or 400
    if signup_resp.status_code == 200:
        token = signup_resp.json()["access_token"]
    else:
        # 2. Login
        login_resp = client.post(
            "/api/auth/login",
            json={"email": "researcher@citeverify.edu", "password": "securepassword123"},
        )
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Check /api/auth/me
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    user = me_resp.json()
    assert user["email"] == "researcher@citeverify.edu"

    # 4. Upload PDF document
    pdf_bytes = create_sample_pdf()
    files = {"file": ("attention_is_all_you_need.pdf", pdf_bytes, "application/pdf")}
    upload_resp = client.post("/api/documents/upload", headers=headers, files=files)
    assert upload_resp.status_code == 201
    doc = upload_resp.json()
    assert doc["filename"] == "attention_is_all_you_need.pdf"
    doc_id = doc["id"]

    # 5. List documents
    list_resp = client.get("/api/documents", headers=headers)
    assert list_resp.status_code == 200
    docs = list_resp.json()["documents"]
    assert any(d["id"] == doc_id for d in docs)

    # 6. Check document status
    status_resp = client.get(f"/api/documents/{doc_id}/status", headers=headers)
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert "status" in status_data
