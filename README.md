# DocuQuery

DocuQuery is a containerized Retrieval-Augmented Generation (RAG) web platform that allows you to search and question uploaded documents (images and PDFs) based on their semantic **textual** content.

---

### Key Features

* **Hybrid Document Extraction:** Automatically extracts digital text or runs OCR via PaddleOCR to parse complex multi-line text.
* **Sub-Page Semantic Chunking:** Splits document text into overlapping chunks (500–800 characters) preserving page-level metadata for precise UI citations without semantic dilution.
* **Local Matryoshka Vector Embeddings:** Uses `qwen3-embedding` via containerized Ollama to generate truncated 1024-dimension embeddings within `pgvector` HNSW index limits.
* **Vector Similarity Retrieval:** Queries vector spaces using cosine distance (`<=>`) backed by HNSW indexing in PostgreSQL.
* **Strict Grounded RAG Completions:** Injects retrieved document chunks into context windows for the LLM to return strictly grounded responses in structured JSON.

---

### Tech Stack

| Component            | Technology                  | Role                                                        |
|:---------------------|:----------------------------|:------------------------------------------------------------|
| **Backend & Web UI** | Laravel (PHP 8.2+)          | Application logic, chunking pipelines, and UI               |
| **OCR Service**      | FastAPI / PaddleOCR / PyPDF | Text extraction and formula recognition for PDFs/images     |
| **Vector Database**  | PostgreSQL + `pgvector`     | Relational document store and HNSW vector similarity search |
| **Object Storage**   | MinIO                       | S3-compatible local object storage for file persistence     |
| **Embedding Engine** | Ollama (`qwen3-embedding`)  | Containerized local embedding generation                    |
| **LLM Inference**    | AionLabs (Free Tier)        | Grounded context-aware question answering                   |

---

### Prerequisites

* [Docker](https://docs.docker.com/get-docker/) & Docker Compose (v2+)

---

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/niceWizzard/docuquery.git
   cd docuquery
2. **Run docker**
    ```bash
   docker compose up -d
    ```
3. Visit the website through http://127.0.0.1:8000/


---

### Limitations & Known Constraints

* **No Formula & LaTeX Recognition:** The current OCR pipeline extracts text linearly, flattening 2D mathematical notation into raw plain text characters rather than valid LaTeX equations. Fractions, superscripts, subscripts, and complex math symbols may be extracted as disjointed text or missed entirely.
* **Visual Figures & Charts Are Lost:** Non-text graphical content (charts, diagrams, plots, and standalone figures) is skipped during ingestion, meaning questions regarding visual-only elements cannot be answered.
* **Loss of Table Formatting:** Tables are extracted purely as linear text streams. Row-column relationships, headers, and cell formatting are not preserved in Markdown or HTML tabular syntax.
* **Raw Text Flattening:** Multi-column layouts and non-standard reading orders can occasionally result in merged or interleaved text lines before chunking and vector storage.
