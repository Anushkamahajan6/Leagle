# CodeWizards — AI Compliance Management System

A microservices RAG platform that monitors regulatory changes, maps them to internal company policies using vector similarity (Qdrant), scores risk, and generates LLM remediation recommendations.

## 🚀 Quick Start

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Backend (Python 3.14 + FastAPI)
cd backend
source venv/bin/activate
pip install -r requirements.txt
python main.py

# 3. Frontend (Next.js 15 + React 19)
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 to access the UI.

## 📋 Documentation

**Getting Started:**
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** ← **Start here!** Complete local setup with Qdrant, Redis, backend & frontend
- **[FRONTEND_SETUP.md](FRONTEND_SETUP.md)** — Frontend components, pages, and features
- **[BUILD.md](BUILD.md)** — Complete step-by-step implementation guide (Phases 0-6)
- **[PROGRESS.md](PROGRESS.md)** — Current status, completed phases, next actions

**Architecture & Integration:**
- **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** — Full system design, data models, API endpoints, workflows
- **[DATASETS.md](DATASETS.md)** — Dataset integration (SEC forms, legal cases, global regulations), semantic search flows
- **[LLM.md](LLM.md)** — LLM integration details, prompt engineering, Gemini configuration

**Frontend:**
- **[frontend/README.md](frontend/README.md)** — Frontend-specific setup

## 🏗️ Architecture

```
LAYER 1 — UI:         Next.js + React 19 + Tailwind CSS v4
LAYER 2 — Gateway:    FastAPI (HTTP + WebSocket)
LAYER 3 — Services:   Ingestion | RAG Pipeline | Risk Scorer | Alert Engine
LAYER 4 — Data:       Qdrant (vectors) | Neon DB (structured) | Redis (queue)
```

## 💡 Key Features

- **Semantic Search** — Qdrant-powered vector similarity finds impacted policies even with zero keyword matches
- **Real-time Alerts** — WebSocket-based live notifications for policy risks
- **LLM Integration** — Google Gemini API for intelligent summaries and remediation recommendations
- **Proactive Monitoring** — Automated regulation tracking and impact scoring

## 🛠️ Tech Stack

**Backend:** Python 3.14 | FastAPI 0.136 | SQLAlchemy 2.0 | Alembic | Qdrant 1.9.1 | PostgreSQL (Neon) | Redis 7  
**Frontend:** Next.js 15 | React 19 | Tailwind CSS v4 | TanStack Query | Zustand  
**AI/ML:** sentence-transformers (all-MiniLM-L6-v2) | LangChain 0.3 | Google Gemini 1.5 Flash | scikit-learn

## 📚 Team

**Code Wizards 2.0** — PS4 | SRMIST | Owner: Pradeepto Pal