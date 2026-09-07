# Neuroviax AI — MERN Stack Implementation (Phase 1: Foundation)

This is a working MERN-stack build of the platform described in the *Neuroviax AI Consolidated Product & Strategy
Document v5.0*. Given the document's own scope warning in Section 6 ("this is a very wide module set for a first
release") and its explicit Section 15 roadmap, this implementation deliberately covers **Phase 1 (Foundation)** plus a
working slice of **Phase 3 (Intelligence)** — rather than attempting all 7 modules and 6 AI assistants at once, which
the document itself flags as a top risk (Section 17).

## What's built

**Phase 1 — Foundation (full):**
- Authentication (JWT access/refresh tokens, multi-business/multi-role membership model)
- Business & branch/warehouse management
- Products (master catalog)
- Inventory (stock receiving/picking/adjustments, low-stock alerts)
- Orders (unified sales + purchase order schema, per Section 10's guidance)
- Payments (4 gateway types stubbed, cash-flow snapshot)
- Customers & Suppliers (CRM/procurement base records)
- RBAC, immutable audit logging, rate limiting — per Section 11/12

**A working slice of Phase 3 — Intelligence (Procurement Assistant):**
- A rule-based recommendation engine that estimates demand velocity from inventory movement history and proposes
  reorders with a **rationale, confidence score, and risk tier** — following the exact lifecycle in Section 7.1–7.3.
- Human-in-the-loop approval: approving a recommendation auto-creates the purchase order; rejecting it just logs the
  decision. High-value recommendations are forced to `high` risk tier regardless of confidence (Section 7.2).
- This is **not calling an LLM** — it's a deterministic stand-in so the full approval/audit loop is demonstrable
  end-to-end today. Swapping in a real LLM call means replacing `generateProcurementSignal` logic in
  `backend/controllers/aiController.js` only; the lifecycle, risk-tiering, and audit trail stay the same.

## Not built (by design, per the roadmap)

Sales/Marketing/Customer Support/Finance/Operations AI assistants, WhatsApp Business API integration, real payment
gateway SDK calls, vector search/RAG context retrieval, offline-first mobile sync, and multi-language localization are
all Phase 2–4 per Section 15. Building them now, in parallel, is exactly the risk Section 17 calls out
("Building 6 AI assistants + 7 module groups in parallel overwhelms a small team").

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt, helmet, rate-limiting
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env       # edit MONGO_URI and JWT secrets
npm install
npm run seed                # creates a demo business + product + low-stock scenario
npm run dev                 # starts on http://localhost:5000
```

Demo login after seeding: `demo@neuroviax.ai` / `Password123!`

### 2. Frontend

```bash
cd frontend
cp .env.example .env        # points to the backend API
npm install
npm run dev                 # starts on http://localhost:5173
```

### 3. Try the AI loop

1. Log in with the demo account (or register your own business).
2. Go to **AI Recommendations** → click **Generate Recommendations**. The seeded product is below its reorder
   threshold, so a reorder recommendation with rationale + confidence will appear.
3. Click **Approve** — this creates a `purchase` Order automatically, visible under **Orders**.
4. Advance the order through `approved → fulfilled` to see inventory update.

## Requirements coverage reference

Functional requirements (FR-01 to FR-14) and non-functional requirements from Section 11 of the source document are
annotated inline in the relevant model/controller/route files as comments, so you can trace each requirement to its
implementation.

## Next engineering steps (not in this build)

- Add MFA for financial actions (Section 12.3)
- Add PCI-tokenized real gateway integrations (Stripe/JazzCash/Easypaisa/Razorpay SDKs)
- Add vector search (Qdrant/Weaviate) for AI context retrieval once a real LLM replaces the rule-based engine
- Add offline-first sync for mobile clients (NFR: 72-hour offline resilience)
- Write automated tests (unit + integration) — none are included in this scaffold
