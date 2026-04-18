import logging
from typing import List, Dict, Any
from services.qdrant_service import semantic_search
from core.llm_factory import LLMFactory
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json

logger = logging.getLogger(__name__)

GAP_ANALYSIS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a senior regulatory compliance auditor.
Your job is to compare a company policy chunk against relevant regulatory requirements.
Identify:
1. **Alignment**: Does the policy follow the regulation?
2. **Gaps**: What is missing or contradictory?
3. **Risk**: High, Medium, or Low impact of this gap.

Response format: JSON only.
{{
  "alignment_summary": "...",
  "specific_gaps": ["gap 1", "..."],
  "risk_impact": "HIGH/MEDIUM/LOW",
  "recommended_fix": "..."
}}"""),
    ("human", """POLICY CHUNK:
{policy_chunk}

RELEVANT REGULATION(S):
{regulatory_context}

Analyze the compliance gap:"""),
])

COMPREHENSIVE_SYNTHESIS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a Chief Compliance Officer conducting a comprehensive legal audit.
You have reviewed all chunks of a policy document and identified compliance gaps.
Your task is to synthesize all findings into:
1. **Executive Summary**: Overall compliance status
2. **Critical Issues**: Systemic problems that span multiple sections
3. **Legal Determination**: Whether the document is compliant or has legal exposure
4. **Remediation Priority**: Top 3 actions needed immediately

Response format: JSON only.
{{
  "executive_summary": "Overall assessment of the document...",
  "overall_compliance_status": "COMPLIANT", "PARTIALLY_COMPLIANT", or "NON_COMPLIANT",
  "critical_issues": [
    {{
      "issue": "Description of systemic problem",
      "affected_areas": ["area1", "area2"],
      "legal_exposure": "Potential liability and fines",
      "severity": "CRITICAL", "HIGH", or "MEDIUM"
    }}
  ],
  "systemic_patterns": [
    "Pattern observed across multiple sections"
  ],
  "legal_determination": "Comprehensive legal verdict on whether anything is amiss...",
  "compliance_score": 0-100,
  "immediate_actions": [
    {{
      "priority": 1,
      "action": "Action description",
      "timeline": "Days to complete",
      "responsible_party": "Department/Role"
    }}
  ],
  "regulatory_exposure_summary": "Description of potential legal/regulatory consequences if not remediated"
}}"""),
    ("human", """POLICY DOCUMENT ANALYSIS SUMMARY:

Total Chunks Analyzed: {total_chunks}
Chunks with Findings: {analyzed_chunks}

INDIVIDUAL FINDINGS SUMMARY:
{findings_summary}

HIGH RISK GAPS: {high_risk_count}
MEDIUM RISK GAPS: {medium_risk_count}
LOW RISK GAPS: {low_risk_count}

AFFECTED REGULATIONS:
{affected_regulations}

Now provide a comprehensive legal determination and synthesis."""),
])

class AnalyticsService:
    @staticmethod
    async def compare_policy_to_regulations(policy_chunks: List[str]) -> Dict[str, Any]:
        """
        Performs a comprehensive gap analysis for a set of policy chunks.
        Includes per-chunk analysis AND a unified legal determination.
        """
        overall_report = {
            "total_chunks": len(policy_chunks),
            "findings": [],
            "overall_alignment_score": 0.0,
            "comprehensive_synthesis": None,  # Will be populated below
        }
        
        total_score = 0
        
        # Analyze top 5 chunks for depth (to avoid excessive LLM calls in one go)
        # In production, this would be a background task for all chunks.
        chunks_to_analyze = policy_chunks[:5] 
        
        for chunk in chunks_to_analyze:
            # 1. Find similar regulations
            similar_regs = semantic_search(
                query_text=chunk,
                top_k=3,
                score_threshold=0.35,
                source_type_filter="regulation"
            )
            
            if not similar_regs:
                continue
                
            context = "\n\n".join([f"REG: {r['title']}\n{r['text']}" for r in similar_regs])
            
            # 2. Run LLM Analysis
            try:
                llm = LLMFactory.get_llm(temperature=0)
                chain = GAP_ANALYSIS_PROMPT | llm | StrOutputParser()
                
                raw_response = await chain.ainvoke({
                    "policy_chunk": chunk,
                    "regulatory_context": context
                })
                
                # Clean and parse JSON
                clean_json = raw_response.strip().replace("```json", "").replace("```", "")
                finding = json.loads(clean_json)
                finding["chunk_preview"] = chunk[:100] + "..."
                finding["matched_regulations"] = [r["title"] for r in similar_regs]
                
                overall_report["findings"].append(finding)
                
                # Heuristic score
                score = 1.0
                if finding["risk_impact"] == "HIGH": score = 0.3
                elif finding["risk_impact"] == "MEDIUM": score = 0.6
                
                total_score += score
                
            except Exception as e:
                logger.error(f"Gap analysis failed for chunk: {e}")
                
        if chunks_to_analyze:
            overall_report["overall_alignment_score"] = round((total_score / len(chunks_to_analyze)) * 100, 1)
        
        # ===== NEW: COMPREHENSIVE LEGAL SYNTHESIS =====
        # Combine all findings and provide holistic legal determination
        if overall_report["findings"]:
            try:
                synthesis = await AnalyticsService._synthesize_findings(
                    total_chunks=len(policy_chunks),
                    findings=overall_report["findings"],
                    alignment_score=overall_report["overall_alignment_score"]
                )
                overall_report["comprehensive_synthesis"] = synthesis
            except Exception as e:
                logger.error(f"Comprehensive synthesis failed: {e}")
                overall_report["comprehensive_synthesis"] = {
                    "error": "Synthesis analysis failed - manual review recommended"
                }
            
        return overall_report

    @staticmethod
    async def _synthesize_findings(
        total_chunks: int,
        findings: List[Dict],
        alignment_score: float
    ) -> Dict[str, Any]:
        """
        Synthesize individual chunk findings into a comprehensive legal determination.
        Combines all gaps, identifies patterns, and provides unified verdict.
        """
        # Count risk levels
        high_risk = sum(1 for f in findings if f.get("risk_impact") == "HIGH")
        medium_risk = sum(1 for f in findings if f.get("risk_impact") == "MEDIUM")
        low_risk = sum(1 for f in findings if f.get("risk_impact") == "LOW")
        
        # Collect all regulations cited
        all_regulations = set()
        for finding in findings:
            all_regulations.update(finding.get("matched_regulations", []))
        
        # Compile findings summary
        findings_summary = "\n".join([
            f"- [{finding.get('risk_impact', 'UNKNOWN')}] {finding.get('alignment_summary', '')}"
            for finding in findings[:5]
        ])
        
        # Build synthesis prompt
        llm = LLMFactory.get_llm(temperature=0, max_tokens=2500)
        chain = COMPREHENSIVE_SYNTHESIS_PROMPT | llm | StrOutputParser()
        
        raw_response = await chain.ainvoke({
            "total_chunks": total_chunks,
            "analyzed_chunks": len(findings),
            "findings_summary": findings_summary,
            "high_risk_count": high_risk,
            "medium_risk_count": medium_risk,
            "low_risk_count": low_risk,
            "affected_regulations": ", ".join(list(all_regulations)[:10]),
        })
        
        # Parse synthesis response
        clean_json = raw_response.strip().replace("```json", "").replace("```", "")
        synthesis = json.loads(clean_json)
        
        logger.info(f"📋 Comprehensive Synthesis Complete - Status: {synthesis.get('overall_compliance_status')}")
        
        return synthesis
