from pydantic import BaseModel
from typing import Optional

# --- Models ---
class CollectionCreate(BaseModel):
    name: str
    vector_size: int = 1024
    distance_mode: str = "cosine"

class SearchRequest(BaseModel):
    collection_name: str
    query: str
    limit: int 
    score_threshold: float = 0.0
    ask_ai: bool = False

class FilterSearchRequest(BaseModel):
    collection_name: str
    query: str
    filter_key: str
    filter_value: str
    limit: int 
    score_threshold: float = 0.0
    ask_ai: bool = False
