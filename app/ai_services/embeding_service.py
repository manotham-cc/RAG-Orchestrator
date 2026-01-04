import os
import torch
from typing import List, Union
import numpy as np
from sentence_transformers import SentenceTransformer

class BGEEmbedding:
    def __init__(self, model: SentenceTransformer):
        """
        Simplified initialization using injected model.
        Thread configuration should be handled at the application startup level if needed.
        """
        self.model = model
        self.model.eval()
        self.model.max_seq_length = 512

    def get_embeddings(self, texts: Union[str, List[str]], batch_size: int = 8) -> np.ndarray:
        if isinstance(texts, str):
            texts = [texts]
        
        with torch.no_grad():
            embeddings = self.model.encode(
                    texts,  
                    batch_size=batch_size,
                    normalize_embeddings=True,
                    show_progress_bar=True
                )
        return embeddings