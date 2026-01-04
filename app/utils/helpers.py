import hashlib
import re
import os
import datetime
from typing import Dict, Any, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
# ==========================================
# 📚 Text Splitter Configuration
CHUNK_SIZE = 800  
CHUNK_OVERLAP = 150  

# ==========================================
# ✂️ Text Splitter Instance
# ==========================================
# Import this from other files: from helpers import text_splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    length_function=len,
    is_separator_regex=False,
    separators=["\n\n", "\n", " ", ""] 
)

# ==========================================
# 🛠️ Utility Functions
# ==========================================

def generate_id(text: str) -> str:
    """
    Generate Deterministic ID (MD5) from text.
    Benefit: If the same text comes in again, it gets the same ID (helps with Deduplication).
    """
    if not text:
        return hashlib.md5(b"").hexdigest()
    return hashlib.md5(text.encode('utf-8')).hexdigest()

def clean_text(text: Optional[str]) -> str:
    """
    (Optional) Function to clean OCR garbage before chunking.
    - Remove Null bytes
    - Reduce multiple newlines
    - Trim whitespace
    """
    if not text:
        return ""
    
    # Remove Null bytes that sometimes come from OCR
    text = text.replace('\x00', '')
    
    # (Optional) Collapse newlines > 2 to 2 (to preserve paragraphs)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Remove redundant whitespace (e.g. "   " -> " ")
    # text = re.sub(r'[ \t]+', ' ', text) # Enable if you don't care about formatting
    
    return text.strip()

def format_search_results(search_results):
    context_parts = []
    
    for hit in search_results:
        # 1. Extract main content
        text = hit.payload.get('text', '')
        
        # 2. (Optional) Extract source for AI reference
        source = hit.payload.get('source', 'Unknown')
        
        # 3. Format for readability
        # e.g.: "Content (from Report.pdf): ......"
        formatted_chunk = f"Content (from {source}):\n{text}"
        
        context_parts.append(formatted_chunk)
    
    # 4. Join all parts separated by underline or Newline
    full_context = "\n\n---\n\n".join(context_parts)
    return full_context


def build_payload(
    text_chunk: str, 
    file_path: str, 
    chunk_index: int, 
    doc_type: str ,
    extra_metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    
    # 1. Handle filename gracefully (os.path is safer than split)
    filename = os.path.basename(file_path)
    
    # 2. Standard structure
    payload = {
        "text": text_chunk,
        "source": filename,   
        "chunk_index": chunk_index,
        "type": doc_type,
        "created_at": datetime.datetime.now().isoformat() # Auto-add timestamp
    }

    # 3. If there is extra metadata (e.g., page_number, author), add it
    if extra_metadata:
        payload.update(extra_metadata)

    return payload