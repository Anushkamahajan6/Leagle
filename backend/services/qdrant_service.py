"""
Qdrant Vector Database Service

This module handles all interactions with Qdrant:
- Creating and managing collections
- Embedding text using sentence-transformers
- Upserting vectors into Qdrant
- Semantic search queries

Qdrant is used as the core semantic search engine for finding
similar regulations and policies based on meaning, not keywords.
"""

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)
from sentence_transformers import SentenceTransformer
from core.config import settings
import uuid
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
VECTOR_SIZE = 384
COLLECTION_NAME = settings.qdrant_collection  # "regulations_v1"

# ─────────────────────────────────────────────────────────────────────────────
# SINGLETON INSTANCES
# ─────────────────────────────────────────────────────────────────────────────

_qdrant_client: QdrantClient | None = None
_embedding_model: SentenceTransformer | None = None


def get_qdrant_client() -> QdrantClient:
    """Get or create Qdrant client singleton"""
    global _qdrant_client
    if _qdrant_client is None:
        _qdrant_client = QdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port,
        )
        logger.info(f"✅ Connected to Qdrant at {settings.qdrant_host}:{settings.qdrant_port}")
    return _qdrant_client


def get_embedding_model() -> SentenceTransformer:
    """Load embedding model once and reuse"""
    global _embedding_model
    if _embedding_model is None:
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL}")
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL)
    return _embedding_model


def ensure_collection_exists() -> None:
    """
    Create Qdrant collection if it doesn't exist.
    This is idempotent - safe to call multiple times.
    """
    client = get_qdrant_client()
    
    try:
        # Check if collection exists
        collections = client.get_collections()
        collection_names = [col.name for col in collections.collections]
        
        if COLLECTION_NAME in collection_names:
            logger.info(f"✅ Collection '{COLLECTION_NAME}' already exists")
            return
        
        # Create collection with cosine similarity distance
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE,
            ),
        )
        logger.info(f"✅ Created Qdrant collection: {COLLECTION_NAME}")
    except Exception as e:
        logger.error(f"❌ Error ensuring collection exists: {e}")
        raise


def chunk_text(text: str, max_tokens: int = 1500) -> List[str]:
    """
    Split text into larger chunks (~1500 tokens each) for scalability.
    Simple approach: split by sentences, accumulate until max_tokens reached.
    """
    if not text:
        return []
    
    # Simple heuristic: ~1 token ≈ 4 characters (rough estimate for English)
    max_chars = max_tokens * 4
    sentences = text.split(". ")
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        sentence = sentence.strip() + "."
        if len(current_chunk) + len(sentence) < max_chars:
            current_chunk += " " + sentence
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return [c for c in chunks if c]  # Filter empty chunks


def embed_and_upsert(
    text: str,
    metadata: Dict[str, Any],
    source_type: str = "regulation",
) -> List[str]:
    """
    Embed text chunks and upsert them to Qdrant.
    
    Args:
        text: The document text to embed
        metadata: Dict with regulation_id, title, category, etc.
        source_type: "regulation" or "policy"
    
    Returns:
        List of point IDs created in Qdrant
    """
    ensure_collection_exists()
    
    # Chunk and embed
    chunks = chunk_text(text)
    model = get_embedding_model()
    client = get_qdrant_client()
    
    point_ids = []
    points = []
    
    for i, chunk in enumerate(chunks):
        vector = model.encode(chunk).tolist()
        point_id = str(uuid.uuid4())
        
        payload = {
            **metadata,
            "chest_index": i,
            "text": chunk[:1000],  # Truncate to 1000 chars in payload
            "source_type": source_type,
        }
        
        points.append(PointStruct(
            id=point_id,
            vector=vector,
            payload=payload,
        ))
        point_ids.append(point_id)
    
    # Upsert to Qdrant
    if points:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points,
        )
        logger.info(f"✅ Upserted {len(points)} chunks to Qdrant")
    
    return point_ids


def semantic_search(
    query_text: str,
    top_k: int = 5,
    score_threshold: float = 0.3,
    category_filter: str | None = None,
    source_type_filter: str | None = None,
) -> List[Dict[str, Any]]:
    """
    Search for semantically similar documents in Qdrant.
    
    Args:
        query_text: Query string
        top_k: Number of results to return
        score_threshold: Minimum cosine similarity (0-1)
        category_filter: Optional category to filter by
    
    Returns:
        List of matching documents with scores
    """
    ensure_collection_exists()
    
    model = get_embedding_model()
    client = get_qdrant_client()
    
    # Embed query
    query_vector = model.encode(query_text).tolist()
    
    # Optional filter
    must_conditions = []
    query_filter = None
    if category_filter:
        must_conditions.append(FieldCondition(key="category", match=MatchValue(value=category_filter)))
    
    if source_type_filter:
        must_conditions.append(FieldCondition(key="source_type", match=MatchValue(value=source_type_filter)))
    
    if must_conditions:
        query_filter = Filter(must=must_conditions)
    
    # Search
    response = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=query_filter,
        limit=top_k,
        with_payload=True,
        score_threshold=score_threshold,
    )
    results = response.points
    
    return [
        {
            "id": hit.id,
            "score": hit.score,
            "text": hit.payload.get("text", "")[:500],
            "title": hit.payload.get("title", ""),
            "category": hit.payload.get("category", ""),
            "regulation_id": hit.payload.get("regulation_id", ""),
            "policy_id": hit.payload.get("policy_id", ""),
            "source_type": hit.payload.get("source_type", ""),
            "storage_path": hit.payload.get("storage_path"),
        }
        for hit in results
    ]


def delete_points(point_ids: List[str]) -> None:
    """Remove points from Qdrant (e.g., when deleting a regulation)"""
    if not point_ids:
        return
    
    client = get_qdrant_client()
    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=point_ids,
    )
    logger.info(f"✅ Deleted {len(point_ids)} points from Qdrant")
