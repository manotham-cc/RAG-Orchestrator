from typing import List, Union, Any, Dict
from qdrant_client import models, QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
from app.utils.helpers import generate_id
import uuid

class QdrantService:
    def __init__(self, client: QdrantClient):
        self.client = client

    def create_indexes(self, collection_name: str):
        """
        Create indexes for key fields to improve search performance.
        """
        print(f"⚙️ Creating indexes for '{collection_name}'...")
        try:
            # 1. Index for filename 
            self.client.create_payload_index(
                collection_name=collection_name,
                field_name="source",
                field_schema=models.PayloadSchemaType.KEYWORD
            )
            # 2. Index for document type
            self.client.create_payload_index(
                collection_name=collection_name,
                field_name="type",
                field_schema=models.PayloadSchemaType.KEYWORD
            )
            
            print(f"✅ Indexes created successfully for '{collection_name}'")
            
        except Exception as e:
            # Index might already exist or other non-critical errors
            print(f"⚠️ Warning creating indexes: {e}")

    def create_collection(self, collection_name: str, vector_size: int = 1024, distance_mode: str = "cosine"):
        distance_map = {
            "cosine": Distance.COSINE,
            "euclid": Distance.EUCLID,
            "dot": Distance.DOT,
        }
        selected_distance = distance_map.get(distance_mode, Distance.COSINE)

        # Check if it already exists?
        if self.client.collection_exists(collection_name):
            print(f"⚠️ Collection '{collection_name}' already exists.")
            return 

        try:
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(     
                    size=vector_size, 
                    distance=selected_distance   
                )
            )
            print(f"✅ Collection '{collection_name}' created successfully.")
            
            # 2. Create index immediately here
            self.create_indexes(collection_name)
            
        except Exception as e:
            print(f"❌ Failed to create collection: {e}")
            
    def upsert_data(self, collection_name: str, vectors: List[List[float]], payloads: List[Dict[str, Any]]):

        points = []
        
        for i, vector in enumerate(vectors):
            payload = payloads[i]
            # ===== Deterministic ID =====
            if 'source' in payload and 'chunk_index' in payload:
                unique_key = f"{payload['source']}_{payload['chunk_index']}"
                point_id = generate_id(unique_key)
            elif 'text' in payload:
                point_id = generate_id(payload['text'])
            else:
                point_id = str(uuid.uuid4())

            points.append(PointStruct(
                id=point_id,
                vector=vector,
                payload=payload 
            ))
        try:
            operation_info = self.client.upsert(
                collection_name=collection_name,
                wait=True,
                points=points
            )
            print(f"✅ Upserted {len(points)} points. Status: {operation_info.status}")
        except Exception as e:
            print(f"❌ Upsert Failed: {e}")

    def search_similarity(
        self,
        collection_name: str, 
        query_vector: List[float], limit: int ,
        score_threshold: float = 0.0
        ):
        try:
            search_result = self.client.query_points(
                collection_name=collection_name,
                query=query_vector,       
                limit=limit,
                score_threshold=score_threshold
            )
            
            return search_result.points
            
        except Exception as e:
            print(f"❌ Search Failed: {e}")
            return []

    def search_with_filter(
        self,
        collection_name: str, 
        query_vector: List[float], 
        key: str, 
        value: Union[str, int], 
        limit: int,
        score_threshold:float = 0.0
    ):
        """
        Performs a semantic search with an exact match filter.
        Example: Search for "curriculum" ONLY in file "manual.pdf"
        """
        try:
            # 1. Create filter condition
            filter_condition = models.Filter(
                must=[
                    models.FieldCondition(
                        key=key, 
                        match=models.MatchValue(value=value)
                    )
                ]
            )
            search_result = self.client.query_points(
                collection_name=collection_name,
                query=query_vector,
                query_filter=filter_condition,
                limit=limit,
                score_threshold=score_threshold
            )
            
            # 3. Return results
            return search_result.points

        except Exception as e:
            print(f"❌ Filter Search Failed: {e}")
            return []

    def list_collections(self) -> List[Dict[str, Any]]:
        """
        Retrieves a list of all existing collections with their basic info.

        Returns:
            List[Dict[str, Any]]: A list of dictionaries containing collection metadata.
        """
        try:
            # 1. Get all collection names
            response = self.client.get_collections()
            
            collections_info = []
            for collection in response.collections:
                # 2. Get detailed info for each collection
                info = self.client.get_collection(collection_name=collection.name)
                collections_info.append({
                    "name": collection.name,
                    "points_count": info.points_count,
                    "status": info.status
                })
            
            print(f"📂 Found {len(collections_info)} collections.")
            return collections_info
            
        except Exception as e:
            print(f"❌ Failed to list collections: {e}")
            return []


    def get_available_filters(self, collection_name: str):
        try:
            facet_response = self.client.facet(
                collection_name=collection_name,
                key="type",     
                limit=100        
            )
        
            result = []
            for hit in facet_response.hits:
                result.append({
                    "name": hit.value,
                    "count": hit.count  
                })
                
            print(f"✅ Found types: {result}")
            return result

        except Exception as e:
            print(f"❌ Error fetching filters: {e}")
            return []
