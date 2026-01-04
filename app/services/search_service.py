from typing import Optional, List, Any
from app.db.qdrant_service import QdrantService
from app.ai_services.embeding_service import BGEEmbedding
from app.ai_services.llm_service import TyphoonRAGService

class SearchService:
    def __init__(self, embedder: BGEEmbedding, llm: TyphoonRAGService, qdrant: QdrantService):
        self.embedder = embedder
        self.llm = llm
        self.qdrant = qdrant

    async def search(self, collection_name: str, query: str, limit: int, score_threshold: float, ask_ai: bool):
        query_vector = self.embedder.get_embeddings([query])[0].tolist()
        
        results = self.qdrant.search_similarity(
            collection_name=collection_name,
            query_vector=query_vector,
            limit=limit,
            score_threshold=score_threshold
        )
        
        answer = None
        if ask_ai:
            answer = self.llm.generate_answer(query, results)
        
        return {"results": results, "answer": answer}

    async def search_filter(self, collection_name: str, query: str, filter_key: str, filter_value: str, limit: int, ask_ai: bool
                            ,score_threshold: float):
        query_vector = self.embedder.get_embeddings([query])[0].tolist()
        
        results = self.qdrant.search_with_filter(
            collection_name=collection_name,
            query_vector=query_vector,
            key=filter_key,
            value=filter_value,
            limit=limit,
            score_threshold=score_threshold
        )
        
        answer = None
        if ask_ai:
            answer = self.llm.generate_answer(query, results)
            
        return {"results": results, "answer": answer}

    async def get_filters(self, collection_name: str):
        return self.qdrant.get_available_filters(collection_name)