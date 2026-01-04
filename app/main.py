import os
import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- ⚠️ SYSTEM CONFIGURATION (MUST BE FIRST) ⚠️ ---
# Must configure this before importing any Router or Model
PHYSICAL_CORES = "8" 
os.environ["OMP_NUM_THREADS"] = PHYSICAL_CORES
os.environ["MKL_NUM_THREADS"] = PHYSICAL_CORES
os.environ["TOKENIZERS_PARALLELISM"] = "false"

try:
    torch.set_num_threads(int(PHYSICAL_CORES))
    torch.set_num_interop_threads(1)
    print(f"✅ System configured with {PHYSICAL_CORES} threads.")
except RuntimeError:
    pass
# ---------------------------------------------------

# Import Router after system config is done
from app.api.routes import router as api_router

app = FastAPI(
    title="RAG SCB API",
    description="API for Document Processing, Embeddings, and Vector Search using Qdrant and Docling.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to RAG SCB API",
        "docs": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)