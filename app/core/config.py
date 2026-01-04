# config.py
import os
from dotenv import load_dotenv

load_dotenv() 

class Settings:
    QDRANT_URL = f"http://{os.getenv('QDRANT_HOST', 'localhost')}:{os.getenv('QDRANT_PORT', '6333')}"
    QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
    MODEL_NAME = os.getenv("MODEL_NAME", "BAAI/bge-m3")

settings = Settings()