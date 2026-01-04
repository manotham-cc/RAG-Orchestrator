import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
from app.utils.helpers import format_search_results

load_dotenv()

class TyphoonRAGService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = "https://api.opentyphoon.ai/v1"
        self.model = "typhoon-v2.5-30b-a3b-instruct"
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

    def generate_answer(self, query: str, search_results: List[Any]) -> str:
        """
        Generates an answer based on the provided query and retrieved search results.
        """
        if not search_results:
            return "Sorry, no relevant information found in the database to answer your question."

        # 1. Format context from search results
        context = format_search_results(search_results)

        # 2. Construct Prompt
        system_prompt = (
            "You are a helpful assistant. Use the provided context to answer the user's question accurately using language same as the query. "
            "If the answer is not in the context, say that you don't know based on the documents provided. "
            "Cite the source of your information if available."
        )
        
        user_prompt = f"Context:\n{context}\n\nQuestion: {query}"

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=1024,
                temperature=0.4 # Lower temperature for more factual RAG
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"❌ LLM Error: {e}")
            return f"Error processing answer: {str(e)}"