from functools import lru_cache
from fastapi import Depends
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

from app.core.config import settings

# Import Service Classes
from app.services.ingestion_service import IngestionService
from app.services.search_service import SearchService

# Import Wrappers / Helpers
from app.ai_services.ocr_service import DoclingParser
from app.ai_services.embeding_service import BGEEmbedding
from app.ai_services.llm_service import TyphoonRAGService
from app.db.qdrant_service import QdrantService

# ==========================================
# Level 1: Low-Level Clients (Singletons)
# ==========================================

@lru_cache()
def get_qdrant_client() -> QdrantClient:
    print(f"🔌 Connecting to Qdrant at {settings.QDRANT_URL}...")
    return QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY
    )

@lru_cache()
def get_embedding_model_raw() -> SentenceTransformer:
    print(f"🧠 Loading AI Model: {settings.MODEL_NAME} ...")
    return SentenceTransformer(settings.MODEL_NAME)

# ==========================================
# Level 2: Middle Wrappers (Inject Clients here)
# ==========================================

@lru_cache()
def get_parser() -> DoclingParser:
    return DoclingParser()

@lru_cache()
def get_llm() -> TyphoonRAGService:
    return TyphoonRAGService()

def get_embedder(
    model_raw: SentenceTransformer = Depends(get_embedding_model_raw)
) -> BGEEmbedding:
    return BGEEmbedding(model=model_raw)

def get_qdrant_service(
    client: QdrantClient = Depends(get_qdrant_client)
) -> QdrantService:
    return QdrantService(client=client)

# ==========================================
# Level 3: High-Level Services (Inject Wrappers here)
# ==========================================

def get_ingestion_service(
    parser: DoclingParser = Depends(get_parser),
    embedder: BGEEmbedding = Depends(get_embedder),
    qdrant: QdrantService = Depends(get_qdrant_service)
) -> IngestionService:
    return IngestionService(parser, embedder, qdrant)

def get_search_service(
    embedder: BGEEmbedding = Depends(get_embedder),
    llm: TyphoonRAGService = Depends(get_llm),
    qdrant: QdrantService = Depends(get_qdrant_service)
) -> SearchService:
    return SearchService(embedder, llm, qdrant)
