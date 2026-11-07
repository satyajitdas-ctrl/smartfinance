# FinWise AI — Intelligent Personal Finance Assistant

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.5+-F7931E.svg)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An intelligent, full-stack personal finance platform engineered with **FastAPI**, **React**, **TypeScript**, and **Scikit-learn**. FinWise AI empowers users to analyze real-time cash flow, manage category-wise monthly budgets, forecast future expenses with Machine Learning, detect statistical spending anomalies with Isolation Forest, and query an AI financial assistant grounded deterministically in verified database records.

---

## 📌 Problem Statement

Traditional expense trackers act as passive digital ledger sheets:
1. They require tedious manual categorisation for every single UPI, card, or cash purchase.
2. They cannot forecast whether current spending velocity will breach end-of-month budget thresholds.
3. They fail to identify unusual financial anomalies (e.g. accidental subscription renewals, unusually large dining bills).
4. Generic AI chatbots hallucinate financial advice, inventing arbitrary figures disconnected from a user's true bank statements.

**FinWise AI solves this** by coupling verified database-level calculations with lightweight, explainable machine learning models running locally on the backend, providing automated expense categorization, budget risk forecasting, outlier detection, and zero-hallucination assistant interaction.

---

## 🚀 Key Features

- **🔐 Secure JWT Authentication & Data Isolation**: User registration, login, bcrypt password hashing, and strict user-level data isolation ensuring tenants can only access their personal finances.
- **📊 Real-Time Financial Dashboard**: Instant telemetry for Total Income, Expenses, Net Liquid Balance, Savings Rate (%), Category breakdowns, and interactive Recharts visualizations in Indian Rupees (**₹**).
- **💳 Complete Transaction Management**: Add, update, delete, search, and filter transactions across 12 standardized categories (Food, Rent, Shopping, Transportation, Healthcare, Bills, etc.).
- **🤖 ML Expense Categorization**: Scikit-learn TF-IDF vectorizer + Logistic Regression classifier trained on merchant datasets to automatically infer categories from descriptions (e.g., `"Swiggy food order"` &rarr; `Food`, `"Uber ride"` &rarr; `Transportation`).
- **📈 Budget Forecasting & Predictive Analytics**: Moving window time-series regression calculating expected end-of-month spending velocity and budget variance.
- **🚨 Outlier & Anomaly Detection**: Unsupervised Scikit-learn Isolation Forest flagging statistically anomalous transactions with clear explanations without false fraud accusations.
- **💬 Grounded AI Finance Assistant**: Interactive conversational agent grounded in verified database figures, featuring a 100% deterministic local calculation fallback and optional Gemini/OpenAI API integrations.
- **📁 Statements & CSV Import/Export**: Parse bank statement CSVs with schema validation and duplicate detection, with instant CSV/PDF export capability.

---

## 🏗️ System Architecture

```
smartfinance/
├── frontend/                     # React + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/           # Reusable UI primitives (MetricCard, etc.)
│   │   ├── context/              # Global state (AuthContext with JWT persistence)
│   │   ├── layouts/              # Dashboard sidebar & top navigation
│   │   ├── pages/                # Views: Dashboard, Transactions, Budgets, Analytics, Insights, Assistant, Reports, Settings
│   │   ├── services/             # Axios API client with bearer token interceptors
│   │   ├── types/                # TypeScript interface definitions
│   │   └── App.tsx               # Client-side router & protected routes
│   └── package.json
│
├── backend/                      # Python FastAPI Core
│   ├── app/
│   │   ├── api/                  # API routers & dependency injection (deps.py)
│   │   │   └── v1/endpoints/     # Modular route controllers (auth, health, tx, etc.)
│   │   ├── core/                 # App settings, DB engine, and bcrypt/JWT security
│   │   ├── models/               # SQLAlchemy ORM schemas (Users, Transactions, Budgets, Insights, Chats)
│   │   ├── schemas/              # Pydantic validation & response schemas
│   │   ├── services/             # Business calculation services
│   │   ├── ml/                   # Scikit-learn models & training scripts
│   │   └── main.py               # Application entrypoint & CORS middleware
│   ├── tests/                    # Pytest test suite with in-memory SQLite isolation
│   └── requirements.txt
│
├── datasets/                     # Synthetic merchant transaction datasets for ML training
│   └── sample_transactions.csv
├── docs/                         # Architecture documentation
├── .env.example                  # Environment configuration template
├── .gitignore                    # Security ignore list (protects secrets & db)
└── docker-compose.yml            # Multi-container orchestration
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router, Axios |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn |
| **Database** | SQLite (zero-config local development) / PostgreSQL ready |
| **Machine Learning** | Scikit-learn (TF-IDF, Logistic Regression, Isolation Forest), Pandas, NumPy, Joblib |
| **Security** | OAuth2 Bearer Tokens, PyJWT/Jose, Bcrypt salt hashing, Data Isolation |
| **Testing** | Pytest, TestClient, In-Memory SQLite |

---

## ⚙️ Quickstart Installation Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.11+** (`python --version`)
- **Node.js 20+** and **npm** (`node -v`, `npm -v`)
- **Git** (`git --version`)

### 2. Clone Repository & Setup Environment
```bash
git clone https://github.com/satyajitdas-ctrl/smartfinance.git
cd smartfinance
cp .env.example .env
```

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Run automated tests to verify database and authentication
pytest -v

# Start the FastAPI backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
- System Health Check: `http://127.0.0.1:8000/api/v1/health`

### 4. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run build    # Verifies TypeScript types & builds production assets
npm run dev      # Starts Vite local development server
```
- Access the Web Application at: `http://localhost:5173`

---

## 🧪 7-Day Development Schedule & Roadmap

- [x] **DAY 1 — Repository & Project Setup**: Project architecture, FastAPI backend with SQLite/PostgreSQL engine, SQLAlchemy ORM models, Pydantic v2 schemas, JWT authentication, React + TypeScript Vite frontend, Tailwind CSS FinTech SaaS layout, automated PyTest suite.
- [x] **DAY 2 — Authentication & Transactions**: Full CRUD endpoints for transactions (`POST`, `GET`, `PUT`, `DELETE` at `/api/v1/transactions`), live transaction summary telemetry (`/transactions/summary`), user data isolation security tests, interactive transaction entry & edit modals, real-time category & search filtering, automated realistic Indian transaction seeder (`/transactions/seed`), and dynamic dashboard synchronization.
- [x] **DAY 3 — Dashboard & Analytics**: Dynamic calculations for Balance, Income, Expense, Savings Rate, Category breakdowns, and real-time Recharts visualizations. Category breakdown API (`/analytics/category-breakdown`), month-over-month category variance comparison (`/analytics/monthly-comparison`), and 6-month historical cash flow trends (`/analytics/cashflow-trends`).
- [x] **DAY 4 — Machine Learning Categorisation**: Scikit-learn TF-IDF vectorizer + Logistic Regression classifier with balanced class weighting across 11 financial categories; offline reproducible training pipeline (`train_categorizer.py`) with Indian commerce dataset; Joblib model persistence (`expense_categorizer.joblib`); real-time inference API (`/api/v1/ml/predict-category`); active-learning user correction mechanism (`/api/v1/ml/correct-category`); debounced live inference in frontend transaction modal with confidence scoring and telemetry (`/api/v1/ml/model-info`).
- [x] **DAY 5 — Budget Forecasting & Anomaly Detection**: Category budget management with real-time utilization telemetry (`/api/v1/budgets`, `/budgets/status`); Scikit-learn Isolation Forest (`contamination=0.08`) and category-level statistical Z-score outlier detection (`/api/v1/ml/anomalies`, `/ml/anomalies/detect`); user anomaly review verification workflow (`/ml/anomalies/{id}/review`); time-series moving-window regression forecasting next month commitments vs budgets (`/api/v1/ml/forecast`); fully connected interactive UI in `BudgetsPage.tsx` and `InsightsPage.tsx` with non-financial-advice disclaimers.
- [x] **DAY 6 — AI Assistant & Reports**: Grounded conversational financial assistant (`/api/v1/assistant/chat`, `/history`) combining deterministic SQL/Python financial metrics with zero-hallucination guardrails and configurable LLM provider integration; persistent chat conversation history; statement CSV import engine (`/api/v1/reports/import-csv`) with strict schema validation, duplicate transaction detection, and automated ML category inference; downloadable sample statement template and full user transaction CSV export (`/api/v1/reports/export-csv`); fully connected interactive UI in `AssistantPage.tsx` and `ReportsPage.tsx`.
- [ ] **DAY 7 — Testing, Deployment & GitHub Portfolio**: Comprehensive end-to-end testing, portfolio documentation, Docker container verification, production deployment guide.

---

## 🔒 Security & Data Privacy

1. **Passwords**: Passwords are never stored in plaintext. They are salted and hashed using Bcrypt with 12 rounds.
2. **Access Control**: Every database query is strictly scoped to `user_id == current_user.id` enforcing complete multi-tenant tenant isolation.
3. **No Financial Credentials**: FinWise AI never asks for or stores bank passwords, card PINs, OTPs, or CVVs.
4. **Zero-Hallucination AI**: The financial assistant calculates exact metrics via deterministic SQL/Pandas aggregation before passing context to any language model.

---

## 👤 Author & Portfolio
- **Developer**: Satyajit Das
- **Specialization**: BTech in Artificial Intelligence & Machine Learning
- **Repository**: [github.com/satyajitdas-ctrl/smartfinance](https://github.com/satyajitdas-ctrl/smartfinance)
