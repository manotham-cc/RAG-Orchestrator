import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import List, Optional, Dict, Any

from app.api.schemas.models import CollectionCreate, SearchRequest, FilterSearchRequest
from app.services.ingestion_service import IngestionService
from app.services.search_service import SearchService
from app.db.qdrant_service import QdrantService
from app.api.deps import get_ingestion_service, get_search_service, get_qdrant_service

router = APIRouter()

# --- Routes ---

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "rag-scb-api"}

@router.get("/collections")
async def list_collections(
    service: QdrantService = Depends(get_qdrant_service)
):
    return service.list_collections()

@router.post("/collections")
async def create_collection(
    config: CollectionCreate,
    service: QdrantService = Depends(get_qdrant_service)
):
    service.create_collection(
        collection_name=config.name,
        vector_size=config.vector_size,
        distance_mode=config.distance_mode
    )
    return {"status": "success", "message": f"Collection '{config.name}' created or already exists."}

@router.get("/collections/{name}/count")
async def get_collection_count(
    name: str,
    service: QdrantService = Depends(get_qdrant_service)
):
    collections = service.list_collections()
    for col in collections:
        if col["name"] == name:
            return {"collection": name, "points_count": col["points_count"]}
    raise HTTPException(status_code=404, detail="Collection not found")

@router.post("/documents/process")
async def process_document(
    collection_name: str = Form(...),
    doc_type: Optional[str] = Form(None),
    file: UploadFile = File(...),
    service: IngestionService = Depends(get_ingestion_service)
):
    # Fallback logic for doc_type if not provided
    final_doc_type = doc_type or (os.path.splitext(file.filename)[1][1:].upper() or "UNKNOWN")
    
    return await service.process_document(
        file=file,
        collection_name=collection_name,
        doc_type=final_doc_type
    )

@router.post("/search")
async def search(
    request: SearchRequest,
    service: SearchService = Depends(get_search_service)
):
    return await service.search(
        collection_name=request.collection_name,
        query=request.query,
        limit=request.limit,
        score_threshold=request.score_threshold,
        ask_ai=request.ask_ai
    )

@router.post("/search/filter")
async def search_filter(
    request: FilterSearchRequest,
    service: SearchService = Depends(get_search_service)
):
    return await service.search_filter(
        collection_name=request.collection_name,
        query=request.query,
        filter_key=request.filter_key,
        filter_value=request.filter_value,
        score_threshold=request.score_threshold,
        limit=request.limit,
        ask_ai=request.ask_ai
    )

@router.get("/collections/{name}/filters")
async def get_filters(
    name: str,
    service: SearchService = Depends(get_search_service)
):
    return await service.get_filters(name)
