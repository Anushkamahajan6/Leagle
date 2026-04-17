import logging
from typing import Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from core.config import settings
from core.llm_factory import LLMFactory
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
    def _invoke_chain(chain, input_data):
        """Helper to invoke with factory-level fallback."""
        return chain.ainvoke(input_data)

    @staticmethod
    async def get_regulation_intel(title: str, text: str) -> Dict[str, Any]:
        """
        Generates deep intelligence for a regulation.
        """
        # 1. Local ML Risk Score
        risk_score = score_regulation(text)
        
        # 2. AI Intelligence (Explanation + Comparison)
        try:
            try:
                llm = LLMFactory.get_llm(provider="gemini")
                chain = INTEL_PROMPT | llm | StrOutputParser()
                analysis_text = text[:5000]
                logger.info(f"🧠 Generating Intelligence Profile for: {title[:50]}...")
                raw_response = await chain.ainvoke({
                    "title": title,
                    "text": analysis_text
                })
            except Exception as gemini_err:
                if "429" in str(gemini_err) or "quota" in str(gemini_err).lower() or "resource_exhausted" in str(gemini_err).lower():
                    logger.warning(f"⚠️ Gemini Quota Exceeded. Falling back to Groq...")
                    llm = LLMFactory.get_llm(provider="groq")
                    chain = INTEL_PROMPT | llm | StrOutputParser()
                    raw_response = await chain.ainvoke({
                        "title": title,
                        "text": text[:5000]
                    })
                else:
                    raise gemini_err
            
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
