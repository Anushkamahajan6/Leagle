import logging
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from services.qdrant_service import semantic_search
from core.config import settings

logger = logging.getLogger(__name__)

def _get_llm():
    """Instantiate LLM (Gemini or Groq) from settings."""
    if settings.llm_provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            model_name="llama-3.3-70b-versatile",
            groq_api_key=settings.groq_api_key,
            temperature=0.1,
        )
    
    # Default to Gemini
    return ChatGoogleGenerativeAI(
        model=settings.llm_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.1,
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
    ("system", """
    You are a Senior AI Compliance Officer and Legal Strategist. Your goal is to analyze the user's query against our Regulatory Database and provide a data-driven risk assessment.

    CONTEXT FROM DATABASE (Regulations & Legal Precedents):
    {context}

    USER QUERY:
    {question}

    INSTRUCTIONS:
    1. **Direct Answer**: Provide a concise answer based on the regulations found.
    2. **Precedent & Case Law**: Look for rows marked as [Legal Case] or [GDPR Case Study]. 
       - If a similar violation exists, cite it using this format: `> **Precedent**: Title of Case` (DO NOT wrap the title in extra brackets like `([title])`).
       - Explain the penalty or outcome.
    3. **Legal Citations**: When referencing a specific law, use: `(Ref: Law Name)`.
    4. **Actionable Remediation**: Suggest 1-3 specific steps.
    5. **Risk Score**: Estimate (Low, Medium, High).

    FORMATTING RULES:
    - Use `###` for headers.
    - **IMPORTANT**: ALWAYS put two empty lines (double newline) before every `###` header.
    - Use bold text for key terms.
    - Format response in professional Markdown.
    """),
    ("human", """QUESTION: {question}

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
        f"Source: {chunk.get('title', 'Unknown')} (Category: {chunk.get('category', 'n/a')})\n{chunk['text']}"
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
        f"Source: {c.get('title', 'Unknown')} (Category: {c.get('category', 'n/a')})\n{c['text']}"
        for c in chunks
    ])

    llm = _get_llm()
    chain = SEMANTIC_SEARCH_PROMPT | llm | StrOutputParser()

    answer = await chain.ainvoke({"context": context, "question": question})

    return {
        "answer": answer,
        "sources": [{"title": c.get("title"), "score": c["score"]} for c in chunks],
    }
