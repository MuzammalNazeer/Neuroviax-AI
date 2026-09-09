# Neuroviax AI — MERN Stack Implementation

**Neuroviax AI** is a full-stack, enterprise-grade multi-business ERP + AI platform designed for small & medium enterprises. This repository contains a production-ready **MERN (MongoDB, Express, React, Node.js)** implementation covering **Phase 1 (Foundation)** in full, plus an intelligent **Procurement & Demand Forecasting Assistant (Phase 3)** and a **Super Admin Cockpit** for platform governance.

---

## ✨ Core Features & Modules

### 1. 🔐 Authentication & Identity
- **JWT Authentication** — Secure access and refresh token lifecycle.
- **Google OAuth 2.0 SSO** — Real Passport flow when Google OAuth credentials are provided, with an automatic account picker fallback for local testing.
- **Firebase ID Token SSO** — Firebase token verification for web and mobile clients.
- **Password Reset via OTP** — 6-digit email verification code with SHA-256 hashing and a 10-minute expiry window.
- **Multi-Tenant / Role-Based Access Control (RBAC)** — Roles: `owner`, `admin`, `manager`, `staff`, `accountant`.

### 2. 🏢 Business & Multi-Branch Management
- Multi-business context with currency, industry, and fiscal configuration.
- Multi-branch and warehouse inventory tracking.
- Team member invitations with role assignments and active/inactive toggles.

### 3. 📦 Products & Inventory Management
- **Product Master Catalog** — SKU, category, barcode, cost/sell price, and reorder thresholds.
- **Inventory Movements** — Comprehensive audit logging for stock `in`, `out`, and `adjustment`.
- **Automated Low-Stock Alerts** — Instant triggers when inventory drops below safety thresholds.

### 4. 🛒 Point of Sale (POS) & Order Management
- Unified Sales and Purchase order management.
- Real-time cart calculations with tax, discount, and inventory deduction.
- Order lifecycle states: `pending`, `processing`, `completed`, `cancelled`.

### 5. 💳 Payments & Gateway Integrations
- Gateway support for **Stripe**, **JazzCash**, **Easypaisa**, **Razorpay**, **Bank Transfer**, and **Cash**.
- Cash flow analytics snapshot and real-time revenue aggregation.
- Account verification gating for secure transactions.

### 6. 🤖 AI Intelligence & ML Demand Forecasting
- **Demand Velocity Forecasting** — Time-series forecast of product sales and stock depletion risk.
- **Rule-based Procurement Assistant** — Autonomous reorder suggestions with confidence ratings and risk tiers (`low`, `medium`, `high`).
- **Human-in-the-Loop Decisions** — One-click approval auto-generates purchase orders.

### 7. 📊 Reports & Financial Analytics
- Live report generators for Sales, Inventory, Profit & Loss, and Tax.
- Categorized expense tracking and monthly spending breakdowns.

### 8. 🛡️ Super Admin Cockpit (Muzammal Nazir)
- Global enterprise telemetry and live system health monitoring.
- Digital Twin real-time enterprise metrics.
- User management and platform-wide audit log inspection.

---

## 🧱 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend API** | Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt, Passport.js, Stripe, Nodemailer, Firebase Admin, Helmet, Express-Rate-Limit, Morgan |
| **Frontend App** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Axios, Framer Motion, Lucide Icons, Canvas Confetti |
| **Database** | MongoDB Atlas / Local MongoDB (with In-Memory fallback for zero-config offline runs) |
| **Testing & API** | Postman Collection v2.1 (`Neuroviax_API.postman_collection.json`) |

---

## 📂 Project Structure

```
neuroviax-mern/
├── backend/                              # Express & Node.js REST API
│   ├── config/                           # Database, Passport, and Stripe configurations
│   ├── controllers/                      # Business logic controllers (16 modules)
│   ├── middleware/                       # Auth, RBAC, Super Admin, Error Handlers
│   ├── models/                           # Mongoose data schemas (17 models)
│   ├── routes/                           # API route definitions
│   ├── seed/                             # Database seed scripts
│   ├── utils/                            # Email, tokens, and audit helpers
│   └── server.js                         # Backend entry point
├── frontend/                             # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── api/                          # Axios API client
│   │   ├── components/                   # Navigation, Layout, ProtectedRoute, SubscriptionGate
│   │   ├── context/                      # AuthContext & state providers
│   │   ├── hooks/                        # Custom React hooks (e.g., SEO metadata)
│   │   ├── pages/                        # 27+ Page components (Dashboard, POS, AI, Admin, etc.)
│   │   ├── store/                        # Zustand state stores
│   │   ├── App.tsx                       # React application router
│   │   └── main.tsx                      # Frontend entry point
│   └── vite.config.ts                    # Vite config with API proxy
├── Neuroviax_API.postman_collection.json # Importable Postman collection for all endpoints
└── README.md                             # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher
- Optional: **MongoDB** running locally or a MongoDB Atlas URI (if omitted, falls back to an in-memory DB)

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment file
cp .env.example .env

# (Optional) Seed the database with sample business data
npm run seed

# Start development server (Port 5000)
npm run dev
```

The backend will be live at `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment file
cp .env.example .env

# Start development server (Port 5173)
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📮 Postman API Testing

An importable Postman Collection is included in the root directory:
👉 **[`Neuroviax_API.postman_collection.json`](./Neuroviax_API.postman_collection.json)**

### How to use:
1. Open **Postman** and click **Import**.
2. Select `Neuroviax_API.postman_collection.json`.
3. Run the **`1. Authentication > Login User`** request. The access token is automatically saved into the collection variable `{{token}}`.
4. Run and test any endpoint across all 11 categories (Products, POS, Inventory, Payments, AI, Admin, etc.).

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/neuroviax
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
CLIENT_URL=http://localhost:5173

# Optional: Email Notifications (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Neuroviax AI <noreply@neuroviax.com>"

# Optional: Stripe & OAuth
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🛡️ License & Author

- **Platform Creator & Lead Developer**: Muzammal Nazir
- **Project**: Neuroviax AI — Next-Gen Enterprise ERP & Intelligence Platform
