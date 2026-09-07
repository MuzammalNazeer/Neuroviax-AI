# Neuroviax AI — Autonomous Business Operating Platform (ABOP v5.0)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/MuzammalNazeer/Neuroviax-AI)
[![Stack](https://img.shields.io/badge/stack-MERN-blue.svg)](https://github.com/MuzammalNazeer/Neuroviax-AI)
[![Frontend](https://img.shields.io/badge/frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite%20%7C%20TailwindCSS-61dafb.svg)](https://vitejs.dev/)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%7C%20Express%20%7C%20MongoDB-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

**Neuroviax AI** is an AI-First Autonomous Business Operating Platform (ABOP) built on the MERN stack. It replaces legacy, siloed ERPs and CRMs by orchestrating business workflows through a continuous human-in-the-loop intelligence loop:
$$\text{Record} \longrightarrow \text{Analyze} \longrightarrow \text{Recommend} \longrightarrow \text{Human Approves} \longrightarrow \text{Workflow Executes}$$

---

## 🚀 Key Features

### 1. Operational Hub & Real-time Analytics
- **Live KPI Metrics**: Real-time tracking of Accounts Receivable ($AR), Accounts Payable ($AP), Low Stock Alerts, Net Cash Position, and AI Proposal Adoption Rate.
- **ABOP Operating Cycle**: Interactive visual tracking of business signals as they move from ingestion to automated execution.

### 2. 6 Domain-Scoped AI Assistants
- 🛒 **Procurement Assistant**: Analyzes inventory velocity, detects low-stock thresholds, and generates reorder proposals with confidence scores and risk tiers.
- 📈 **Sales Intelligence**: Segment velocity, predictive ordering, and next-best-offer recommendations.
- 📦 **Inventory Optimization**: Anomaly detection, dead-stock flags, and shrinkage alerts.
- 💳 **Finance & Cash-Flow**: Working capital forecasts and automatic payment follow-ups.
- 🎯 **Marketing Engine**: Targeted campaign generation based on customer purchasing history.
- 🎧 **Customer Support & CRM**: Omnichannel communication with direct WhatsApp automation integration.

### 3. Core Enterprise Modules
- **Authentication & RBAC**: JWT Access & Refresh token system, Multi-business and multi-branch tenancy, Role-Based Access Control (`Owner`, `Admin`, `Manager`, `Staff`).
- **Product Master Catalog**: Centralized SKU, barcode, unit pricing, cost tracking, and categorical organization.
- **Multi-Branch Inventory**: Stock receiving, warehouse picking, manual adjustments, transfer logs, and automated alerts.
- **Unified Orders**: Single schema architecture handling both Sales and Purchase orders through full lifecycles (`pending → approved → fulfilled`).
- **Payments & Cashflow**: Multi-gateway transaction records (Stripe, JazzCash, Easypaisa, Bank Wire) with automated balance updates.
- **Expense Management**: Categorized overhead and operational expense tracking.
- **Customers & Suppliers**: Comprehensive directory with purchase history, credit terms, and ledger statements.
- **Subscription Management**: Tiered pricing plans (Starter, Basic, Pro, Enterprise) with integrated Stripe Billing.
- **Audit Logging**: Immutable, tamper-evident audit logs capturing every critical business event.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Zustand |
| **Backend** | Node.js, Express, MongoDB (with automatic In-Memory DB fallback), JWT, Bcrypt, Helmet |
| **Integrations** | Stripe Billing, Firebase Authentication (optional), WhatsApp Business Direct Link |
| **Deployment & Tooling** | Git, PostCSS, ESLint, npm |

---

## 📂 Project Architecture

```
neuroviax-mern/
├── backend/
│   ├── config/             # Database (MongoDB & In-Memory fallback), Stripe, Passport
│   ├── controllers/        # Business logic for AI, Auth, Inventory, Orders, Payments, etc.
│   ├── middleware/         # JWT Auth, RBAC guards, Subscription access, Error handling
│   ├── models/             # Mongoose schemas (Business, User, Product, Order, AIRecommendation)
│   ├── routes/             # RESTful API endpoints
│   ├── seed/               # Demo database seeding script
│   └── server.js           # Express application entrypoint
│
└── frontend/
    ├── public/             # Static assets, favicon, robots.txt, sitemap.xml
    ├── src/
    │   ├── api/            # Axios API client instance with interceptors
    │   ├── components/     # Reusable UI components (Layout, SEO, ProtectedRoute, Modals)
    │   ├── context/        # React authentication context
    │   ├── pages/          # Dashboard, AI Assistants, Inventory, Orders, Subscription, etc.
    │   ├── store/          # Zustand state management
    │   ├── App.tsx         # Route definitions and layout structure
    │   └── main.tsx        # React entrypoint
    └── vite.config.ts      # Vite configuration
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- *(Optional)* **MongoDB**: Local or MongoDB Atlas URI (falls back to In-Memory store if not provided)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/MuzammalNazeer/Neuroviax-AI.git
cd Neuroviax-AI
```

---

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start the development server (runs on port 5000)
npm run dev
# OR start with node directly:
npm start
```

> **Note:** The backend automatically operates with an **in-memory data store** out-of-the-box if `MONGO_URI` is not set in `backend/.env`.

---

### Step 3: Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Access Credentials

The platform comes pre-configured with a ready-to-test business profile:

| Field | Value |
|---|---|
| **Email** | `demo@neuroviax.ai` |
| **Password** | `Password123!` |
| **Role** | Business Owner (`OWNER`) |
| **Organization** | Demo Retail Store |

You can also use the one-click **"Sign In with Google"** / Quick Account Switcher on the Login page.

---

## 🤖 Testing the Autonomous AI Loop

1. Navigate to **AI Proposals / Recommendations** in the sidebar.
2. Click **Generate Recommendations** — the rule-based AI engine analyzes current stock levels against sales velocity.
3. A procurement recommendation is generated with **Confidence Score**, **Risk Tier**, and **Detailed Rationale**.
4. Click **Approve** — the platform automatically creates a formal Purchase Order under **Orders**.
5. Move the order from `approved` to `fulfilled` to see inventory levels replenish automatically.

---

## 📄 License & Author

- **Author:** [Muzammal Nazeer](https://github.com/MuzammalNazeer)
- **Repository:** [https://github.com/MuzammalNazeer/Neuroviax-AI](https://github.com/MuzammalNazeer/Neuroviax-AI)
- **License:** MIT License
