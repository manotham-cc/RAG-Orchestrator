# 🧠(RAG Orchestrator)

A high-performance, modular **Retrieval-Augmented Generation (RAG)** system designed for precise document retrieval and AI-powered question answering. It combines a robust **FastAPI** backend with a polished, **ChatGPT/Gemini-style React** frontend.

## ✨ Key Features

*   **📄 Advanced Document Ingestion**: Utilizes **Docling** for state-of-the-art OCR and layout analysis, capable of processing complex PDFs, images, and office documents (DOCX, PPTX, XLSX).
*   **💬 Modern AI Chat Interface**: A dedicated **Chat Assistant** page featuring a familiar ChatGPT/Gemini UX for natural language interaction with your documents.
*   **🔍 Pure Semantic Search**: A dedicated **Archives & Search** page for high-speed vector retrieval, allowing you to explore raw document chunks with ease.
*   **🤖 Typhoon LLM Integration**: Optimized for Thai and English RAG using **OpenTyphoon** (Typhoon-v2.5) models.
*   **🎛️ Dynamic Search Controls**:
    *   **Similarity Threshold Slider**: Real-time filtering of results based on confidence scores.
    *   **Top-K (Context Size) Slider**: Granular control over how many context chunks are retrieved or sent to the AI.
    *   **Metadata Filtering**: Filter by Document Type (PDF, Image, etc.) or specific file sources.
*   **🏗️ Clean Architecture**: Implements a strict Service Layer pattern with a 100% English-commented codebase for global maintainability.

---

## 🛠️ Tech Stack

### Backend (Python 3.9+)
*   **Framework**: FastAPI
*   **Vector Database**: Qdrant (Dockerized)
*   **LLM Integration**: OpenTyphoon (Typhoon-v2.5)
*   **Embeddings**: `BAAI/bge-m3` (Sentence Transformers)
*   **OCR/Parsing**: Docling

### Frontend (React 19)
*   **Build Tool**: Vite + TypeScript
*   **UI Framework**: Material UI (MUI) with a **Neo-Classic** (Navy & Gold) theme.
*   **State/Network**: Axios, React Hooks

---

## 🚀 Getting Started

### 1. Prerequisites
*   **Docker & Docker Compose**
*   **Python 3.9+**
*   **Node.js 18+**

### 2. Infrastructure Setup
Start the Qdrant vector database:
```bash
docker-compose up -d
```
set up api key :
http://localhost:6333/dashborad
### 3. Backend Setup
1.  Create a `.env` file in the root directory:
    ```env
    QDRANT_HOST=localhost
    QDRANT_PORT=6333
    MODEL_NAME=BAAI/bge-m3
    OPENAI_API_KEY=your_typhoon_api_key
    ```
2.  Install dependencies and start the server:
    ```bash
    python -m venv .venv
    # Windows: .venv\Scripts\activate
    # Linux/Mac: source .venv/bin/activate
    
    pip install -r requirements.txt
    uvicorn app.main:app --reload
    ```
    *API Docs: http://localhost:8000/docs*

### 4. Frontend Setup
1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install and run:
    ```bash
    npm install
    npm run dev
    ```
    *Dashboard: http://localhost:5173*

---

## 📖 Usage Workflow

1.  **Collections**: Create a new isolated vector collection (e.g., "CompanyPolicies").
2.  **Upload**: Process files in the **Document Processing** tab. Files are automatically parsed into chunks and embedded.
3.  **Search**: Use the **Archives & Search** tab to perform pure vector searches and verify your data.
4.  **Chat**: Head to the **Chat** tab for the full RAG experience. Select your collection, adjust the Top-K settings in the sidebar, and ask questions like "What is the holiday policy?".

---

## 📂 Project Structure

```
.
├── app/                    # 🐍 Backend Application
│   ├── ai_services/        # Wrappers for LLM, OCR, and Embeddings
│   ├── api/                # Routes & Dependency Injection (deps.py)
│   ├── core/               # Configuration & Settings
│   ├── db/                 # Database Access Layer (QdrantService)
│   └── services/           # Business Logic (Ingestion, Search)
├── frontend/               # ⚛️ Frontend Application
│   ├── src/
│   │   ├── pages/          # Chat, Search, Upload, Collections
│   │   ├── components/     # Layout & Sidebar
│   │   └── theme.ts        # Neo-Classic MUI Theme
├── future_plan.md          # 🚀 Roadmap for Azure Scaling
└── docker-compose.yaml     # 💾 Qdrant Service Definition
```

## 📜 License
MIT License
