# 🚀 Future Plan: Scaling RAG Orchestrator on Azure

## 1. Executive Summary
The current architecture (FastAPI + Local Qdrant + In-Memory Processing) is designed for **Development/POC**. It works well for single users or low traffic. 

To handle **100+ concurrent requests** (especially document uploads and complex RAG queries) and deploy on **Azure**, the system requires a shift from a **Monolithic** architecture to an **Event-Driven Microservices** architecture.

---

## 2. Critical Architectural Refactoring (The "Must-Haves")

### 2.1. Asynchronous Ingestion Pipeline (Celery + Redis)
**The Bottleneck:** Currently, OCR (`Docling`) and Embeddings (`SentenceTransformers`) run on the web server's main CPU. If 5 users upload PDFs simultaneously, the API will freeze or crash (OOM).
**The Solution:** Decouple ingestion from the API.
*   **Action:** Implement **Celery** or **FastStream** with a Message Broker (Redis/RabbitMQ).
*   **Flow:** 
    1.  User uploads file -> API saves to Blob Storage -> API pushes "Job ID" to Queue -> API returns "Processing" status immediately.
    2.  **Worker Node** picks up the job -> Downloads file -> Runs OCR/Chunking/Embedding -> Upserts to Qdrant.
    3.  Frontend polls for status or uses WebSockets for progress updates.

### 2.2. Statelessness & Blob Storage
**The Bottleneck:** The current app saves temp files to the local disk (`/tmp`). This fails in scalable cloud environments (e.g., Kubernetes pods) because file systems are ephemeral and not shared.
**The Solution:** Use **Azure Blob Storage**.
*   **Action:** Replace local `tempfile` logic with `azure-storage-blob`.
*   **Benefit:** Allows multiple API instances to access the same files.

---

## 3. Azure Infrastructure Strategy

### 3.1. Compute: Azure Kubernetes Service (AKS) or Container Apps
For 100 concurrent users, simple App Service plans might struggle with the specific heavy dependencies (Torch/OCR).
*   **Recommendation:** **Azure Container Apps** (Serverless Containers).
    *   **Scale Rule:** Auto-scale API replicas based on HTTP traffic.
    *   **Scale Rule:** Auto-scale Worker replicas based on Queue length (e.g., if 100 documents are queued, spin up 10 workers).
*   **Alternative:** **AKS** (if fine-grained control over GPU nodes is needed for embeddings).

### 3.2. Database: Managed Qdrant or Qdrant Cloud
**The Bottleneck:** A single Docker container for Qdrant is a Single Point of Failure (SPOF) and limited by one node's RAM.
**The Solution:**
*   **Option A (Easiest):** Use **Qdrant Cloud** (Managed Service) and peer it with your Azure VNet.
*   **Option B (Azure Native):** Deploy a Qdrant Distributed Cluster on AKS using Helm Charts with persistent Azure Disk storage.

### 3.3. Caching layer: Azure Cache for Redis
*   **Usage 1:** Message Broker for the Ingestion Queue.
*   **Usage 2:** **Semantic Caching**. Before hitting the LLM, check Redis. If `User Query: "What is the policy?"` was answered 1 minute ago, return the cached answer. This saves **Latency** and **LLM Costs**.

---

## 4. Performance Optimization for Scale

### 4.1. GPU Acceleration (NC Series)
*   **Embeddings:** Moving `BAAI/bge-m3` to a GPU-enabled node (e.g., Azure NCasT4_v3) will speed up embedding generation by 10-50x compared to CPU.
*   **OCR:** Docling can also benefit from GPU acceleration for layout analysis.

### 4.2. Vector Search Optimization
*   **Quantization:** Enable `Binary Quantization` or `Scalar Quantization` in Qdrant. This reduces RAM usage by 4x-30x with minimal accuracy loss, allowing you to store millions of vectors cheaper.
*   **HNSW Parameters:** Tune `m` and `ef_construct` for the sweet spot between index build time and search speed.

### 4.3. Hybrid Search (Keyword + Vector)
*   To improve accuracy, combine dense vector search with **BM25** (Keyword Search). Qdrant supports this. It helps when users search for specific IDs or exact phrases that semantic search sometimes misses.

---

## 5. Deployment Roadmap

| Phase | Task | Azure Service |
| :--- | :--- | :--- |
| **1** | **Containerization** | Azure Container Registry (ACR) |
| | Dockerize API and Worker separately. | |
| **2** | **Storage Migration** | Azure Blob Storage |
| | Update code to read/write files to Blob instead of local disk. | |
| **3** | **Queue Implementation** | Azure Cache for Redis |
| | Implement Celery workers for OCR tasks. | |
| **4** | **Orchestration** | Azure Container Apps |
| | Deploy API and Workers. Configure KEDA scalers (HTTP & Redis List). | |
| **5** | **Observability** | Azure Monitor / App Insights |
| | Trace requests from API -> Worker -> DB -> LLM. | |

## 6. Cost vs. Scale Estimate (Rough)

For **100 concurrent users** (assuming 10 active uploads/min, 90 chat queries/min):

*   **API Nodes (x2-3):** ~2 vCPU, 4GB RAM each (Azure Container Apps).
*   **Worker Nodes (x2-5):** ~4 vCPU, 16GB RAM each (Scale to zero when idle).
*   **Qdrant:** ~8GB RAM node (depends on document count).
*   **LLM (Typhoon):** Cost is per token. Implement caching to reduce this by ~30%.

## 7. Conclusion
To go to production, **stop processing files in the HTTP request loop**. Move to an async worker pattern. This is the single most important change for stability under load.
