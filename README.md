# Neuroviax AI — MERN Stack Implementation

**Neuroviax AI** is a full-stack, multi-business ERP + AI platform for small & medium enterprises. This repository contains a working **MERN (MongoDB, Express, React, Node.js)** implementation covering **Phase 1 (Foundation)** in full, plus a working slice of **Phase 3 (Intelligence)** — the rule-based Procurement Assistant.

> The build intentionally follows the scope guidance in the *Neuroviax AI Consolidated Product & Strategy Document v5.0*: implement Phase 1 completely + a demonstrable slice of Phase 3, rather than attempting all 7 modules and 6 AI assistants at once (which is flagged as the top risk in Section 17).

---

## ✨ Features

### Phase 1 — Foundation (complete)
- **Authentication** — JWT access/refresh tokens, multi-business / multi-role membership model
- **Google OAuth 2.0 SSO** — real Passport flow when credentials are configured, with a polished **dev fallback account-chooser** when they are not
- **Firebase ID-token SSO login**
- **Password reset via OTP** — emailed 6-digit code, hashed & stored, with a 10-minute expiry
- **Business & Branch management** — multi-branch / multi-warehouse support
- **Team & RBAC** — owner / admin / manager / staff / accountant roles
- **Products** — master catalog with SKU, cost/sell price, reorder threshold
- **Inventory** — stock receiving / picking / adjustments, movement history, low-stock alerts
- **Orders** — unified sales + purchase order schema
- **Payments** — 4 gateway types stubbed, cash-flow snapshot, Stripe checkout
- **Customers & Suppliers** — CRM / procurement base records, supplier comparison
- **Expenses** — categorized, per-branch expense tracking + summary
- **Notifications** — in-app + channel notifications
- **Reports** — live reports + saved snapshots
- **Integrations** — WhatsApp, JazzCash, Easypaisa, Stripe, Razorpay connectors (stubbed)
- **Subscriptions** — Stripe billing (FREE / BASIC / PRO) with checkout, cancel, reactivate, portal, and admin analytics
- **Security** — RBAC, immutable audit logging, rate limiting, helmet

### Phase 3 — Intelligence (Procurement Assistant slice)
- A **rule-based recommendation engine** that estimates demand velocity from inventory movement history and proposes reorders with a **rationale, confidence score, and risk tier**
- **Human-in-the-loop approval** — approving a recommendation auto-creates a `purchase` order; rejecting just logs the decision
- High-value recommendations are forced to `high` risk tier regardless of confidence
- This is **not calling an LLM** — it's a deterministic stand-in so the full approval/audit loop is demonstrable end-to-end. Swapping in a real LLM means replacing `generateProcurementSignal` in `backend/controllers/aiController.js` only; the lifecycle, risk-tiering, and audit trail stay the same.

---

## 🧱 Tech Stack

| Layer    | Technology |
|----------|-----------|
| **Backend**  | Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt, passport (Google OAuth 2.0), Stripe, Nodemailer, Firebase Admin, helmet, express-rate-limit |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios, Zustand, Framer Motion, Lucide React, Canvas Confetti |
| **Auth**     | JWT (access + refresh), Google OAuth (real + dev fallback), Firebase ID tokens |
| **Payments** | Stripe (subscription billing + checkout + webhooks) |

---

## 📂 Project Structure

```
neuroviax-mern/
├── backend/                 # Node.js/Express API
│   ├── config/              # db, passport, stripe, in-memory DB
│   ├── controllers/         # route handlers (15 modules)
│   ├── middleware/          # auth, RBAC, error handler, subscription access
│   ├── models/              # Mongoose schemas (17 models)
│   ├── routes/              # API route definitions
│   ├── seed/                # demo data seeder
│   ├── utils/               # asyncHandler, audit, generateToken, sendEmail
│   └── server.js            # entry point
├── frontend/                # React 18 + Vite + TS
│   ├── src/
│   │   ├── api/             # axios client
│   │   ├── components/      # Layout, ProtectedRoute, SubscriptionGate, etc.
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # usePageSEO
│   │   ├── pages/           # 27 page components
│   │   ├── store/           # Zustand auth store
│   │   ├── App.tsx          # router
│   │   └── main.tsx         # entry point
│   └── vite.config.ts
├── docs/                    # Product strategy docs
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (verified on v24)
- **npm** v9+
- Optional: **MongoDB** running locally (`mongodb://127.0.0.1:27017`) — if unavailable, the backend **automatically falls back to an in-memory demo database** with pre-seeded data

### 1. Backend Setup

```bash
cd backend
cp .env.example .env        # then edit values (see Environment Variables below)
npm install
npm run seed                 # optional: seed demo data for MongoDB mode
npm run dev                  # starts on http://localhost:5000 (nodemon)
# or
npm start                    # plain node server.js
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env         # points to the backend API
npm install
npm run dev                  # starts on http://localhost:5173
```

### 3. Open in Browser

```bash
# Frontend
open http://localhost:5173
```

> The frontend dev server proxies `/api/*` to `http://localhost:5000` (see `frontend/vite.config.ts`).

---
