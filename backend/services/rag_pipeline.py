import logging
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from services.qdrant_service import semantic_search
from core.config import settings

logger = logging.getLogger(__name__)

def _get_llm() -> ChatGoogleGenerativeAI:
    """Instantiate Gemini LLM. gemini-2.5-flash is current default."""
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.gemini_api_key,
        temperature=0.1,    # low temperature for factual compliance analysis
        max_tokens=2048,
    )

IMPACT_ANALYSIS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a senior compliance officer with expertise in regulatory analysis.
Analyze whether a new regulation impacts an existing company policy.
Always respond with a valid JSON object — no markdown, no preamble, just JSON.

Response format:
{{
  "impact_level": "HIGH", "MEDIUM" or "LOW",
  "affected_clauses": ["list of specific policy sections affected"],
  "compliance_gaps": ["specific gaps found in the policy"],
  "recommended_actions": [
    {{"step": 1, "action": "...", "deadline_days": 30, "owner": "Legal"}}
  ],
  "compliance_deadline": "YYYY-MM-DD or null if not specified",
  "reasoning": "2-3 sentence explanation of the impact assessment"
}}"""),
    ("human", """RELEVANT REGULATORY CONTEXT (retrieved from knowledge base):
{context}

NEW REGULATION:
{regulation_text}

EXISTING COMPANY POLICY TO ANALYZE:
{policy_text}

Analyze the impact and respond with JSON only."""),
])

SEMANTIC_SEARCH_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a compliance expert. Answer questions about regulations
using only the provided context. Be specific and cite regulation names when possible.
If the context doesn't contain enough information, say so clearly."""),
    ("human", """CONTEXT FROM REGULATORY DATABASE:
{context}

QUESTION: {question}

Answer based on the context above:"""),
])

async def analyze_impact(
    regulation_text: str,
    policy_text: str,
    regulation_title: str = "",
    policy_title: str = "",
) -> dict:
    """
    Core RAG function: given a regulation and a policy,
    retrieve relevant context from Qdrant and use LLM to analyze impact.
    """
    similar_chunks = semantic_search(
        query_text=regulation_text,
        top_k=5,
        score_threshold=0.3,
    )

    context = "\n\n---\n\n".join([
        f"[{chunk.get('title', 'Unknown')} | Score: {chunk['score']}]\n{chunk['text']}"
        for chunk in similar_chunks
    ])

    if not context:
        context = "No additional context available in the knowledge base."

    llm = _get_llm()
    chain = IMPACT_ANALYSIS_PROMPT | llm | StrOutputParser()

    try:
        raw_response = await chain.ainvoke({
            "context": context,
            "regulation_text": f"{regulation_title}\n\n{regulation_text}"[:3000],
            "policy_text": f"{policy_title}\n\n{policy_text}"[:2000],
        })

        clean = raw_response.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]

        result = json.loads(clean)
        result["source_chunks"] = [c["text"][:200] for c in similar_chunks]
        result["similarity_scores"] = [c["score"] for c in similar_chunks]
        return result

    except json.JSONDecodeError as e:
        logger.error(f"LLM returned invalid JSON: {raw_response[:500]}")
        return {
            "impact_level": "UNKNOWN",
            "compliance_gaps": ["Analysis failed — manual review required"],
            "recommended_actions": [],
            "compliance_deadline": None,
            "reasoning": f"Automated analysis failed: {str(e)}",
            "raw_response": raw_response,
        }

async def rag_question_answer(question: str) -> dict:
    """
    General RAG Q&A over the regulation knowledge base.
    """
    chunks = semantic_search(query_text=question, top_k=7, score_threshold=0.25)
    context = "\n\n---\n\n".join([
        f"[{c.get('title', '')} | {c.get('category', '')}]\n{c['text']}"
        for c in chunks
    ])

    llm = _get_llm()
    chain = SEMANTIC_SEARCH_PROMPT | llm | StrOutputParser()

    answer = await chain.ainvoke({"context": context, "question": question})

    return {
        "answer": answer,
        "sources": [{"title": c.get("title"), "score": c["score"]} for c in chunks],
    }
