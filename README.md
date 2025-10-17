# AI-Powered SDR System

Intelligent lead qualification and outreach automation using Grok AI. Built to streamline B2B sales pipeline management through adaptive scoring and context-aware messaging.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-teal)
![React](https://img.shields.io/badge/React-18+-blue)

## Core Features

- **Intelligent Lead Scoring**: Multi-factor assessment (company size, job title, industry fit, engagement) with customizable weights
- **Context-Aware Messaging**: Pipeline stage-aware generation with 6 message types
- **7-Stage Pipeline**: Automated progression from New → Qualified → Contacted → Meeting → Negotiation → Closed
- **Activity Audit Trail**: Complete timeline of lead interactions and scoring decisions

## Tech Stack

**Backend**: FastAPI, SQLAlchemy, SQLite, Pydantic  
**Frontend**: React, TailwindCSS, shadcn/ui  
**AI**: Grok API (xAI) with custom prompt engineering

## Architecture

```
┌──────────┐      ┌──────────┐      ┌─────────┐
│  React   │ ───► │ FastAPI  │ ───► │ Grok AI │
│  Client  │ ◄─── │  Server  │ ◄─── │   API   │
└──────────┘      └──────────┘      └─────────┘
                        │
                        ▼
                  ┌──────────┐
                  │  SQLite  │
                  │    DB    │
                  └──────────┘
```

## Installation

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "GROK_API_KEY=your_key" > .env
uvicorn app.main:app --reload --port 8001

# Frontend
cd frontend
npm install && npm run dev
```

Access at: `http://localhost:5173`

## API Endpoints

```python
POST   /api/leads                 # Create lead (auto-scores)
GET    /api/leads                 # List all leads
PUT    /api/leads/{id}            # Update lead
DELETE /api/leads/{id}            # Soft delete
POST   /api/leads/{id}/score      # Re-score lead
POST   /api/leads/score-batch     # Score all leads
POST   /api/leads/{id}/generate-message  # Generate message
GET    /api/analytics/pipeline    # Pipeline statistics
```

Full API docs: `http://localhost:8001/docs`

## Performance

- **Lead scoring**: ~800ms per lead (Grok API latency)
- **Batch scoring**: Parallel processing with progress updates
- **Message generation**: ~1.2s average
- **Database**: Indexed queries, supports 10K+ leads

See `benchmarks/` for detailed metrics.

## Prompt Engineering

Stage-aware context ensures messages adapt to relationship status:

```python
# Negotiation stage - no product introduction
stage_contexts = {
    "negotiation": "Focus on ROI, pricing, addressing concerns. 
                   They already know the product - don't reintroduce."
}
```

## Evaluation

Model performance tracked via:
- Score consistency tests (±5 point variance)
- Message quality assessment (personalization, tone, CTA)
- Stage-awareness validation
- A/B testing framework (planned)

## Future Roadmap

- [ ] Email integration (SendGrid/SMTP)
- [ ] CRM connectors (Salesforce, HubSpot)
- [ ] Advanced analytics dashboard
- [ ] Multi-channel outreach (LinkedIn, SMS)

---

**License**: Proprietary | **Built with**: Grok AI
