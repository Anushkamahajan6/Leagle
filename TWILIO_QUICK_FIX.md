# 🚀 Twilio WhatsApp Integration - Quick Fix Reference

## Critical Issues Found & Fixed ✅

### Issue #1: Wrong Return Type from `extract_text_from_pdf()`
**❌ Before (Line 60 in old code):**
```python
text = extract_text_from_pdf(pdf_bytes)  # Returns DICT, not string!
```

**✅ After (Fixed in updated whatsapp.py):**
```python
extraction_result = extract_text_from_pdf(pdf_bytes, "whatsapp_media.pdf")
extracted_text = extraction_result["text"]  # ✅ Extract text from dict
```

---

### Issue #2: No Logging (Can't Debug)
**❌ Before:**
```python
@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    form = await request.form()
    # ... no way to know what's happening
```

**✅ After (Fixed in updated whatsapp.py):**
```python
@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    try:
        form = await request.form()
        logger.info(f"📬 Webhook received | Form keys: {list(form.keys())}")  # ✅ Log immediately
        num_media = int(form.get("NumMedia", 0))
        logger.info(f"📲 Media count: {num_media}")  # ✅ Log what Twilio sent
        # ... more logging at each step
```

---

### Issue #3: No Error Handling on Media Download
**❌ Before:**
```python
response = requests.get(media_url, auth=(SID, TOKEN))
pdf_bytes = response.content  # ❌ Fails silently if 401 error!
```

**✅ After (Fixed in updated whatsapp.py):**
```python
try:
    logger.info(f"⬇️  Downloading PDF from Twilio...")
    response = requests.get(
        media_url,
        auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
        timeout=30  # ✅ Add timeout
    )
    response.raise_for_status()  # ✅ Raise on HTTP errors
    pdf_bytes = response.content
    logger.info(f"✅ PDF downloaded: {len(pdf_bytes)} bytes")
except requests.exceptions.RequestException as e:
    logger.error(f"❌ Failed to download PDF: {str(e)}")  # ✅ Log error
    return Response(
        content=f"""<Response><Message>Failed to download PDF: {str(e)}</Message></Response>""",
        media_type="application/xml",
        status_code=200
    )
```

---

### Issue #4: Placeholder Auth Token (Most Critical!)
**❌ In .env file:**
```
TWILIO_AUTH_TOKEN=your_auth_token  # ❌ PLACEHOLDER - Will fail with 401!
```

**✅ Fix:**
1. Go to https://console.twilio.com
2. Click on your Account
3. Find **Auth Token** and click to reveal
4. Copy real token
5. Update .env:
```
TWILIO_AUTH_TOKEN=abc123defg456...real_token_here...xyz789
```
6. Restart backend:
```bash
uvicorn main:app --reload
```

---

## Minimal Logging Setup (Copy-Paste Ready)

### In `routers/whatsapp.py`:
```python
import logging

logger = logging.getLogger(__name__)

# Log sequence numbers for easy tracking
@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    try:
        logger.info("1️⃣ Webhook hit")
        form = await request.form()
        logger.info(f"2️⃣ Form parsed: {list(form.keys())}")
        
        num_media = int(form.get("NumMedia", 0))
        logger.info(f"3️⃣ NumMedia: {num_media}")
        
        if num_media == 0:
            logger.info("4️⃣ No media, returning message")
            return Response(...)
        
        media_url = form.get("MediaUrl0")
        logger.info(f"5️⃣ Media URL: {media_url[:50]}...")
        
        # ... continue logging
```

Then check logs:
```bash
# Terminal running uvicorn will show:
INFO:routers.whatsapp:1️⃣ Webhook hit
INFO:routers.whatsapp:2️⃣ Form parsed: ['From', 'To', 'MediaUrl0', ...]
INFO:routers.whatsapp:3️⃣ NumMedia: 1
INFO:routers.whatsapp:5️⃣ Media URL: https://media.twiliocdn.com/...
```

---

## Verification Checklist (Quick)

### 1️⃣ Credentials
```bash
# Check .env has real token (not placeholder)
grep TWILIO_AUTH_TOKEN .env
# Should show: TWILIO_AUTH_TOKEN=abc123... (not "your_auth_token")
```

### 2️⃣ Backend Running
```bash
# Terminal 1
cd backend
uvicorn main:app --reload
# Should see: Uvicorn running on http://127.0.0.1:8000
```

### 3️⃣ ngrok Active
```bash
# Terminal 2
ngrok http 8000
# Should show: Forwarding https://abc123.ngrok.io -> http://localhost:8000
```

### 4️⃣ Webhook URL Set in Twilio
```
Go to: https://console.twilio.com/develop/sms/try-it-out/whatsapp-sandbox
Set "When a message comes in" to:
https://abc123.ngrok.io/api/whatsapp/webhook

Click Save
```

### 5️⃣ Test Endpoint Reachable
```bash
# Terminal 3
curl -X POST https://abc123.ngrok.io/api/whatsapp/webhook \
  -d "From=whatsapp:%2B1234567890" \
  -d "NumMedia=0"

# Should return:
# <Response><Message>Please send a PDF file 📄</Message></Response>
```

### 6️⃣ Send PDF via WhatsApp
1. Message Twilio WhatsApp sandbox number: `join YOUR-CODE`
2. Send PDF file
3. Check Terminal 1 logs for:
```
📬 Webhook received
⬇️ Downloading PDF from Twilio
✂️ Chunking text
🧠 Generating embeddings
🎉 Pipeline complete
```

---

## Common Error Messages & Fixes

### Error: `401 Unauthorized` (PDF Download)
```
❌ Failed to download PDF: 401 Unauthorized
```
**Fix:** Update TWILIO_AUTH_TOKEN with real token from Twilio Console

### Error: `Webhook not being called`
```
(No logs, nothing happens when sending PDF)
```
**Fixes:**
1. Check ngrok still running: `ngrok http 8000`
2. Check webhook URL in Twilio Console matches ngrok URL
3. Test manually: `curl -X POST https://YOUR-URL/api/whatsapp/webhook`
4. Check firewall not blocking ngrok

### Error: `Wrong content type error`
```
❌ Invalid media type: None
```
**Fix:** Means form parsing failed. Check if sending multipart form-data:
```python
# Twilio sends as form-data, FastAPI should receive it
form = await request.form()  # ✅ Correct
```

### Error: `No reply message in WhatsApp`
```
(PDF processes but no message back)
```
**Fixes:**
1. Response must be TwiML XML:
   ```python
   return Response(
       content="""<Response><Message>...</Message></Response>""",
       media_type="application/xml"
   )
   ```
2. Check backend logs for exceptions
3. Verify pipeline completes without errors

---

## What Was Fixed in `routers/whatsapp.py`

| Item | Before | After |
|------|--------|-------|
| Logging | None ❌ | 10 log points ✅ |
| Error handling | None ❌ | Try-catch blocks ✅ |
| Return type handling | `text = extract_text_from_pdf(pdf_bytes)` ❌ | `extracted_text = extraction_result["text"]` ✅ |
| Media download | No error check ❌ | HTTP error raising ✅ |
| Timeout | None ❌ | 30s timeout ✅ |
| Response format | Incomplete ❌ | Proper TwiML ✅ |
| Service calls | Broken ❌ | All fixed ✅ |

---

## Run Test Script

```bash
cd backend
python test_twilio_setup.py
```

Will check:
- ✅ Credentials set
- ✅ Services importable
- ✅ Embedding model loads
- ✅ FastAPI app loads
- ✅ Routes registered

---

## Files Modified

1. **`backend/routers/whatsapp.py`** - Added logging, error handling, fixed return types
2. **Created: `TWILIO_DEBUG_CHECKLIST.md`** - Comprehensive debugging guide
3. **Created: `backend/test_twilio_setup.py`** - Automated verification script

---

## Next Steps

1. **Update .env with real Twilio credentials** (most critical!)
2. **Restart backend:** `uvicorn main:app --reload`
3. **Run test script:** `python backend/test_twilio_setup.py`
4. **Start ngrok:** `ngrok http 8000`
5. **Update Twilio webhook URL**
6. **Send PDF via WhatsApp**
7. **Check logs** for flow: 📬 → ⬇️ → ✂️ → 🧠 → 🎉

🚀 **Your Twilio integration should work now!**
