# 🔍 Twilio WhatsApp Integration - Debugging Checklist

## Phase 1: Environment & Credentials ✅

### 1.1 Update `.env` with Real Credentials
```bash
# ❌ NEVER use placeholder values
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Real SID
TWILIO_AUTH_TOKEN=your_real_auth_token_here            # Real Token
```

**Where to get credentials:**
- Go to https://console.twilio.com
- Copy **Account SID** from dashboard
- Click **Auth Token** to reveal and copy
- **DO NOT commit this to git!**

### 1.2 Verify Environment Variables Loaded
```bash
# In backend directory
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(f'SID: {os.getenv(\"TWILIO_ACCOUNT_SID\")}')"
```

✅ Should print your real SID (first 20 chars), not placeholder

---

## Phase 2: Webhook URL Configuration 📡

### 2.1 Get Public URL (Choose One)

**Option A: Using ngrok (Local Testing)**
```bash
# Terminal 1: Start ngrok
ngrok http 8000

# Output:
# Forwarding  https://abc123.ngrok.io -> http://localhost:8000
```

**Option B: Using ngrok with custom domain (Free tier)**
```bash
ngrok http 8000 --domain=yourdomain.ngrok.io
```

**Option C: Using cloud hosting**
- Deploy to Heroku, Railway, Render, etc.
- Use production URL directly

### 2.2 Configure Twilio Sandbox Webhook

1. Go to https://console.twilio.com/develop/sms/try-it-out/whatsapp-sandbox
2. Find **SANDBOX CONFIGURATION** section
3. Set **When a message comes in** to:
   ```
   https://your-public-url/api/whatsapp/webhook
   ```
   - If using ngrok: `https://abc123.ngrok.io/api/whatsapp/webhook`
   - If using cloud: `https://yourdomain.com/api/whatsapp/webhook`

4. **Method:** POST (dropdown)
5. Click **Save**

✅ Twilio will now send incoming messages to this URL

### 2.3 Test Webhook Reachability

```bash
# From terminal (replace with your URL)
curl -X POST https://your-public-url/api/whatsapp/webhook \
  -d "From=whatsapp:%2B1234567890" \
  -d "NumMedia=0"

# Expected response:
# <Response><Message>Please send a PDF file 📄</Message></Response>
```

✅ If you get this XML response, webhook is reachable!

---

## Phase 3: Twilio Request Validation 📥

### 3.1 Verify Twilio Is Sending the Request

**In your FastAPI logs, you should see:**
```
📬 Webhook received | Form keys: ['From', 'To', 'Body', 'NumMedia', 'MediaUrl0', 'MediaContentType0', 'MessageSid', 'AccountSid', 'Timestamp', 'SigningCertUrl', 'MessageSignature']
📲 Message from: whatsapp:+1234567890 | Media count: 1
📎 Media: application/pdf | URL: https://media.twiliocdn.com/...
```

If NOT seeing this:
- ❌ Check webhook URL in Twilio Console
- ❌ Check if ngrok tunnel is still active
- ❌ Verify firewall not blocking requests
- ❌ Check backend is running (`uvicorn main:app --reload`)

### 3.2 Send Test Message from WhatsApp

1. Get your Twilio WhatsApp Sandbox number from Console
2. Save it in your phone
3. Send message: `join YOUR-SANDBOX-CODE`
4. Then send: `test message` (to verify connection)
5. Check FastAPI logs for webhook hit

✅ Should see `📬 Webhook received` in logs

---

## Phase 4: Media Download Validation 📎

### 4.1 Test with Non-PDF First

**Send a test file via WhatsApp:**
1. Pick any image/text file
2. Send via WhatsApp to your Sandbox number

**Check logs:**
```
❌ Invalid media type: image/jpeg
```

✅ This means Twilio sent the correct format, webhook received it

### 4.2 Send Actual PDF

**Send a PDF via WhatsApp:**
1. Pick any PDF file (< 50MB)
2. Send via WhatsApp

**Check logs for:**
```
📎 Media: application/pdf | URL: https://media.twiliocdn.com/...
⬇️ Downloading PDF from Twilio...
✅ PDF downloaded: 12345 bytes
```

If you see **download error**:
```
❌ Failed to download PDF: 401 Unauthorized
```

→ Check TWILIO_AUTH_TOKEN is correct and not placeholder!

---

## Phase 5: Pipeline Execution 🔄

### 5.1 Text Extraction

**Expected logs:**
```
🔄 Extracting text from PDF...
✅ Text extracted: 27769 chars, 20 pages
```

**If you see error:**
```
❌ Text extraction failed: [error message]
```

→ Check if pdf_service.py is imported correctly

### 5.2 Chunking

**Expected logs:**
```
✂️ Chunking text...
✅ Chunks created: 19
```

**If error:**
```
❌ Chunking failed: [error message]
```

→ Check if chunk_service.py is working

### 5.3 Embeddings

**Expected logs:**
```
🧠 Generating embeddings...
✅ Embeddings created: 19
```

**If error:**
```
❌ Embedding failed: [error message]
```

→ Check if embedding model loaded successfully

---

## Phase 6: WhatsApp Response 📤

### 6.1 Check Reply Message

**After sending PDF, you should receive:**
```
✅ PDF processed!
📄 Pages: 20
✂️ Chunks: 19
🧠 Embeddings: 19
```

If NO reply received:
- Check logs for `🎉 Pipeline complete`
- Verify Twilio account is active
- Check if sandbox session expired

### 6.2 Check Response Format

**FastAPI returns TwiML XML:**
```xml
<Response>
  <Message>✅ PDF processed!
📄 Pages: 20
✂️ Chunks: 19
🧠 Embeddings: 19</Message>
</Response>
```

✅ If WhatsApp shows your message, response format is correct!

---

## Phase 7: Logging Deep Dive 🔎

### 7.1 Enable Debug Logs

**In your FastAPI `main.py`:**
```python
import logging
logging.basicConfig(
    level=logging.DEBUG,  # ← Change to DEBUG
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

Then restart backend:
```bash
uvicorn main:app --reload
```

### 7.2 Check All Log Levels

After sending PDF, logs should have:
- ✅ `logger.info()` → 📲 Message received, ✅ PDF downloaded, etc.
- ⚠️ `logger.warning()` → ⚠️ No media, etc.
- ❌ `logger.error()` → Errors during processing

### 7.3 Save Logs to File

```python
# In main.py
import logging
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler('twilio_debug.log', maxBytes=10000000, backupCount=5)
logging.getLogger().addHandler(handler)
```

Then check logs:
```bash
tail -f twilio_debug.log
```

---

## Phase 8: Common Issues & Fixes 🛠️

### Issue: 401 Unauthorized (PDF Download)

```
❌ Failed to download PDF: 401 Unauthorized
```

**Fix:**
- Update `TWILIO_AUTH_TOKEN` in `.env` with real token
- Restart backend: `uvicorn main:app --reload`
- Verify SID/Token pair matches in Twilio Console

### Issue: Webhook Not Receiving Messages

```
(No logs appear when sending PDF)
```

**Fix:**
- Check ngrok tunnel active: `ngrok http 8000`
- Update webhook URL in Twilio Console
- Test URL reachability: `curl https://your-url/api/whatsapp/webhook`
- Check firewall settings

### Issue: Wrong Content Type Error

```
❌ Invalid media type: None
```

**Fix:**
- Twilio didn't send MediaContentType0
- This means form parsing failed
- Check if FastAPI is correctly parsing multipart form data
- Verify route handler signature: `async def whatsapp_webhook(request: Request)`

### Issue: No Reply Message

```
(Request succeeds but no WhatsApp message back)
```

**Fix:**
- Response format must be TwiML XML
- Check `media_type="application/xml"` in return
- Verify no exceptions in pipeline (check logs)
- Ensure `<Response><Message>...</Message></Response>` format

---

## 🚀 Quick Verification Script

Save as `test_twilio_setup.py` in backend directory:

```python
#!/usr/bin/env python
import os
from dotenv import load_dotenv
import requests

load_dotenv()

print("=" * 60)
print("TWILIO SETUP VERIFICATION")
print("=" * 60)

# 1. Check credentials
sid = os.getenv("TWILIO_ACCOUNT_SID")
token = os.getenv("TWILIO_AUTH_TOKEN")

print(f"\n✅ TWILIO_ACCOUNT_SID: {sid[:10] if sid else 'NOT SET'}...")
print(f"✅ TWILIO_AUTH_TOKEN: {token[:10] if token else 'NOT SET'}...")

if not sid or not token or "your_" in token:
    print("❌ CRITICAL: Credentials not set or placeholder values!")
    exit(1)

# 2. Check if services are available
try:
    from services.pdf_service import extract_text_from_pdf
    print("✅ pdf_service imported")
except Exception as e:
    print(f"❌ pdf_service import failed: {e}")

try:
    from services.chunk_service import split_text
    print("✅ chunk_service imported")
except Exception as e:
    print(f"❌ chunk_service import failed: {e}")

try:
    from services.embedding_service import generate_embeddings
    print("✅ embedding_service imported")
except Exception as e:
    print(f"❌ embedding_service import failed: {e}")

# 3. Check webhook registration
try:
    from routers import whatsapp
    print("✅ whatsapp router imported")
except Exception as e:
    print(f"❌ whatsapp router import failed: {e}")

print("\n" + "=" * 60)
print("✅ All checks passed! Ready for Twilio integration.")
print("=" * 60)
print("\nNext steps:")
print("1. Start backend: uvicorn main:app --reload")
print("2. Start ngrok: ngrok http 8000")
print("3. Update webhook URL in Twilio Console")
print("4. Send PDF via WhatsApp")
```

Run it:
```bash
python test_twilio_setup.py
```

---

## 📋 Complete Testing Workflow

```bash
# Terminal 1: Start ngrok
ngrok http 8000

# Terminal 2: Start backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 3: Monitor logs (optional)
tail -f twilio_debug.log
```

**Then in WhatsApp:**
1. Message: `join YOUR-SANDBOX-CODE`
2. Send test message: `test`
3. Send PDF file
4. Check backend logs for `🎉 Pipeline complete`
5. Should receive WhatsApp message with results

---

## 🆘 Still Having Issues?

**Collect this info before debugging:**

1. Full error log output
2. Screenshot of Twilio Console webhook URL
3. Output of: `python test_twilio_setup.py`
4. `echo $TWILIO_ACCOUNT_SID` (verify env var is set)
5. `ngrok http 8000` output (verify tunnel active)

Then share error logs! ✅
