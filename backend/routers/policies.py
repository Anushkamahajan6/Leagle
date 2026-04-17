from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
from datetime import datetime
import logging
from sqlalchemy import select

from services.qdrant_service import embed_and_upsert, semantic_search
from models.policy import Policy
from core.database import get_db, AsyncSession

router = APIRouter(prefix="/api/policies", tags=["policies"])
logger = logging.getLogger(__name__)


# Request/Response models
class PolicyIngestRequest(BaseModel):
    title: str
    content: str
    department: str
    owner: str
    version: str = "1.0"


class PolicyResponse(BaseModel):
    id: str
    title: str
    content: str
    department: str
    owner: str
    version: str
    qdrant_ids: list
    created_at: datetime

    class Config:
        from_attributes = True


class ComplianceCheckResponse(BaseModel):
    policy_id: str
    policy_title: str
    compliance_score: float
    applicable_regulations: int
    gaps: list[str]
    status: str


# POST Endpoint: Ingest new policy
@router.post("/ingest", response_model=PolicyResponse)
async def ingest_policy(
    request: PolicyIngestRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest a company policy:
    1. Embed to Qdrant for semantic search
    2. Store in PostgreSQL
    3. Return policy ID
    """
    try:
        # Embed to Qdrant
        qdrant_ids = embed_and_upsert(
            text=request.content,
            metadata={
                "title": request.title,
                "department": request.department,
                "owner": request.owner,
            },
            source_type="policy"
        )
        
        # Store in PostgreSQL
        policy = Policy(
            id=uuid4(),
            title=request.title,
            content=request.content,
            department=request.department,
            owner=request.owner,
            version=request.version,
            qdrant_ids=qdrant_ids,
        )
        
        db.add(policy)
        await db.commit()
        await db.refresh(policy)
        
        logger.info(f"✅ Ingested policy '{request.title}' ({len(qdrant_ids)} chunks)")
        
        return policy
    
    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Error ingesting policy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# GET Endpoint: Retrieve policy by ID
@router.get("/{policy_id}", response_model=PolicyResponse)
async def get_policy(
    policy_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get policy by ID with metadata"""
    try:
        result = await db.execute(
            select(Policy).where(Policy.id == policy_id)
        )
        policy = result.scalar_one_or_none()
        
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        return policy
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error retrieving policy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# GET Endpoint: List all policies
@router.get("")
async def list_policies(
    skip: int = 0,
    limit: int = 10,
    department: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all policies with optional filtering"""
    try:
        query = select(Policy)
        
        if department:
            query = query.where(Policy.department == department)
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        policies = result.scalars().all()
        
        return {
            "total": len(policies),
            "skip": skip,
            "limit": limit,
            "policies": policies
        }
    
    except Exception as e:
        logger.error(f"❌ Error listing policies: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# POST Endpoint: Check policy compliance
@router.post("/{policy_id}/compliance-check")
async def compliance_check(
    policy_id: str,
    category_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze policy against relevant regulations.
    Returns compliance score and gaps.
    
    FLOW:
    1. Get policy from PostgreSQL
    2. Semantic search: Find all applicable regulations in Qdrant
    3. For each regulation, analyze compliance (placeholder for RAG)
    4. Aggregate results → return compliance report
    """
    try:
        # Get policy
        result = await db.execute(
            select(Policy).where(Policy.id == policy_id)
        )
        policy = result.scalar_one_or_none()
        
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        # Find applicable regulations using semantic search
        similar_regulations = semantic_search(
            query_text=policy.content,
            top_k=10,
            score_threshold=0.3,
            category_filter=category_filter
        )
        
        # Placeholder: Real RAG pipeline will complete the LLM analysis
        logger.info(f"🔍 Found {len(similar_regulations)} applicable regulations for '{policy.title}'")
        
        return ComplianceCheckResponse(
            policy_id=policy_id,
            policy_title=policy.title,
            compliance_score=86.0,
            applicable_regulations=len(similar_regulations),
            gaps=[
                "GDPR Art 5c: Retention period exceeds standard (1 year vs 6 months recommended)",
                "DPDP Act: Missing erasure procedure"
            ],
            status="REQUIRES_REVIEW"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in compliance check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# DELETE Endpoint: Delete policy
@router.delete("/{policy_id}")
async def delete_policy(
    policy_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a policy and remove its vectors from Qdrant"""
    try:
        result = await db.execute(
            select(Policy).where(Policy.id == policy_id)
        )
        policy = result.scalar_one_or_none()
        
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        # Remove vectors from Qdrant
        if policy.qdrant_ids:
            from services.qdrant_service import delete_points
            delete_points(policy.qdrant_ids)
        
        # Delete from PostgreSQL
        await db.delete(policy)
        await db.commit()
        
        logger.info(f"✅ Deleted policy '{policy.title}'")
        
        return {"status": "deleted", "policy_id": policy_id}
    
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Error deleting policy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
