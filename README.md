<div align="center">

# ⚡ Neuroviax AI — Autonomous Business Operating Platform (ABOP)

### *Next-Generation MERN Enterprise ERP & Multi-Business Intelligence Cockpit*

<p align="center">
  <img src="https://img.shields.io/badge/MERN_Stack-Enterprise_Grade-00D26A?style=for-the-badge&logo=mongodb&logoColor=white" alt="MERN" />
  <img src="https://img.shields.io/badge/Version-1.0.0_Production-6366F1?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/AI_Engines-Active-8B5CF6?style=for-the-badge" alt="AI" />
</p>

</div>

---

## 📑 Table of Contents

1. [Platform Overview & Philosophy](#-platform-overview--philosophy)
2. [The 30/70 Architectural Moat](#-the-3070-architectural-moat)
3. [The 5-Stage ABOP Closed Loop](#-the-5-stage-abop-closed-loop)
4. [AI & Machine Learning Intelligence Suite](#-ai--machine-learning-intelligence-suite)
   - [1. 6 Autonomous Domain AI Copilots](#1--6-autonomous-domain-ai-copilots)
   - [2. Interactive Demand Forecasting Cockpit & EOQ](#2--interactive-demand-forecasting-cockpit--eoq)
   - [3. Collaborative Filtering & Cross-Sell Recommender](#3--collaborative-filtering--cross-sell-recommender)
   - [4. Isolation Forest Anomaly Detection & Fraud Shield](#4--isolation-forest-anomaly-detection--fraud-shield)
   - [5. Machine Learning Cash Flow Prediction Cockpit](#5--machine-learning-cash-flow-prediction-cockpit)
   - [6. Customer Segmentation & RFM Clustering](#6--customer-segmentation--rfm-clustering)
   - [7. Conversational Copilot & Real-Time AI Chatboard](#7--conversational-copilot--real-time-ai-chatboard)
5. [Core Enterprise ERP Modules](#-core-enterprise-erp-modules)
6. [Multi-Port Architecture & Orchestration](#-multi-port-architecture--orchestration)
7. [Verified Demo Credentials](#-verified-demo-credentials)
8. [Complete Page & Route Architecture](#-complete-page--route-architecture)
9. [Comprehensive REST API Reference](#-comprehensive-rest-api-reference)
10. [Quick Start & Setup Guide](#-quick-start--setup-guide)
11. [Postman API Collection](#-postman-api-collection)
12. [Environment Configuration Reference](#-environment-configuration-reference)
13. [Authors & Maintainers](#-authors--maintainers)

---

## 🌟 Platform Overview & Philosophy

**Neuroviax AI** is an enterprise-grade Autonomous Business Operating Platform (**ABOP**) built on the **MERN (MongoDB, Express, React, Node.js)** stack with **TypeScript** and **Tailwind CSS**. 

Traditional ERP systems (SAP, Oracle, Tally, Zoho) act solely as passive **Systems of Record**—they wait for humans to enter numbers, require manual reconciliation, and lack predictive capability. **Neuroviax AI transforms the ERP into a proactive System of Action & Intelligence**:

- **System of Record (30%)**: Centralizes inventory, multi-branch operations, multi-currency financials, POS transactions, customer relationships, and supply chain records.
- **System of Action & Intelligence (70%)**: Powered by mathematical machine learning algorithms, continuous background monitoring, explainable feature attribution, and autonomous closed-loop execution.

---

## 🏛️ The 30/70 Architectural Moat

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEUROVIAX AI ECOSYSTEM                          │
├──────────────────────────────────┬─────────────────────────────────────┤
│   30% SYSTEM OF RECORD           │   70% SYSTEM OF ACTION & AI         │
│   (Traditional Foundations)      │   (Autonomous ABOP Loop)            │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • Multi-tenant / Multi-branch    │ • 6 Autonomous Domain AI Copilots   │
│ • Inventory Master & SKU Ledger  │ • Cosine Similarity Vector Matching │
│ • Point-of-Sale (POS) & Checkout │ • Exponential Smoothing Demand Time │
│ • Sales & Purchase Order Books   │ • Isolation Forest Anomaly Shield   │
│ • Cash / Bank / Stripe Gateways  │ • XGBoost/LightGBM Cash Prediction  │
│ • Customer & Supplier Directory  │ • K-Means RFM Persona Clustering    │
│ • RBAC Role Hierarchy            │ • Conversational Decision Chatboard │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 🔄 The 5-Stage ABOP Closed Loop

Neuroviax operationalizes business automation through the patented **ABOP Closed Loop** (`/abop-loop`):

1. **Record**: Ingests real-time events across POS, stock adjustments, customer orders, gateway disbursements, and invoice payments.
2. **Analyze**: Algorithms process feature vectors across rolling velocity, seasonal periodicity, standard deviation bounds, and historical affinity.
3. **Recommend**: Synthesizes actionable, explainable suggestions (e.g., *Optimal EOQ Reorder*, *Price Anomaly Quarantine*, *Cross-Sell Companion Bundle*).
4. **Approve (Human-in-the-Loop)**: Department heads and store managers review SHAP explanations and approve or modify actions in 1 click.
5. **Execute**: Automatically generates formal purchase orders, triggers Stripe disbursements, adjusts safety stock buffers, or sends customer campaigns.

---

## 🧠 AI & Machine Learning Intelligence Suite

### 1. 🤖 6 Autonomous Domain AI Copilots
Accessible via the interactive sandbox at `/assistants`:
- **Sales Copilot**: Dynamic pricing elasticity, conversion funnel velocity, and upsell bundling.
- **Procurement Copilot**: Supplier SLA monitoring, lead time drift tracking, and automated RFQ creation.
- **Inventory Copilot**: Safety buffer health, stockout velocity projection, and dead-stock write-down mitigation.
- **Marketing Copilot**: Churn likelihood prediction, campaign ROI tracking, and RFM targeted messaging.
- **Support Copilot**: Omnichannel dispute triage, ticket sentiment analysis, and instant resolution routing.
- **Finance Copilot**: Real-time burn-rate surveillance, tax liability anticipation, and working capital optimization.

### 2. 📈 Interactive Demand Forecasting Cockpit & EOQ
Live cockpit located at `/demand-forecasting`:
- **Multi-Algorithm Model Switcher**: Real-time switching between **Exponential Smoothing** (dynamic $\alpha$), **Simple Moving Average (SMA)**, and **Linear Trend Regression**.
- **Statistical Confidence Cones**: Upper and lower bound trajectory cones for volatility and risk assessment.
- **Stockout Risk Probability**: Computes exact consumption velocity, safety buffer, and days until inventory exhaustion.
- **Automated Economic Order Quantity (EOQ)**:
  $$\text{EOQ} = \sqrt{\frac{2 \times D \times S}{H}}$$
  Calculates optimal batch size factoring holding ($H$) and ordering ($S$) costs with 1-click PO generation.

### 3. 🎯 Collaborative Filtering & Cross-Sell Recommender
Located at `/recommendations`:
- **Item-Based Vector Cosine Similarity**: Computes similarity scores across entire historical purchase matrix:
  $$\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
- **User-Based Neighbor Clustering**: Groups customer personas with shared taste vectors to recommend catalog items.
- **"Frequently Bought Together" Companion Bundles**: Instant companion bundling for high-conversion POS add-ons.
- **Interactive Decision Cockpit**: Switch customer personas on the fly and push recommendations directly into live POS carts.

### 4. 🛡️ Isolation Forest Anomaly Detection & Fraud Shield
Located at `/anomaly-detection`:
- **Unsupervised iTree Ensemble Architecture**: Implements pure **Isolation Forest ($t=100, \psi=256$)** using recursive random hyperplanes and the Euler-Mascheroni constant ($\gamma = 0.577215$) to compute path depth $c(n)$ and anomaly score:
  $$s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}$$
- **Multi-Domain Vector Extraction**:
  - **Transaction Fraud**: Detects off-hours circadian spikes (1 AM - 5 AM), gateway retries, and Z-score deviation.
  - **Inventory Shrinkage**: Detects phantom inventory drains, variance between physical counts vs balance, and abnormal write-offs.
  - **Supplier Price Spikes**: Highlights unit cost variance exceeding contractual tolerances.
- **SHAP-like Feature Attribution**: Breaks down root drivers with percentage impact bars and 1-click mitigation actions (*Freeze Disbursement*, *Order Physical Count*, *Quarantine SKU*).

### 5. 💵 Machine Learning Cash Flow Prediction Cockpit
Located at `/cash-flow-prediction`:
- **Ensemble ML Architecture**: Blends **XGBoost tree stumps (45%)**, **LightGBM histogram gradient boosting (35%)**, and **Seasonal Exponential Moving Averages (20%)**.
- **Multi-Horizon Liquidity Forecasts**: Interactive projections for **7-Day**, **14-Day**, **30-Day**, and **90-Day** business run-rates.
- **Confidence Bounds**: Standard deviation upper/lower cones detecting upcoming working capital gaps.
- **AI Strategic Liquidity Advisory**: Actionable working capital recommendations and cash runway alerts.

### 6. 👥 Customer Segmentation & RFM Clustering
Located at `/customer-segmentation`:
- **K-Means Clustering Vector Engine**: Normalizes customer metrics across **Recency (days since last order)**, **Frequency (total orders)**, and **Monetary Value (lifetime revenue)**.
- **Persona Classifications**:
  - 🏆 **Champions**: High frequency, highest monetary value, recent shoppers.
  - 💎 **Potential Loyalists**: Above-average spenders with rapid repeat purchase rates.
  - ⚠️ **At Risk**: High historical spenders who haven't ordered recently.
  - 💤 **Hibernating / Lost**: Low frequency, low recency churn risks.
- **Direct Action Hub**: Filter personas, inspect customer matrices, and launch re-engagement strategies.

### 7. 💬 Conversational Copilot & Real-Time AI Chatboard
Located at `/chatboard` / `/copilot` & embedded drawer:
- Natural language conversational assistant answering queries across sales velocity, cash flow, stock health, and margins.
- Pre-packaged executive prompt library for instant strategic summaries.
- Real-time streaming interface with markdown formatting and metric highlights.

---

## 💼 Core Enterprise ERP Modules

- **Authentication & RBAC**: Dual JWT access/refresh token cycle, Google OAuth 2.0 SSO, Firebase ID token support, and 6-digit SHA-256 OTP password recovery. Role levels: `owner`, `admin`, `manager`, `staff`, `accountant`.
- **Multi-Business & Multi-Branch**: Dynamic business switching, branch location management, and branch-specific inventory ledgers.
- **Point of Sale (POS) & Orders**: Ultra-fast POS with barcode scanner integration, taxes, discounts, line-item inventory reservation, and payment processing.
- **Inventory & Replenishment**: Low-stock threshold surveillance, movement audit history (in/out/adjustment), and batch tracking.
- **Multi-Gateway Payments**: Support for Stripe, JazzCash, Easypaisa, Bank Wire, and Cash with automated receipt generation.
- **Expense Tracking & Reports**: Categorized expense vouchers, automated P&L statements, sales summaries, and tax compliance exports.
- **Subscription Management**: Tiered SaaS licensing (Free Starter, Growth, Professional 100% ABOP, Enterprise Franchise) integrated with Stripe checkout and webhook listeners.
- **Super Admin Platform Governance**: Dedicated Super Admin Cockpit (`/admin`) for platform-wide telemetry, tenant tracking, and digital twin system health monitoring.

---

## 🌐 Multi-Port Architecture & Orchestration

The application utilizes a distributed development architecture:

| Component | Default Port | Environment Variable | Description |
| :--- | :--- | :--- | :--- |
| **Backend REST API** | `5000` | `PORT=5000` | Express server with REST API, AI engines, and database store |
| **Public Website & ERP** | `5174` | Vite default | Main customer portal, marketing pages, and ERP dashboard |
| **Super Admin Cockpit** | `5175` | Vite admin | Dedicated Super Admin portal with isolated operator authentication |

### Dual Database Engine (Seamless In-Memory / MongoDB)
The backend includes a high-performance **In-Memory Store with JSON persistence** (`USE_IN_MEMORY=true`), which restores all models, relations, and AI datasets automatically without requiring an external MongoDB server installed. If `USE_IN_MEMORY=false` is set and MongoDB is available, it connects natively to MongoDB Atlas or local MongoDB.

---

## 🔑 Verified Demo Credentials

Pre-seeded accounts ready for immediate testing:

| Role | Email | Password | Access URL | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Business Owner / ERP** | `demo@neuroviax.ai` | `Password123!` | [http://localhost:5174/login](http://localhost:5174/login) | Full access to ERP Dashboard, POS, Inventory, Orders, AI Cockpits |
| **Super Admin Operator** | `admin@neuroviax.ai` | `Password123!` | [http://localhost:5175/](http://localhost:5175/) | Dedicated access to Super Admin Cockpit, Telemetry, and Platform Governance |

---

## 🗺️ Complete Page & Route Architecture

### Public Website & Showcase Pages (Port 5174)
- `/` or `/landing` — Landing Page with Hero, Dynamic Features, Metrics & Testimonials
- `/assistants` — 6 Autonomous AI Domain Copilots Interactive Sandbox
- `/abop-loop` — 5-Stage Closed Loop Architecture Deep Dive
- `/differentiator` — 30/70 Moat Analysis & Competitive Matrix vs SAP/Zoho/Tally
- `/pricing` — Multi-Currency (PKR ₨ / USD $) Subscription Tier Matrix
- `/faq` — Searchable Knowledge Base & Accordions
- `/about` — Platform Story, Technical Architecture, Leadership
- `/contact` — 24/7 SLA Ticket Routing & WhatsApp Connect
- `/chatboard` or `/copilot` — Standalone Autonomous AI Conversational Chatboard

### Public Authentication (Port 5174)
- `/login` — User & Business Login with JWT & Google SSO
- `/register` or `/signup` — New Enterprise Registration & Onboarding
- `/forgot-password` — OTP Request Screen
- `/verify-otp` — 6-Digit OTP Verification Screen
- `/reset-password` — Secure Password Reset Screen
- `/auth/callback` — OAuth SSO Redirection Handler

### Protected Enterprise ERP Application (Port 5174)
- `/dashboard` — Central Command Hub with KPIs, Quick Actions, and Live Feeds
- `/products` — Product Master Catalog, SKUs, Barcodes, Pricing
- `/inventory` — Stock Tracking, Movements Audit Log, Low-Stock Warnings
- `/orders` — POS Sales Register, Purchase Orders, Status Tracking
- `/payments` — Multi-Gateway Financial Transactions & Receipts
- `/expenses` — Expense Vouchers & Category Cost Allocations
- `/customers` — Customer CRM Directory & Lifetime Spend
- `/suppliers` — Vendor Ledger & Lead-Time Monitoring
- `/reports` — Sales, Inventory, Tax, and P&L Generation
- `/integrations` — Webhook, Stripe, and Third-Party API Sync Hub
- `/subscription` — Plan Overview & Stripe Billing Portal
- `/team` — RBAC Multi-User Invitations & Role Controls

### Dedicated AI & Machine Learning Cockpits (Port 5174)
- `/recommendations` — Collaborative Filtering & "Frequently Bought Together" Matrix
- `/demand-forecasting` — Multi-Model Forecasting, Stockout Probability & EOQ
- `/cash-flow-prediction` — XGBoost/LightGBM Liquidity Projections & Cones
- `/anomaly-detection` — Isolation Forest Fraud Shield & SHAP Attribution
- `/customer-segmentation` — K-Means RFM Persona Analysis & Direct Campaigning
- `/ai-assistants` — In-ERP Assistant Task Orchestrator

### Dedicated Super Admin Cockpit (Port 5175 or /admin)
- `/admin` or dedicated port `5175` — Platform Health, Tenant Analytics, Active Businesses, Telemetry, and Audit Logs

---

## 📡 Comprehensive REST API Reference

All backend endpoints are prefixed with `/api`. Tested and verified:

### 1. Health & Discovery
- `GET /` — Backend index and service metadata
- `GET /api` — API directory and service health overview
- `GET /api/health` — Heartbeat health check with timestamp

### 2. Authentication & Identity (`/api/auth`)
- `POST /api/auth/register` — Register new owner account and initial business
- `POST /api/auth/login` — Authenticate and receive access & refresh tokens
- `POST /api/auth/refresh` — Issue new access token using valid refresh token
- `POST /api/auth/forgot-password` — Generate and email 6-digit SHA-256 OTP
- `POST /api/auth/verify-otp` — Validate 6-digit OTP
- `POST /api/auth/reset-password` — Finalize password update
- `GET /api/auth/me` — Retrieve authenticated user profile and active business
- `GET /api/auth/google` — Initiate Google OAuth 2.0 flow
- `GET /api/auth/google/callback` — Complete Google OAuth 2.0 handshake
- `POST /api/auth/firebase` — Exchange Firebase ID Token for Neuroviax JWT

### 3. AI & Machine Learning Endpoints (`/api/ai`)
- `GET /api/ai/forecast` — Time-series demand forecast, stockout risk %, and EOQ
- `GET /api/ai/procurement-suggestions` — Reorder suggestions with priority flags
- `GET /api/ai/recommendations` — Item-based collaborative filtering catalog recommendations
- `GET /api/ai/recommendations/customer/:customerId` — Personalized customer collaborative recommendations
- `GET /api/ai/recommendations/companions/:productId` — Cross-sell companion bundles
- `GET /api/ai/recommendations/matrix` — Full affinity score matrix
- `POST /api/ai/chat` — Conversational copilot NLP assistant query
- `GET /api/payments/cash-flow-prediction` — 7d/14d/30d/90d cash-flow ML forecast

### 4. Anomaly Detection Engine (`/api/ai/anomalies`)
- `GET /api/ai/anomalies` — Returns full list of isolated anomalies with SHAP feature weights
- `POST /api/ai/anomalies/action` — Executes mitigation action (*freeze_transaction*, *reconcile_stock*, *quarantine_item*, *dismiss*)

### 5. Customer Segmentation (`/api/customer-segmentation`)
- `GET /api/customer-segmentation` — K-Means RFM clustering results with persona classification
- `POST /api/customer-segmentation/recluster` — Trigger real-time dataset re-clustering

### 6. ERP Operations (Products, Inventory, Orders, Payments, Admin)
- `GET /api/products` & `POST /api/products` — CRUD catalog operations
- `GET /api/inventory` & `POST /api/inventory/adjustment` — Inventory and stock balance
- `GET /api/orders` & `POST /api/orders` — POS transactions and sales order tracking
- `GET /api/payments` & `POST /api/payments` — Gateway payments and settlements
- `GET /api/customers` & `POST /api/customers` — Customer CRM endpoints
- `GET /api/suppliers` & `POST /api/suppliers` — Supplier management
- `GET /api/expenses` & `POST /api/expenses` — Expense tracking
- `GET /api/reports/sales` & `GET /api/reports/profit-loss` — Business intelligence reports
- `GET /api/admin/metrics` — Super Admin platform telemetry
- `GET /api/admin/businesses` — Super Admin multi-tenant management
- `POST /api/subscriptions/create-checkout-session` — Stripe hosted checkout creation
- `POST /api/webhooks/stripe` — Stripe webhook event handler

---

## 🚀 Quick Start & Setup Guide

### Prerequisites
- **Node.js** v18.0 or higher
- **npm** v9.0 or higher
- Optional: **MongoDB** (if omitted, falls back to in-memory store automatically)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/MuzammalNazeer/Neuroviax-AI.git
cd Neuroviax-AI
```

---

### Step 2: Install Dependencies

#### Install Root Orchestrator Dependencies
```bash
npm install
```

#### Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

#### Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

### Step 3: Configure Environment Variables

#### Backend `.env` (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
USE_IN_MEMORY=true
MONGO_URI=mongodb://127.0.0.1:27017/neuroviax
JWT_ACCESS_SECRET=neuroviax_super_secret_jwt_key_2026
JWT_REFRESH_SECRET=neuroviax_super_refresh_jwt_key_2026
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5174
STRIPE_SECRET_KEY=sk_test_placeholder
```

#### Frontend `.env` (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 4: Run the Complete Platform

#### Option A: One-Command Root Orchestration (Recommended)
From the root directory:
```bash
npm run dev:all
```
*This concurrently boots up the Backend API (Port 5000), Public Website & ERP (Port 5174), and Super Admin Cockpit (Port 5175).*

#### Option B: Run Services Individually
```bash
# Terminal 1 - Backend API (Port 5000)
npm run dev:backend

# Terminal 2 - Public Website & ERP (Port 5174)
npm run dev:website

# Terminal 3 - Super Admin Cockpit (Port 5175)
npm run dev:admin
```

---

## 📮 Postman API Collection

A complete, production-ready Postman collection is included in the root directory:
📄 **[`Neuroviax_API.postman_collection.json`](./Neuroviax_API.postman_collection.json)**

### How to Import & Test:
1. Open **Postman** and click **Import**.
2. Drag and drop `Neuroviax_API.postman_collection.json`.
3. Run the **`1. Authentication > Login User`** request. The returned JWT token automatically saves into the `{{token}}` variable.
4. Execute any of the 40+ preconfigured requests across AI, POS, Inventory, Payments, and Admin categories.

---

## 📂 Project Structure

```
Neuroviax-AI/
├── package.json                                      # Workspace root script runner (dev:all, dev:website, dev:admin)
├── Neuroviax_AI_Local_Development_and_Setup_Guide.pdf # Official architecture & deployment guide
├── neuroviax_setup_and_chat_guide.html                # Interactive setup, chat, and API test manual
├── Neuroviax_API.postman_collection.json             # Complete Postman API test suite
├── backend/                                          # Express & Node.js REST API
│   ├── config/                                       # DB, In-Memory DB adapter, Passport, Stripe config
│   │   ├── db.js                                     # MongoDB connector with in-memory fallback
│   │   └── inMemoryDb.js                             # Comprehensive demo data store
│   ├── controllers/                                  # 20 Express controllers
│   ├── middleware/                                   # Auth, RBAC, Super Admin, Error handlers
│   ├── models/                                       # 17 Mongoose database models
│   ├── routes/                                       # Modular API routes
│   ├── seed/                                         # Data seed scripts
│   ├── utils/                                        # Machine learning and algorithmic engines:
│   │   ├── anomalyDetectionEngine.js                 # iTree ensemble & feature extraction
│   │   ├── cashFlowPredictionEngine.js               # Multi-horizon XGBoost/LightGBM blend
│   │   ├── collaborativeFiltering.js                 # Cosine similarity matrix generator
│   │   ├── customerSegmentationEngine.js             # RFM score calculation & K-Means
│   │   ├── forecastingEngine.js                      # Exponential smoothing & EOQ
│   │   ├── isolationForest.js                        # Pure mathematical Isolation Forest
│   │   └── kmeans.js                                 # Vector-based K-Means implementation
│   └── server.js                                     # Express entry point
├── frontend/                                         # React 18 + Vite + TypeScript Client
│   ├── public/                                       # Logos, branding assets, and favicons
│   ├── src/
│   │   ├── api/                                      # Axios client & request interceptors
│   │   ├── components/                               # 40+ UI components (Navbars, Modals, Charts, AIChatCopilot)
│   │   ├── context/                                  # AuthContext & state providers
│   │   ├── pages/                                    # 39 Full-page application views:
│   │   │   ├── Landing.tsx                           # Public platform landing page
│   │   │   ├── AIAssistantsPage.tsx                  # 6 AI Copilots showcase
│   │   │   ├── ABOPLoopPage.tsx                      # 5-Stage closed loop explorer
│   │   │   ├── DifferentiatorPage.tsx                # 30/70 Moat analysis
│   │   │   ├── PricingPage.tsx                       # Subscription matrix
│   │   │   ├── AIChatboardPage.tsx                   # Standalone AI conversational chatboard
│   │   │   ├── Dashboard.tsx                         # Core ERP dashboard
│   │   │   ├── DemandForecasting.tsx                 # Time-series forecasting cockpit
│   │   │   ├── Recommendations.tsx                   # Collaborative filtering cockpit
│   │   │   ├── AnomalyDetection.tsx                  # Isolation Forest fraud shield
│   │   │   ├── CashFlowPrediction.tsx                # ML cash flow prediction
│   │   │   ├── CustomerSegmentation.tsx              # K-Means RFM clustering
│   │   │   ├── AdminDashboard.tsx                    # Super Admin telemetry cockpit
│   │   │   └── ... (Orders, Inventory, POS, Payments, Reports, Team, etc.)
│   │   ├── store/                                    # Zustand global stores
│   │   ├── App.tsx                                   # React router mapping
│   │   └── main.tsx                                  # Client entry point
│   ├── tailwind.config.js                            # Tailwind styling configuration
│   └── vite.config.ts                                # Vite configuration
└── README.md                                         # Complete project documentation
```

---

## 📜 License & Authors

- **Founder & Lead Architect**: **Muzammal Nazir**
- **GitHub Repository**: [MuzammalNazeer/Neuroviax-AI](https://github.com/MuzammalNazeer/Neuroviax-AI)
- **License**: MIT License — open for academic, enterprise, and commercial extension.

<div align="center">
  <sub>Built with ❤️ for modern agile businesses by Muzammal Nazir.</sub>
</div>
