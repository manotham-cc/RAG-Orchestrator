# Gemini Context: rag-scb-api (RAG Orchestrator)

## Project Overview
**rag-scb-api** is a comprehensive Retrieval-Augmented Generation (RAG) system. It features a high-performance Python backend for document processing and vector search, and a modern React frontend for interactive document management and AI querying.

### Key Technologies
*   **Backend Framework:** FastAPI.
*   **Frontend Framework:** React 19 + TypeScript + Vite.
*   **UI/UX:** Material UI (MUI) with a **Neo-Classic** aesthetic (Playfair Display/Lato typography, Navy & Gold palette).
*   **Vector Database:** Qdrant (running via Docker Compose).
*   **Document Processing:** Docling (Advanced OCR and layout analysis).
*   **Embeddings:** Sentence Transformers (`BAAI/bge-m3`).
*   **LLM Integration:** OpenTyphoon (Typhoon-v2.5) for Thai-optimized RAG.

## Architecture
The project follows a clean, modular **Service Layer** pattern:

*   `app/`: Backend Application.
    *   `services/`: Business logic layer (`IngestionService`, `SearchService`).
    *   `api/`: Interface layer.
        *   `routes.py`: FastAPI endpoints.
        *   `deps.py`: Dependency injection provider for services and clients.
        *   `schemas/`: Pydantic models for request/response validation.
    *   `ai_services/`: Wrapper services for AI models and external APIs (OCR, Embeddings, LLM).
    *   `db/`: Database access layer (`qdrant_service.py`).
    *   `core/`: Configuration and settings.
*   `frontend/`: React Application.
    *   `src/pages/`: Main views (Collections, Upload, Search).
    *   `src/components/`: Shared UI components (Layout, Sidebar).
    *   `src/theme.ts`: Custom Neo-Classic MUI theme.
*   `docker-compose.yaml`: Infrastructure definition (Qdrant).

## Setup & Running

### Prerequisites
*   Python 3.9+
*   Node.js 18+
*   Docker & Docker Compose

### 1. Environment Setup
Create a `.env` in the root:
```env
QDRANT_HOST=localhost
QDRANT_PORT=6333
MODEL_NAME=BAAI/bge-m3
OPENAI_API_KEY=your_typhoon_api_key
```

### 2. Infrastructure
```bash
docker-compose up -d
```

### 3. Backend
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Development Conventions
*   **Service Layer:** Business logic must reside in `app/services/`. Routers should only handle request parsing and response delegation.
*   **Dependency Injection:** Use FastAPI's `Depends` with providers in `app/api/deps.py`.
*   **Neo-Classic UI:** Adhere to the established design system (Sharp corners, Serif headings, Navy/Gold colors).
*   **Thai RAG:** LLM responses are optimized for Thai language via the Typhoon service.

## Status Notes
*   **Fully Functional:** The system supports full document lifecycle: Upload -> Parse -> Chunk -> Embed -> Search -> AI Answer.
*   **Filtering:** Supports metadata filtering by `type` (document type) during semantic search.
*   **Design:** Optimized for desktop screens with a persistent sidebar dashboard.