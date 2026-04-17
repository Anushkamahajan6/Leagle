import io
import logging
from pypdf import PdfReader
from sqlalchemy.ext.asyncio import AsyncSession
from models.regulation import Regulation
from models.policy import Policy
from services.qdrant_service import embed_and_upsert, ensure_collection_exists

logger = logging.getLogger(__name__)

def parse_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    reader = PdfReader(io.BytesIO(file_bytes))
    text_parts = []
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text_parts.append(extracted.strip())
    return "\n\n".join(text_parts)

async def ingest_regulation(
    db: AsyncSession,
    title: str,
    text: str,
    source: str | None = None,
    category: str | None = None,
    jurisdiction: str | None = None,
    effective_date=None,
) -> Regulation:
    """
    Full ingestion pipeline for a regulation:
    1. Save raw text to PostgreSQL
    2. Chunk + embed + upsert to Qdrant
    3. Update PostgreSQL record with Qdrant chunk IDs
    4. Run risk scorer
    """
    ensure_collection_exists()

    # Step 1: Create PostgreSQL record (without Qdrant IDs yet)
    regulation = Regulation(
        title=title,
        raw_text=text,
        source=source,
        category=category,
        jurisdiction=jurisdiction,
        effective_date=effective_date,
    )
    db.add(regulation)
    await db.flush()   # get the UUID without committing

    # Step 2: Embed + store in Qdrant
    metadata = {
        "regulation_id": str(regulation.id),
        "title": title,
        "source": source or "",
        "category": category or "uncategorized",
        "jurisdiction": jurisdiction or "",
    }
    point_ids = embed_and_upsert(text=text, metadata=metadata, source_type="regulation")

    # Step 3: Update record with Qdrant IDs
    regulation.qdrant_ids = point_ids

    # Step 4: Score risk (import here to avoid circular imports)
    from services.risk_scorer import score_regulation
    regulation.risk_level = score_regulation(text)

    await db.commit()
    await db.refresh(regulation)

    logger.info(f"Ingested regulation: {title} | Risk: {regulation.risk_level} | Chunks: {len(point_ids)}")
    return regulation

async def ingest_policy(
    db: AsyncSession,
    title: str,
    content: str,
    department: str | None = None,
    owner: str | None = None,
) -> Policy:
    """Ingest a company policy — same pipeline as regulation."""
    ensure_collection_exists()

    policy = Policy(title=title, content=content, department=department, owner=owner)
    db.add(policy)
    await db.flush()

    metadata = {
        "policy_id": str(policy.id),
        "title": title,
        "department": department or "",
    }
    point_ids = embed_and_upsert(text=content, metadata=metadata, source_type="policy")
    policy.qdrant_ids = point_ids

    await db.commit()
    await db.refresh(policy)
    return policy
