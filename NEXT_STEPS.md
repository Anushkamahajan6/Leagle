# Next Steps - FastAPI Implementation Guide

**Current Status**: Phase 6 Complete (Dataset Integration)  
**Next Phase**: Phase 7 (FastAPI Routers)  
**Estimated Duration**: 3-4 hours to MVP functionality  

---

## What We Have Ready ✅

✅ Python 3.14 environment with 40+ packages  
✅ Qdrant vector database with 9 demo chunks indexed  
✅ PostgreSQL schema (models defined, migration ready)  
✅ Dataset loaders for SEC, legal cases, regulations  
✅ Semantic search function tested and working  
✅ Embedding model (all-MiniLM-L6-v2) loaded and ready  

---

## Phase 7: FastAPI Router Implementation

### Step 1: Create Regulations Router

**File**: `backend/routers/regulations.py`

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
import logging

from backend.services.qdrant_service import embed_and_upsert, semantic_search
from backend.models.regulation import Regulation
from backend.core.database import get_db

router = APIRouter(prefix="/api/regulations", tags=["regulations"])
logger = logging.getLogger(__name__)

# Request models
class RegulationIngestRequest(BaseModel):
    title: str
    text: str
    category: str  # "data_privacy", "security", "financial", etc.
    source: str  # "GDPR", "DPDP_ACT", "SEC", etc.
    jurisdiction: str  # "EU", "INDIA", "US", etc.
    effective_date: Optional[str] = None

class RegulationResponse(BaseModel):
    id: str
    title: str
    category: str
    source: str
    jurisdiction: str
    risk_level: int
    qdrant_ids: list[int]

# POST Endpoint: Ingest new regulation
@router.post("/ingest", response_model=RegulationResponse)
async def ingest_regulation(request: RegulationIngestRequest, db = Depends(get_db)):
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
        
        return RegulationResponse(
            id=str(regulation.id),
            title=regulation.title,
            category=regulation.category,
            source=regulation.source,
            jurisdiction=regulation.jurisdiction,
            risk_level=regulation.risk_level,
            qdrant_ids=qdrant_ids
        )
    
    except Exception as e:
        logger.error(f"❌ Error ingesting regulation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# GET Endpoint: Retrieve regulation by ID
@router.get("/{regulation_id}", response_model=RegulationResponse)
async def get_regulation(regulation_id: str, db = Depends(get_db)):
    """Get regulation by ID with metadata"""
    regulation = await db.query(Regulation).filter(
        Regulation.id == regulation_id
    ).first()
    
    if not regulation:
        raise HTTPException(status_code=404, detail="Regulation not found")
    
    return RegulationResponse(
        id=str(regulation.id),
        title=regulation.title,
        category=regulation.category,
        source=regulation.source,
        jurisdiction=regulation.jurisdiction,
        risk_level=regulation.risk_level,
        qdrant_ids=regulation.qdrant_ids
    )

# GET Endpoint: Find similar regulations
@router.get("/{regulation_id}/similar")
async def get_similar_regulations(
    regulation_id: str, 
    top_k: int = 5,
    score_threshold: float = 0.3,
    db = Depends(get_db)
):
    """
    Find regulations and policies similar to the given regulation.
    Uses Qdrant semantic search.
    
    Example: /api/regulations/abc123/similar?top_k=5&score_threshold=0.3
    """
    try:
        # Get the regulation text
        regulation = await db.query(Regulation).filter(
            Regulation.id == regulation_id
        ).first()
        
        if not regulation:
            raise HTTPException(status_code=404, detail="Regulation not found")
        
        # Semantic search using Qdrant
        similar_docs = semantic_search(
            query_text=regulation.raw_text,
            top_k=top_k,
            score_threshold=score_threshold
        )
        
        return {
            "regulation_id": regulation_id,
            "query_title": regulation.title,
            "similar_documents": [
                {
                    "qdrant_id": doc["id"],
                    "title": doc["payload"]["title"],
                    "source_type": doc["payload"]["source_type"],
                    "source": doc["payload"]["source"],
                    "similarity_score": doc["score"],
                }
                for doc in similar_docs
            ],
            "total_results": len(similar_docs)
        }
    
    except Exception as e:
        logger.error(f"❌ Error searching similar regulations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

### Step 2: Create Policies Router

**File**: `backend/routers/policies.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from uuid import uuid4
import logging

from backend.services.qdrant_service import embed_and_upsert, semantic_search
from backend.models.policy import Policy
from backend.core.database import get_db

router = APIRouter(prefix="/api/policies", tags=["policies"])
logger = logging.getLogger(__name__)

class PolicyIngestRequest(BaseModel):
    title: str
    content: str
    department: str  # "Legal", "IT", "Security", etc.
    owner: str  # Email
    version: str = "1.0"

class PolicyResponse(BaseModel):
    id: str
    title: str
    content: str
    department: str
    owner: str
    version: str
    qdrant_ids: list[int]

# POST Endpoint: Ingest new policy
@router.post("/ingest", response_model=PolicyResponse)
async def ingest_policy(request: PolicyIngestRequest, db = Depends(get_db)):
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
        
        return PolicyResponse(
            id=str(policy.id),
            title=policy.title,
            content=policy.content,
            department=policy.department,
            owner=policy.owner,
            version=policy.version,
            qdrant_ids=qdrant_ids
        )
    
    except Exception as e:
        logger.error(f"❌ Error ingesting policy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# POST Endpoint: Check policy compliance
@router.post("/{policy_id}/compliance-check")
async def compliance_check(policy_id: str, db = Depends(get_db)):
    """
    Analyze policy against relevant regulations.
    Returns compliance score and gaps.
    
    FLOW:
    1. Get policy from PostgreSQL
    2. Semantic search: Find all applicable regulations in Qdrant
    3. For each regulation, call RAG to analyze compliance
    4. Aggregate results → return compliance report
    """
    try:
        # Get policy
        policy = await db.query(Policy).filter(Policy.id == policy_id).first()
        
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        # Find applicable regulations using semantic search
        similar_regulations = semantic_search(
            query_text=policy.content,
            top_k=10,
            score_threshold=0.3,
            category_filter="data_privacy"  # Can be parameterized
        )
        
        # This is a placeholder - RAG pipeline implementation will complete the LLM analysis
        return {
            "policy_id": policy_id,
            "policy_title": policy.title,
            "compliance_score": 86,  # Placeholder
            "applicable_regulations": len(similar_regulations),
            "gaps": [
                "GDPR Art 5c: Retention period exceeds standard (1 year vs 6 months recommended)",
                "DPDP Act: Missing erasure procedure"
            ],
            "status": "REQUIRES_REVIEW"
        }
    
    except Exception as e:
        logger.error(f"❌ Error in compliance check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

### Step 3: Update FastAPI Main App

**File**: `backend/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from backend.routers import regulations, policies  # Add more as you create them
from backend.core.database import create_tables

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CodeWizards AI Compliance API",
    description="Semantic regulation analysis and compliance management",
    version="0.1.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(regulations.router)
app.include_router(policies.router)
# More routers will be added here:
# app.include_router(impact.router)
# app.include_router(alerts.router)
# app.include_router(rag.router)

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    await create_tables()
    logger.info("✅ FastAPI server started")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "CodeWizards Compliance API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Testing Phase 7

### Step 1: Start Backend

```bash
cd backend
source venv/bin/activate
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     ✅ FastAPI server started
```

### Step 2: Test Regulation Ingestion

```bash
curl -X POST http://localhost:8000/api/regulations/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "title": "GDPR Article 37",
    "text": "Member States shall provide that each controller and processor shall designate a data protection officer...",
    "category": "data_privacy",
    "source": "GDPR",
    "jurisdiction": "EU",
    "effective_date": "2018-05-25"
  }'
```

Expected response:
```json
{
  "id": "abc-123-def",
  "title": "GDPR Article 37",
  "category": "data_privacy",
  "source": "GDPR",
  "jurisdiction": "EU",
  "risk_level": 50,
  "qdrant_ids": [1, 2, 3]
}
```

### Step 3: Test Policy Ingestion

```bash
curl -X POST http://localhost:8000/api/policies/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Data Protection Officer Policy",
    "content": "Our company designates Jane Smith as DPO. She is responsible for...",
    "department": "Legal",
    "owner": "jane@company.com",
    "version": "1.0"
  }'
```

### Step 4: Test Semantic Search

```bash
curl http://localhost:8000/api/regulations/abc-123-def/similar?top_k=5
```

Should return similar regulations/policies from Qdrant.

---

## Next Phases (After Phase 7)

### Phase 8: RAG Pipeline (2-3 hours)
- Implement LangChain + Gemini integration
- Create prompt templates for impact analysis
- Wire up `/api/impact/analyze` endpoint

### Phase 9: React Components (6-8 hours)
- Dashboard page showing all regulations
- Compliance checker form
- Impact analysis viewer
- Alert list with real-time updates

### Phase 10: ML Risk Scorer (1-2 hours)
- Train scikit-learn model on legal case data
- Integrate into regulation ingestion workflow
- Expose risk predictions in API

---

## Key Files to Create/Edit

| File | Status | Next Action |
|------|--------|------------|
| `backend/routers/regulations.py` | ⬜ To-Do | Create from template above |
| `backend/routers/policies.py` | ⬜ To-Do | Create from template above |
| `backend/main.py` | ⬜ To-Do | Update with router includes |
| `backend/routers/impact.py` | ⬜ To-Do | Create after Phase 7 |
| `backend/routers/alerts.py` | ⬜ To-Do | Create after Phase 7 |
| `backend/routers/rag.py` | ⬜ To-Do | Create in Phase 8 |

---

## API Documentation

After implementing routers, access auto-generated API docs:

- **Interactive Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

---

## Summary

**Ready to implement**: Copy the router code above into the appropriate files.  
**Test thoroughly**: Use curl or Postman to validate endpoints.  
**Move fast**: These routers are the gateway to the entire system.  

**Questions?** Refer to:
- [SYSTEM_ARCHITECTURE.md](../SYSTEM_ARCHITECTURE.md) - API endpoint specs
- [DATASETS.md](../DATASETS.md) - Data flow through system
- [PROGRESS.md](../PROGRESS.md) - What's complete vs. to-do

