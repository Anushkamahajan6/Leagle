from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
from datetime import datetime
import logging
from sqlalchemy import select

from services.qdrant_service import embed_and_upsert, semantic_search
from models.regulation import Regulation
from core.database import get_db, AsyncSession

router = APIRouter(prefix="/api/regulations", tags=["regulations"])
logger = logging.getLogger(__name__)


# Request/Response models
class RegulationIngestRequest(BaseModel):
    title: str
    text: str
    category: str
    source: str
    jurisdiction: str
    effective_date: Optional[str] = None


class RegulationResponse(BaseModel):
    id: str
    title: str
    category: str
    source: str
    jurisdiction: str
    risk_level: int
    qdrant_ids: list
    created_at: datetime

    class Config:
        from_attributes = True


class SimilarDocumentResponse(BaseModel):
    qdrant_id: int
    title: str
    source_type: str
    source: str
    similarity_score: float


class SimilarRegulationsResponse(BaseModel):
    regulation_id: str
    query_title: str
    similar_documents: list[SimilarDocumentResponse]
    total_results: int


# POST Endpoint: Ingest new regulation
@router.post("/ingest", response_model=RegulationResponse)
async def ingest_regulation(
    request: RegulationIngestRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest a new regulation:
    1. Embed text chunks to Qdrant
    2. Store regulation record in PostgreSQL
    3. Return regulation ID and chunk IDs
    
    Example:
    {
      "title": "GDPR Article 36",
      "text": "Where required, the controller shall...",
      "category": "data_privacy",
      "source": "GDPR",
      "jurisdiction": "EU",
      "effective_date": "2018-05-25"
    }
    """
    try:
        # 1. Embed and upsert to Qdrant
        qdrant_ids = embed_and_upsert(
            text=request.text,
            metadata={
                "title": request.title,
                "source": request.source,
                "jurisdiction": request.jurisdiction,
                "category": request.category,
            },
            source_type="regulation"
        )
        
        # 2. Create regulation record in PostgreSQL
        regulation = Regulation(
            id=uuid4(),
            title=request.title,
            category=request.category,
            raw_text=request.text,
            source=request.source,
            jurisdiction=request.jurisdiction,
            effective_date=request.effective_date,
            qdrant_ids=qdrant_ids,
            risk_level=50,  # Default, will be updated by ML model
        )
        
        db.add(regulation)
        await db.commit()
        await db.refresh(regulation)
        
        logger.info(f"✅ Ingested regulation '{request.title}' ({len(qdrant_ids)} chunks)")
        
        return regulation
    
    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Error ingesting regulation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# GET Endpoint: Retrieve regulation by ID
@router.get("/{regulation_id}", response_model=RegulationResponse)
async def get_regulation(
    regulation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get regulation by ID with metadata"""
    try:
        result = await db.execute(
            select(Regulation).where(Regulation.id == regulation_id)
        )
        regulation = result.scalar_one_or_none()
        
        if not regulation:
            raise HTTPException(status_code=404, detail="Regulation not found")
        
        return regulation
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error retrieving regulation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# GET Endpoint: List all regulations
@router.get("")
async def list_regulations(
    skip: int = 0,
    limit: int = 10,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all regulations with optional filtering"""
    try:
        query = select(Regulation)
        
        if category:
            query = query.where(Regulation.category == category)
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        regulations = result.scalars().all()
        
        return {
            "total": len(regulations),
            "skip": skip,
            "limit": limit,
            "regulations": regulations
        }
    
    except Exception as e:
        logger.error(f"❌ Error listing regulations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# GET Endpoint: Find similar regulations
@router.get("/{regulation_id}/similar")
async def get_similar_regulations(
    regulation_id: str,
    top_k: int = 5,
    score_threshold: float = 0.3,
    db: AsyncSession = Depends(get_db)
):
    """
    Find regulations and policies similar to the given regulation.
    Uses Qdrant semantic search.
    
    Example: /api/regulations/abc123/similar?top_k=5&score_threshold=0.3
    """
    try:
        # Get the regulation text
        result = await db.execute(
            select(Regulation).where(Regulation.id == regulation_id)
        )
        regulation = result.scalar_one_or_none()
        
        if not regulation:
            raise HTTPException(status_code=404, detail="Regulation not found")
        
        # Semantic search using Qdrant
        similar_docs = semantic_search(
            query_text=regulation.raw_text,
            top_k=top_k,
            score_threshold=score_threshold
        )
        
        return SimilarRegulationsResponse(
            regulation_id=regulation_id,
            query_title=regulation.title,
            similar_documents=[
                SimilarDocumentResponse(
                    qdrant_id=doc["id"],
                    title=doc["payload"].get("title", "Unknown"),
                    source_type=doc["payload"].get("source_type", "unknown"),
                    source=doc["payload"].get("source", "unknown"),
                    similarity_score=doc["score"],
                )
                for doc in similar_docs
            ],
            total_results=len(similar_docs)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error searching similar regulations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# DELETE Endpoint: Delete regulation
@router.delete("/{regulation_id}")
async def delete_regulation(
    regulation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a regulation and remove its vectors from Qdrant"""
    try:
        result = await db.execute(
            select(Regulation).where(Regulation.id == regulation_id)
        )
        regulation = result.scalar_one_or_none()
        
        if not regulation:
            raise HTTPException(status_code=404, detail="Regulation not found")
        
        # Remove vectors from Qdrant
        if regulation.qdrant_ids:
            from services.qdrant_service import delete_points
            delete_points(regulation.qdrant_ids)
        
        # Delete from PostgreSQL
        await db.delete(regulation)
        await db.commit()
        
        logger.info(f"✅ Deleted regulation '{regulation.title}'")
        
        return {"status": "deleted", "regulation_id": regulation_id}
    
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Error deleting regulation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
