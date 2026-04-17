from fastapi import APIRouter, Request
from fastapi.responses import Response
import requests
import os
import logging

# Import your existing pipeline services
from services.pdf_service import extract_text_from_pdf
from services.chunk_service import split_text
from services.embedding_service import generate_embeddings

router = APIRouter()
logger = logging.getLogger(__name__)

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

logger.info(f"✅ Twilio initialized: SID={TWILIO_ACCOUNT_SID[:10]}...")


@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    """
    Webhook for Twilio WhatsApp PDF ingestion.
    Flow: Twilio → Download PDF → Extract → Chunk → Embed → Reply
    """
    try:
        # 1️⃣ Parse Twilio form data
        form = await request.form()
        logger.info(f"📬 Webhook received | Form keys: {list(form.keys())}")
        
        from_number = form.get("From", "unknown")
        num_media = int(form.get("NumMedia", 0))
        logger.info(f"📲 Message from: {from_number} | Media count: {num_media}")

        # 2️⃣ Check if media attached
        if num_media == 0:
            logger.warning("⚠️ No media received")
            return Response(
                content="""<Response><Message>Please send a PDF file 📄</Message></Response>""",
                media_type="application/xml",
                status_code=200
            )

        # 3️⃣ Extract media URL and type
        media_url = form.get("MediaUrl0")
        media_type = form.get("MediaContentType0")
        logger.info(f"📎 Media: {media_type} | URL: {media_url[:50]}...")

        # 4️⃣ Validate PDF
        if not media_type or "pdf" not in media_type.lower():
            logger.warning(f"❌ Invalid media type: {media_type}")
            return Response(
                content="""<Response><Message>Only PDF files are supported 📄</Message></Response>""",
                media_type="application/xml",
                status_code=200
            )

        # 5️⃣ Download PDF from Twilio
        try:
            logger.info(f"⬇️  Downloading PDF from Twilio...")
            response = requests.get(
                media_url,
                auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
                timeout=30
            )
            response.raise_for_status()
            pdf_bytes = response.content
            logger.info(f"✅ PDF downloaded: {len(pdf_bytes)} bytes")
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Failed to download PDF: {str(e)}")
            return Response(
                content=f"""<Response><Message>Failed to download PDF: {str(e)}</Message></Response>""",
                media_type="application/xml",
                status_code=200
            )

        # 6️⃣ Extract text (returns dict now!)
        try:
            logger.info(f"🔄 Extracting text from PDF...")
            extraction_result = extract_text_from_pdf(pdf_bytes, "whatsapp_media.pdf")
            extracted_text = extraction_result["text"]  # ✅ GET TEXT FROM DICT
            logger.info(f"✅ Text extracted: {extraction_result['char_count']} chars, {extraction_result['num_pages']} pages")
        except Exception as e:
            logger.error(f"❌ Text extraction failed: {str(e)}")
            return Response(
                content=f"""<Response><Message>Failed to extract text: {str(e)}</Message></Response>""",
                media_type="application/xml",
                status_code=200
            )

        # 7️⃣ Chunk text
        try:
            logger.info(f"✂️  Chunking text...")
            chunking_result = split_text(extracted_text, chunking_strategy="token")
            chunks = chunking_result["chunks"]
            logger.info(f"✅ Chunks created: {len(chunks)}")
        except Exception as e:
            logger.error(f"❌ Chunking failed: {str(e)}")
            return Response(
                content=f"""<Response><Message>Failed to chunk text: {str(e)}</Message></Response>""",
                media_type="application/xml",
                status_code=200
            )

        # 8️⃣ Generate embeddings
        try:
            logger.info(f"🧠 Generating embeddings...")
            embedding_result = generate_embeddings(chunks, debug=False)
            num_embeddings = embedding_result["num_embeddings"]
            logger.info(f"✅ Embeddings created: {num_embeddings}")
        except Exception as e:
            logger.error(f"❌ Embedding failed: {str(e)}")
            return Response(
                content=f"""<Response><Message>Failed to generate embeddings: {str(e)}</Message></Response>""",
                media_type="application/xml",
                status_code=200
            )

        # 9️⃣ Success response
        logger.info(f"🎉 Pipeline complete for {from_number}")
        return Response(
            content=f"""<Response><Message>✅ PDF processed!
📄 Pages: {extraction_result['num_pages']}
✂️ Chunks: {len(chunks)}
🧠 Embeddings: {num_embeddings}</Message></Response>""",
            media_type="application/xml",
            status_code=200
        )

    except Exception as e:
        logger.error(f"❌ CRITICAL ERROR: {str(e)}", exc_info=True)
        return Response(
            content=f"""<Response><Message>Error: {str(e)}</Message></Response>""",
            media_type="application/xml",
            status_code=200
        )