# AI Compliance Management System

**Built by Team Hustlers**

A regulatory intelligence platform that uses vector search and LLM-powered analysis to help organizations stay compliant — automatically.

---

## The Problem

Compliance teams are drowning. New regulations drop every week, each one buried in dense legal language. Someone has to read it, figure out which internal policies it affects, and decide what to change. Multiply that across GDPR, DPDP Act, PCI-DSS, SOC 2, and a dozen other frameworks, and you've got a full-time job that nobody wants.

Most existing tools don't help much either — they rely on keyword matching, which misses context entirely. Searching for "data retention" won't surface a policy that talks about "record keeping timelines" even though they mean the same thing.

We wanted to fix that.

---

## What We Built

An end-to-end compliance management platform with three core capabilities:

### 1. Semantic Search over Regulations

We use **Sentence Transformers** (`all-MiniLM-L6-v2`) to convert every regulation and policy into vector embeddings, stored in **Qdrant**. When you search for something like _"breach notification deadline"_, the system finds relevant documents by meaning — not just matching words.

The search results feed into a **RAG pipeline** (Retrieval-Augmented Generation) that uses an LLM to synthesize a compliance verdict with legal citations, risk scores, and remediation steps.

### 2. Automated Impact Analysis

Upload a new regulation, and the system will:
- Find every internal policy it might affect
- Use an LLM to generate a structured impact report (affected clauses, compliance gaps, recommended actions, deadlines)
- Score the risk as HIGH, MEDIUM, or LOW
- Trigger real-time alerts via WebSocket

This turns a process that takes days of manual review into something that happens in seconds.

### 3. Risk Heatmap & Dashboard

A visual risk matrix that maps **departments × compliance categories**, color-coded by severity. Click any cell to drill down into the specific impact events, source regulations, and recommended actions. The dashboard gives a bird's-eye view of your compliance posture at a glance.

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Next.js    │────▶│   FastAPI     │────▶│     Qdrant       │
│   Frontend   │◀────│   Backend     │◀────│   Vector DB      │
│  (React 19)  │     │  + Socket.IO  │     │  (Embeddings)    │
└──────────────┘     └──────┬───────┘     └──────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
              ┌─────▼─────┐  ┌─────▼─────┐
              │ PostgreSQL │  │   Redis   │
              │  (Models)  │  │  (Cache)  │
              └───────────┘  └───────────┘
```

**Backend** — FastAPI with async SQLAlchemy, Socket.IO for real-time alerts, LangChain for the RAG pipeline.

**Vector DB** — Qdrant stores chunked regulation/policy embeddings. Semantic search with configurable score thresholds.

**LLM Layer** — Pluggable provider system (Gemini, Groq/Llama 3.3, OpenAI). The RAG pipeline retrieves relevant chunks from Qdrant, injects them as context, and the LLM generates structured analysis.

**Risk Scoring** — Hybrid approach: a rule-based keyword density scorer runs locally (no API call needed), with an optional trained sklearn model that takes over when available.

**Frontend** — Next.js 16 with React 19, Tailwind CSS, dark-themed glassmorphism UI with real-time Socket.IO integration.

---

## Features

| Feature | Description |
|---|---|
| **Semantic Search** | Natural language queries over regulations and policies using vector similarity |
| **RAG Q&A** | LLM-generated compliance verdicts with cited sources and confidence scores |
| **Impact Analysis** | Automated detection of which policies a new regulation affects |
| **Risk Scoring** | Hybrid ML + rule-based scoring (HIGH / MEDIUM / LOW) |
| **Risk Heatmap** | Department × Category matrix with drill-down detail modals |
| **Real-Time Alerts** | WebSocket-based live alert feed when new risks are detected |
| **Document Ingestion** | Upload and embed regulations, policies, and legal documents |
| **Executive Dashboard** | System metrics, alert counts, and quick actions in one view |
| **Multi-LLM Support** | Switch between Gemini, Groq (Llama 3.3 70B), or OpenAI |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Zustand, React Query, Socket.IO Client |
| Backend | FastAPI, SQLAlchemy (async), Socket.IO, LangChain, Pydantic |
| Vector DB | Qdrant |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| AI/ML | Sentence Transformers, LangChain, Gemini / Groq / OpenAI |
| Infra | Docker Compose |

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### 1. Clone and configure

```bash
git clone https://github.com/Anushkamahajan6/Hustlers.git
cd Hustlers
```

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql+asyncpg://user:password@127.0.0.1/compliance_db
QDRANT_HOST=127.0.0.1
QDRANT_PORT=6333
REDIS_URL=redis://127.0.0.1:6379/0

# Pick one LLM provider and add its key
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-key-here
# Or use Groq:
# LLM_PROVIDER=groq
# GROQ_API_KEY=your-key-here
```

### 2. Start infrastructure

```bash
docker compose up -d
```

This spins up PostgreSQL, Qdrant, and Redis. Wait until all containers are healthy:

```bash
docker ps
```

### 3. Set up the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

Seed the vector database with demo regulations:

```bash
python scripts/seed_demo_data.py
```

Start the API server:

```bash
uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3001** in your browser.

---

## Project Structure

```
Hustlers/
├── backend/
│   ├── core/              # Config, database connection
│   ├── models/            # SQLAlchemy models (Regulation, Policy, Impact, Alert)
│   ├── routers/           # API endpoints (regulations, policies, impact, alerts, rag)
│   ├── services/          # Business logic
│   │   ├── qdrant_service.py       # Vector DB operations (embed, upsert, search)
│   │   ├── rag_pipeline.py         # LangChain RAG chains (impact analysis, Q&A)
│   │   ├── risk_scorer.py          # Hybrid ML + rule-based risk scoring
│   │   ├── alert_engine.py         # Risk detection and alert generation
│   │   ├── ingestion.py            # Document parsing and chunking
│   │   ├── websocket_service.py    # Socket.IO real-time broadcasts
│   │   └── summarization_service.py
│   ├── scripts/           # Data seeding scripts
│   └── main.py            # FastAPI app + Socket.IO wrapper
│
├── frontend/
│   └── src/app/
│       ├── components/    # Dashboard, SemanticSearch, RiskHeatmap, AlertsPanel
│       ├── api/           # Axios client for backend communication
│       ├── store/         # Zustand state management
│       ├── hooks/         # Custom React hooks
│       └── page.jsx       # Main application shell
│
├── docker-compose.yml     # PostgreSQL, Qdrant, Redis
└── .env                   # Environment configuration
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/regulations` | List all monitored regulations |
| `POST` | `/api/regulations/ingest` | Upload and embed a new regulation |
| `GET` | `/api/regulations/{id}/similar` | Find semantically similar regulations |
| `GET` | `/api/policies` | List all internal policies |
| `POST` | `/api/impact/analyze` | Run impact analysis (regulation vs. policy) |
| `GET` | `/api/impact/heatmap` | Get the risk heatmap data |
| `GET` | `/api/alerts` | Get all compliance alerts |
| `POST` | `/api/rag/explain` | Semantic Q&A over the regulation knowledge base |

---

## How Impact Analysis Works

This is the core intelligence of the system. When a new regulation is ingested:

1. **Chunking** — The regulation text is split into overlapping chunks
2. **Embedding** — Each chunk is converted to a 384-dimensional vector using `all-MiniLM-L6-v2`
3. **Storage** — Vectors are upserted into Qdrant with metadata (source, category, jurisdiction)
4. **Retrieval** — When analyzing impact, the system retrieves the top-k most similar chunks from Qdrant
5. **Analysis** — Retrieved context + regulation + policy are sent to the LLM with a structured prompt
6. **Scoring** — The hybrid risk scorer runs locally to produce a risk level
7. **Alerting** — If risk exceeds threshold, a real-time alert is broadcast via WebSocket

The LLM returns structured JSON with impact level, affected clauses, compliance gaps, recommended actions, and deadlines.

---

## Seeded Data

The demo dataset includes regulations from:

- **GDPR** — Articles 5, 32, 33 (EU data privacy)
- **India DPDP Act** — Data principal rights (India)
- **SOC 2 Type II** — Security and compliance controls (US)
- **PCI-DSS v3.2.1** — Payment card data security (Global)

Plus three sample company policies (Data Retention, Access Control, Incident Response) for testing impact analysis.

---

## Team

Built by **Team Hustlers** — a group of three engineers who believe compliance shouldn't require a law degree.

---

## Disclaimer

This system is a decision-support tool. It is not a substitute for qualified legal counsel. Always validate critical compliance decisions with domain experts.

---

## What's Next

- Live regulatory feed scraping (auto-ingest new regulations as they're published)
- Multi-language embedding support for cross-jurisdiction analysis
- Fine-tuned risk classification model trained on labeled compliance data
- Audit trail and compliance certification workflow
- Role-based access control for enterprise teams
