import logging
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from core.config import settings
from services.risk_scorer import score_regulation

logger = logging.getLogger(__name__)

INTEL_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a senior legal compliance AI. 
Analyze the provided regulation and generate:
1. A brief, executive explanation (3-4 sentences).
2. A legal comparison: How this relates to global standards like GDPR, EU AI Act, or NIST.
3. Impact areas for a corporate environment (IT, HR, Finance, etc.).

Format your response as a JSON object with keys: 'explanation', 'comparison', 'impact_areas' (list)."""),
    ("human", """TITLE: {title}
TEXT SNIPPET: {text}

Analyze this regulation:"""),
])

class RegulationIntelligenceService:
    @staticmethod
    def _get_llm():
        return ChatGoogleGenerativeAI(
            model=settings.llm_model,
            google_api_key=settings.gemini_api_key,
            temperature=0,
        )

    @staticmethod
    async def get_regulation_intel(title: str, text: str) -> Dict[str, Any]:
        """
        Generates deep intelligence for a regulation.
        """
        # 1. Local ML Risk Score
        risk_score = score_regulation(text)
        
        # 2. AI Intelligence (Explanation + Comparison)
        try:
            llm = RegulationIntelligenceService._get_llm()
            chain = INTEL_PROMPT | llm | StrOutputParser()
            
            # Use first 5000 characters for analysis
            analysis_text = text[:5000]
            
            logger.info(f"🧠 Generating Intelligence Profile for: {title[:50]}...")
            raw_response = await chain.ainvoke({
                "title": title,
                "text": analysis_text
            })
            
            # Clean up JSON if LLM adds markdown blocks
            json_str = raw_response.strip().replace("```json", "").replace("```", "")
            import json
            intel = json.loads(json_str)
            
            intel["risk_score"] = risk_score
            return intel
        except Exception as e:
            logger.error(f"❌ Intelligence generation failed: {e}")
            return {
                "explanation": f"Regulatory document regarding {title}. Detailed AI analysis temporarily unavailable.",
                "comparison": "Cross-reference with global standards is pending neural synchronization.",
                "impact_areas": ["General Compliance"],
                "risk_score": risk_score
            }
