import os
import shutil
import tempfile
from fastapi import UploadFile, HTTPException
from app.db.qdrant_service import QdrantService
from app.ai_services.ocr_service import DoclingParser
from app.ai_services.embeding_service import BGEEmbedding
from app.utils.helpers import text_splitter, build_payload

class IngestionService:
    def __init__(self, parser: DoclingParser, embedder: BGEEmbedding, qdrant: QdrantService):
        self.parser = parser
        self.embedder = embedder
        self.qdrant = qdrant

    async def process_document(self, file: UploadFile, collection_name: str, doc_type: str):
        import json
        # 1. Save uploaded file to temp
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        try:
            # 2. Parse document
            yield json.dumps({"status": "progress", "step": "parsing", "message": "Running Docling OCR & Layout Analysis..."}) + "\n"
            markdown_text = self.parser.process_document(tmp_path)
            if not markdown_text:
                raise Exception("Failed to parse document")

            # 3. Chunk text
            yield json.dumps({"status": "progress", "step": "chunking", "message": "Splitting text into chunks..."}) + "\n"
            chunks = text_splitter.split_text(markdown_text)
            
            # 4. Embed chunks
            yield json.dumps({"status": "progress", "step": "embedding", "message": f"Embedding {len(chunks)} chunks..."}) + "\n"
            embeddings = self.embedder.get_embeddings(chunks)

            # 5. Build payloads
            yield json.dumps({"status": "progress", "step": "preparing", "message": "Preparing vector payloads..."}) + "\n"
            payloads = []
            for i, chunk in enumerate(chunks):
                payloads.append(build_payload(
                    text_chunk=chunk,
                    file_path=file.filename,
                    chunk_index=i,
                    doc_type=doc_type
                ))

            # 6. Upsert to Qdrant
            yield json.dumps({"status": "progress", "step": "upserting", "message": "Upserting to Vector Database..."}) + "\n"
            self.qdrant.upsert_data(
                collection_name=collection_name,
                vectors=embeddings.tolist(),
                payloads=payloads
            )

            result = {
                "status": "success",
                "filename": file.filename,
                "chunks_count": len(chunks),
                "collection": collection_name
            }
            yield json.dumps(result) + "\n"

        except Exception as e:
            yield json.dumps({"status": "error", "message": str(e)}) + "\n"
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)