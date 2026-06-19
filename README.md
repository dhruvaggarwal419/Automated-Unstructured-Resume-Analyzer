# A.U.R.A. — Automated Unstructured Resume Analyzer

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-green?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/MongoDB-Database-4EA94B?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

> A deterministic, four-module end-to-end pipeline for layout-aware resume parsing, cross-platform profile normalisation, dynamic weight-redistributed ATS scoring, and real-world candidate claim verification.

---

## 🚨 Problem Statement

Modern Applicant Tracking Systems (ATS) suffer from three critical failures:

| Failure | Description |
|---|---|
| **F1 — Typewriter Flaw** | PDF parsers read multi-column resumes row-by-row, destroying semantic meaning |
| **F2 — Zero Claim Verification** | GitHub commits, CP ratings, and portfolio links are accepted without any validation |
| **F3 — Scoring Bias** | Keyword-only matchers miss semantic equivalences; LLM-based screeners are non-deterministic |

A.U.R.A. addresses all three within a single, auditable, deterministic pipeline.

---

## 🏗️ System Architecture

```
Resume PDF  ──►  Module 1  ──►  Module 2  ──►  Module 3  ──►  Module 4  ──►  Scored Report
Job Description ──────────────────────────────────►┘                           + Action Plan
                              └── schema fail → re-extract ──┘
```

---

## 📦 Modules

### Module 1 — Layout-Aware Parser + Profile Scraper
- **DocLayNet / Docling** for coordinate-based bounding-box segmentation
- Eliminates the *typewriter flaw* by extracting text in true reading order
- Multi-extractor fusion (pdfplumber + Docling) with confidence scoring
- Conditional **PaddleOCR** fallback for scanned/image regions (60–80% compute saving)
- **Section-Graph Parser** with curated knowledge base (section aliases, skill aliases, degree norms)
- Embedded URI extraction from PDF annotation objects
- Parallel scrapers for **GitHub REST API**, **LeetCode GraphQL**, **Codeforces API**, **CodeChef API**
- Output: Pydantic-validated `resume.json`

### Module 2 — Gatekeeper Validator
- Pydantic v2 schema enforcement with automatic re-extraction on failure
- Temporal integrity checks: chronological impossibility, gap detection (>80 days), overlap detection
- Async URL liveness auditing via `aiohttp` — classifies URLs as Live / Dead / Unresolvable
- Timeline entries classified as: **Verified / Flagged / Unverifiable**

### Module 3 — Deterministic ATS Scoring Engine (DWRM)
- Fully deterministic — identical inputs always produce identical outputs
- **4 JD sections** × **4 component scores** (Keyword K, Semantic E, Numeric N, Job-Title T)
- **Dynamic Weight Redistribution Mechanism (DWRM):** when a component scores zero due to *absent data* (not poor fit), 80% of its weight is redistributed to non-zero components; 20% retained as penalty signal
- **Cross-document semantic normalisation:** maps sentence-transformer cosine similarity from [0.25, 0.65] → [0.0, 1.0]
- Generic-term filter prevents vocabulary inflation

**Scoring Formula:**

```
ATS = Σ α'ₖ · Sₖ     where Sₖ = w₁Kₖ + w₂Eₖ + w₃Nₖ + w₄Tₖ
```

Default weights: α = (0.30, 0.30, 0.20, 0.20) | w = (0.40, 0.45, 0.05, 0.10)

### Module 4 — Real-World Auditor + AI Report
- **GitHub:** commit count verification, language mismatch detection, fork vs. original contribution check
- **LeetCode / Codeforces / CodeChef:** live rating fetch and cross-platform percentile normalisation
- Discrepancies >20% flagged as *Unverified Claims*
- **Google Gemini API** generates a *Brutal Truth* action plan (skill gaps, closure steps, priority roadmap)
- Gemini is invoked **only** at this final stage — all upstream scoring is Gemini-independent

---

## 📊 Results

| Metric | Baseline | A.U.R.A. |
|---|---|---|
| Section Extraction Accuracy | 30.7% | **90.6%** |
| Embedded URI Recall | 0.0% | **88.5%** |
| Mean ATS Score | 42.99 | **77.73** (+34.74) |
| Claim Flag Rate | — | **38%** of 200 resumes |

**DWRM Ablation (200-resume corpus):**

| Variant | Mean ATS | Δ |
|---|---|---|
| Full pipeline (with DWRM) | 71.2 | — |
| Without DWRM | 61.8 | −9.4 |
| Without semantic normalisation | 58.7 | −12.5 |
| Without generic-term filter | 65.3 | −5.9 |
| Baseline (all disabled) | 45.2 | −26.0 |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | Python 3.11, FastAPI, Uvicorn, Pydantic v2 |
| Database | MongoDB |
| Layout / Vision | Docling (DocLayNet), PaddleOCR v4 |
| NLP | spaCy (RoBERTa), NLTK, all-mpnet-base-v2 |
| Verification | PyGitHub, httpx / aiohttp (async) |
| Reporting | Google Gemini API |

---

## 📁 Repository Structure

```
Automated-Unstructured-Resume-Analyzer/
├── Module_1/          # Layout-Aware Parser + Profile Scraper
├── Module_2/          # Gatekeeper Validator
├── Module_3/          # Deterministic ATS Scoring Engine (DWRM)
├── Module_4/          # Real-World Auditor + AI Report Generator
├── Frontend/          # React 19 web interface
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
```bash
Python 3.11+
Node.js 18+
MongoDB
```

### Backend Setup
```bash
cd Module_1
pip install -r requirements.txt
pip install -r requirements-docling.txt
pip install -r requirements-ml.txt
uvicorn src.resume_segmentation.api.app:app --reload
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

### Run the Full Pipeline
```bash
python pipeline.py --input resume.pdf --output ./results
```

---

## 📬 Contact

**Dhruv Aggarwal**
📧 aggarwaldhruv419@gmail.com
🏛️ Graphic Era (Deemed to be University), Dehradun — 248002, India

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <i>If you find this work useful, please consider starring ⭐ the repository.</i>
</p>
