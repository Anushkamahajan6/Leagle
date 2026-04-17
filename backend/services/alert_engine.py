import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.regulation import Regulation
from models.policy import Policy
from models.impact import ImpactMapping
from models.alert import Alert
from services.qdrant_service import semantic_search
from services.risk_scorer import score_to_level
from services.websocket_service import broadcast_alert

logger = logging.getLogger(__name__)

SIMILARITY_THRESHOLDS = {
    "HIGH": 0.65,      # Lowered from 0.75 to surface more critical matches
    "MEDIUM": 0.45,    # Lowered from 0.50
    "LOW": 0.25,       # Lowered from 0.30
}

async def run_impact_analysis(
    db: AsyncSession,
    regulation: Regulation,
) -> list[ImpactMapping]:
    """
    For a newly ingested regulation:
    1. Search Qdrant for similar policy chunks (source_type=policy)
    2. Create ImpactMapping records
    3. Fire alerts for HIGH/MEDIUM impacts
    Returns list of created ImpactMapping records.
    """
    if not regulation.raw_text:
        return []

    # Search specifically in policy vectors
    similar_policies = semantic_search(
        query_text=regulation.raw_text[:1000],   # use first 1000 chars as query
        top_k=20,                               # increased from 10
        source_type_filter="policy",
        score_threshold=SIMILARITY_THRESHOLDS["LOW"],
    )

    # Deduplicate by policy_id (take the highest score per policy)
    seen_policy_ids: dict[str, dict] = {}
    for result in similar_policies:
        pid = result.get("policy_id")
        if pid and (pid not in seen_policy_ids or result["score"] > seen_policy_ids[pid]["score"]):
            seen_policy_ids[pid] = result

    mappings_created = []

    for policy_id_str, result in seen_policy_ids.items():
        score = result["score"]
        
        # Priority-Aware Risk Logic
        # If the regulation is high risk (>70) or priority, we boost the impact level
        is_high_risk_reg = regulation.risk_level and regulation.risk_level > 70
        
        if score >= SIMILARITY_THRESHOLDS["HIGH"] or (score >= 0.55 and is_high_risk_reg):
            impact_level = "HIGH"
        elif score >= SIMILARITY_THRESHOLDS["MEDIUM"] or (score >= 0.35 and is_high_risk_reg):
            impact_level = "MEDIUM"
        else:
            impact_level = "LOW"

        # Verify policy exists in SQL before mapping
        pol_check = await db.execute(select(Policy).where(Policy.id == policy_id_str))
        if not pol_check.scalar_one_or_none():
            logger.warning(f"⚠️ Policy {policy_id_str} in Qdrant but not in SQL. Skipping.")
            continue

        # Check if mapping already exists
        existing = await db.execute(
            select(ImpactMapping).where(
                ImpactMapping.regulation_id == regulation.id,
                ImpactMapping.policy_id == policy_id_str,
            )
        )
        if existing.scalar_one_or_none():
            continue

        mapping = ImpactMapping(
            regulation_id=regulation.id,
            policy_id=policy_id_str,
            similarity=score,
            impact_level=impact_level,
            status="OPEN",
        )
        db.add(mapping)
        mappings_created.append(mapping)

        # Create alert for HIGH and MEDIUM impacts
        if impact_level in ("HIGH", "MEDIUM"):
            alert = Alert(
                regulation_id=regulation.id,
                severity=impact_level,
                title=f"New Compliance Risk: {regulation.title}",
                message=(
                    f"{impact_level} impact detected: Regulation '{regulation.title}' "
                    f"affects policy (similarity: {score:.2f}). "
                    f"Risk score: {regulation.risk_level}/100."
                ),
            )
            db.add(alert)
            
            # Broadcast real-time alert via WebSocket
            await broadcast_alert({
                "id": str(alert.id) if hasattr(alert, 'id') else "new",
                "severity": alert.severity,
                "message": alert.message,
                "regulation_title": regulation.title
            })

    await db.commit()
    logger.info(f"Created {len(mappings_created)} impact mappings for: {regulation.title}")
    return mappings_created
