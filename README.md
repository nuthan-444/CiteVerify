# 📄 CiteVerify — AI-Powered Academic Citation & Claim Verification Platform

[![Python](https://img.shields.io/badge/Python-3.12-black?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-black?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-black?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-black?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-black?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-pgvector-black?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

> **CiteVerify** is an enterprise-grade AI research integrity platform that audits academic papers and documents. It extracts verifiable factual claims with exact page/section attribution, cross-checks them against live academic databases (Crossref, OpenAlex, Tavily), performs dense vector RAG semantic evidence matching, and delivers mathematically calculated Trust Scores with multi-format audit reports.

---

## 📑 Table of Contents

- [Key Highlights & Zero-Mock Policy](#-key-highlights--zero-mock-policy)
- [System Architecture](#-system-architecture)
- [Multi-Format Document Support](#-multi-format-document-support)
- [Verification & Trust Score Engine](#-verification--trust-score-engine)
- [Design System & Micro-Interactions](#-design-system--micro-interactions)
- [API Reference](#-api-reference)
- [Tech Stack](#-tech-stack)
- [Local Development Setup](#-local-development-setup)
- [Testing](#-running-automated-tests)
- [Production Deployment Guide](#-production-deployment-guide)
  - [Frontend on Vercel](#1-deploying-frontend-on-vercel)
  - [Backend on Render / Railway](#2-deploying-backend-on-render--railway)
  - [Database on Neon](#3-database-neon-postgresql)
- [Environment Variables](#-environment-variables)
- [License](#-license)

---

## 🌟 Key Highlights & Zero-Mock Policy

1. **Strict Zero-Mock Policy**: Every claim, DOI, abstract, and verdict is generated live through real LLM evaluation, real academic database APIs, and real vector math.
2. **Multi-Source Evidence Retrieval**:
   - **Crossref API**: Official DOI resolution, canonical paper titles, authors, and publication dates.
   - **OpenAlex API**: Global citation graph indexation, abstract inverted index parsing, and academic venue data.
   - **Tavily Web Search**: High-precision AI search engine for non-indexed preprint literature and web sources.
3. **Pydantic Type Safety**: All Groq LLM completions are validated against strict Pydantic v2 schemas.
4. **Page-Level Traceability**: Extracted claims and matched evidence always preserve exact source page numbers and sections.
5. **Mobile-First Responsive UI**: Full responsive layout with collapsible slide-over history drawer, swipeable tab navigation, and touch-optimized controls.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Frontend: React 19 + Vite SPA            │
│  - Tailwind CSS v4 Monochrome Design System            │
│  - React Bits Micro-Interactions & Aceternity UI       │
│  - Responsive Slide-over Sidebar Drawer & Audio Chimes │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (Bearer JWT Auth)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Backend: FastAPI (Python 3.12)           │
│  - Async Multi-Stage Background Verification Pipeline  │
│  - SQLAlchemy 2.0 ORM + Connection Pooling             │
│  - Dynamic CORS Middleware (Localhost + Cloud)         │
└───────┬───────────────────┬───────────────────┬────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Doc Engine │    │  AI & Search │    │ Database & RAG  │
│ - PyMuPDF    │    │ - Groq LLM   │    │ - Neon Postgres │
│ - python-docx│    │ - Crossref   │    │ - pgvector      │
│ - odfpy      │    │ - OpenAlex   │    │ - 384-dim Dense │
│ - pptx/bs4   │    │ - Tavily Web │    │   Embeddings    │
└──────────────┘    └──────────────┘    └─────────────────┘
```

### Verification Pipeline Workflow

```mermaid
flowchart TD
    A["Uploaded Document\n(PDF, DOCX, ODT, TXT, etc.)"] --> B["Document Processor\n(Page Extraction & Chunking)"]
    B --> C["Dense Vector Embedding\n(384-dim Semantic Chunks)"]
    C --> D["Claim Extraction\n(Groq LLM + Pydantic Schema)"]
    D --> E["Citation Retrieval\n(Crossref, OpenAlex, Tavily)"]
    E --> F["RAG Evidence Matcher\n(Cosine Similarity on Chunks)"]
    F --> G["Veracity Verdict Engine\n(Supported / Contradicted / Insufficient)"]
    G --> H["Trust Score Calculation\n(Weighted Confidence Matrix)"]
    H --> I["Comprehensive Report\n(HTML, JSON, PDF, DOCX, Markdown)"]
```

---

## 📂 Multi-Format Document Support

CiteVerify accepts an extensive range of academic and technical document formats:

| Format | Extension | Processing Engine |
|---|---|---|
| **Adobe PDF** | `.pdf` | PyMuPDF (fitz) with `pdfplumber` & `pypdf` fallbacks |
| **Microsoft Word** | `.docx`, `.doc` | `python-docx` text extraction |
| **OpenDocument Text** | `.odt` | `odfpy` XML structure parser |
| **OpenDocument Presentation** | `.odp` | `odfpy` slide drawer extractor |
| **PowerPoint** | `.pptx`, `.ppt` | `python-pptx` text block parser |
| **Plain Text / Markdown** | `.txt`, `.md`, `.markdown` | UTF-8 / Latin-1 virtual page chunker |
| **LaTeX / Scientific** | `.tex`, `.bib`, `.rst` | Structured markup reader |
| **Rich Text / Web** | `.rtf`, `.html`, `.htm` | `striprtf` / `BeautifulSoup4` parser |
| **Data / Readme** | `.csv`, `README*` | Delimited / plain text analyzer |

---

## 🧮 Verification & Trust Score Engine

CiteVerify calculates a **Trust Score (0–100%)** based on verifiable statement veracity and evidence confidence weights:

$$\text{Trust Score} = \frac{\sum (\text{Confidence} \times \text{Verdict Weight})}{\text{Total Verdict Weights}} \times 100$$

* **Supported Claim**: Weight = `1.0`, Score Contribution = `+Confidence`
* **Contradicted Claim**: Weight = `1.0`, Score Contribution = `+(1.0 - Confidence) * 0.2`
* **Insufficient Evidence**: Weight = `0.5`, Score Contribution = `+0.5`

### Classification Tiers
* **High Integrity (≥ 70%)**: Solid citation foundation; claims consistently supported by cited literature.
* **Moderate Integrity (40% – 69%)**: Mixed evidence; manual review recommended before publication.
* **Low Integrity (< 40%)**: Significant citation anomalies or contradicted claims identified.

---

## 🎨 Design System & Micro-Interactions

CiteVerify features a **pure monochrome luxury aesthetic** (black, white, and neutral grays) integrated with cutting-edge micro-interactions:

* **Sling Button** (`SlingButton.tsx`): Spring-physics slingshot interaction powered by damped harmonic oscillators. Pull and release to launch the audit.
* **Lattice Loader** (`LatticeLoader.tsx`): Phase-offset pulsing grid loader with live elapsed stopwatch timer.
* **Star Border** (`StarBorder.tsx`): Radial gradient star glow rotating smoothly along rounded button borders.
* **Gooey Search Input** (`GooeyInput.tsx`): SVG blob filter merging search shapes with crisp text input.
* **Bell Toggle & Audio Chimes** (`BellToggle.tsx`): Physics-based damped bell swing with dual-sine Web Audio API sound alerts when background audits complete.
* **Download Switch & Format Panel** (`ReportView.tsx`): Dropdown panel supporting export to **HTML, JSON, PDF, DOCX, ODT, TXT, CSV, and Markdown**.
* **Responsive Mobile Drawer** (`Sidebar.tsx`): Full slide-over drawer with backdrop blur for audit history on smartphones.

---

## 🔌 API Reference

### Authentication
* `POST /api/auth/signup` — Create a researcher account (`email`, `password`, `name`).
* `POST /api/auth/login` — Sign in and receive a Bearer JWT token.

### Documents
* `POST /api/documents/upload` — Upload any supported academic file (`multipart/form-data`).
* `GET /api/documents` — List user's audited documents with pagination & search.
* `GET /api/documents/{id}` — Get single document metadata and trust score.
* `POST /api/documents/{id}/process` — Trigger the background verification pipeline.
* `GET /api/documents/{id}/status` — Poll current pipeline stage and progress.
* `DELETE /api/documents/{id}` — Delete a document and all related audit data.

### Claims & Verification
* `GET /api/documents/{id}/claims` — Retrieve all extracted factual claims.
* `GET /api/documents/{id}/citations` — Retrieve all cross-checked academic citations.
* `GET /api/documents/{id}/verification` — Retrieve veracity verdicts and evidence quotes.
* `GET /api/documents/{id}/report?format={html|json}` — Download complete verification report.

### Health
* `GET /` & `GET /api/health` — Platform status & Neon database connectivity check.

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS v4, Lucide React Icons
* **Animation & Physics:** Web Animations API, SVG Filters, Web Audio API
* **Routing & HTTP:** React Router v7, Axios

### Backend
* **Framework:** FastAPI, Uvicorn, Pydantic v2, Python-Jose (JWT)
* **Database & ORM:** Neon Serverless PostgreSQL, SQLAlchemy 2.0, pgvector
* **AI & LLM:** Groq API (`openai/gpt-oss-120b` & `llama-3.3-70b-versatile`)
* **Academic APIs:** Crossref REST API, OpenAlex API, Tavily Search API
* **Document Processing:** PyMuPDF, pdfplumber, pypdf, python-docx, odfpy, python-pptx, BeautifulSoup4

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js** (v18 or higher)
* **Python** (v3.10, 3.11, or 3.12)
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/citeverify.git
cd citeverify
```

### 2. Configure Environment Variables
Create a `.env` file inside `backend/`:
```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@YOUR_NEON_HOST/neondb?sslmode=require
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
JWT_SECRET=super-secret-jwt-key-for-local-dev
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Start the Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at **http://localhost:8000** (Swagger docs at **http://localhost:8000/docs**).

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🧪 Running Automated Tests

CiteVerify includes an automated test suite covering authentication, health checks, document chunking, and Pydantic claim schema validation:

```bash
cd backend
python -m pytest tests/ -v
```

---

## 🌐 Production Deployment Guide

### 1. Deploying Frontend on Vercel
1. Push your repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com/) → **New Project** → select your repo.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
5. Click **Deploy**. Vercel will build with `npm run build` using [`frontend/vercel.json`](file:///c:/Users/nimit/OneDrive/Desktop/Nuthan%20Prasad/Hackathon/frontend/vercel.json) for clean client-side SPA routing.

### 2. Deploying Backend on Render / Railway

#### Option A: Render
1. Go to [Render Dashboard](https://dashboard.render.com/) → **New Web Service** → connect repo.
2. Configure settings:
   * **Root Directory:** `backend`
   * **Runtime:** `Python 3`
   * **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   * **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   * `PYTHON_VERSION`: `3.12.7`
   * `DATABASE_URL`: `postgresql://...` (your Neon connection string)
   * `GROQ_API_KEY`: your Groq API key
   * `TAVILY_API_KEY`: your Tavily API key
   * `JWT_SECRET`: your secret key
   * `CORS_ORIGINS`: `https://your-app.vercel.app,http://localhost:5173`
4. Deploy!

#### Option B: Railway (Zero-Config)
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**.
2. Set Root Directory to `backend`.
3. Add environment variables (`DATABASE_URL`, `GROQ_API_KEY`, etc.).
4. Railway automatically detects `requirements.txt` and binds `$PORT` with zero manual configuration.

### 3. Database (Neon PostgreSQL)
1. Sign up at [neon.tech](https://neon.tech) and create a project.
2. Copy the Connection String (`postgresql://...`).
3. Set `DATABASE_URL` in your backend environment variables.
4. Tables and schemas are automatically generated on application startup by SQLAlchemy.

---

## 🔑 Environment Variables

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection URI | `postgresql://user:pass@host/db?sslmode=require` |
| `GROQ_API_KEY` | API key from Groq console | `gsk_...` |
| `GROQ_MODEL` | Default model for LLM operations | `openai/gpt-oss-120b` |
| `TAVILY_API_KEY` | API key for Tavily Web Search | `tvly-...` |
| `JWT_SECRET` | Secret key for signing auth tokens | Any secure 32+ character string |
| `JWT_ALGORITHM` | Hashing algorithm | `HS256` |
| `JWT_EXPIRATION_HOURS` | Token validity duration | `24` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `https://your-app.vercel.app,http://localhost:5173` |
| `VITE_API_URL` | Frontend API target endpoint | `https://your-backend.onrender.com/api` |

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details. Built for academic integrity and verifiable scientific research.
