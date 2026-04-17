import logging
import json
from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from core.config import settings

logger = logging.getLogger(__name__)

SUMMARIZATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a senior legal and compliance analyst. 
Your task is to summarize complex regulatory documents or corporate filings into concise, information-dense summaries.
Focus on regulatory requirements, compliance obligations, risk factors, and financial impact.
Keep the summary around 500-800 words, but ensure it captures all critical compliance keywords and entities."""),
    ("human", """TITLE: {title}
SOURCE: {source}
CONTENT:
{text}

Generate a comprehensive compliance summary:"""),
])

class SummarizationService:
    @staticmethod
    def _get_llm():
        """Get LLM based on provider settings."""
        if settings.llm_provider == "groq":
            from langchain_groq import ChatGroq
            return ChatGroq(
                model_name="mixtral-8x7b-32768", # High context for summarization
                groq_api_key=settings.groq_api_key,
                temperature=0,
            )
        
        return ChatGoogleGenerativeAI(
            model=settings.llm_model,
            google_api_key=settings.gemini_api_key,
            temperature=0,
        )

    @staticmethod
    async def summarize_document(text: str, title: str = "", source: str = "") -> str:
        """
        Summarize a long document using Gemini.
        If the document is extremely long, it takes the first 20,000 characters
        as a representative sample to avoid context limits or excessive costs, 
        or you could implement sliding window summarization.
        """
        if not text or len(text) < 2000:
            return text  # Already short enough

        try:
            llm = SummarizationService._get_llm()
            chain = SUMMARIZATION_PROMPT | llm | StrOutputParser()
            
            # Truncate input for simple summarization
            # (In a real system, you might do recursive summarization)
            sample_text = text[:30000] 
            
            logger.info(f"🔄 Summarizing document: {title[:50]}...")
            summary = await chain.ainvoke({
                "title": title,
                "source": source,
                "text": sample_text,
            })
            
            return summary.strip()
        except Exception as e:
            if "RESOURCE_EXHAUSTED" in str(e) or "429" in str(e):
                logger.warning(f"⚠️ Gemini Quota Exhausted! Falling back to raw text (truncated).")
                return text[:5000] # Use first 5k chars as "summary"
            logger.error(f"❌ Summarization failed: {e}")
            return text[:5000] # Fallback to truncation if LLM fails
