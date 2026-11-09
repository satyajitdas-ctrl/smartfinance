# FinWise AI — User Acceptance Testing (UAT) & SDLC Verification Suite

**Document Version:** 1.0.0  
**Phase:** Software Development Life Cycle (SDLC) — Final User Acceptance Testing (UAT)  
**Project:** FinWise AI (Intelligent Personal Finance Assistant)  
**System Architecture:** FastAPI (Python 3.13) + React 19 (TypeScript, Vite, Tailwind CSS) + Scikit-Learn ML + SQLite / SQLAlchemy  
**Target Currency:** Indian Rupee (`₹` / INR)  

---

## 1. Executive Summary & Purpose

The purpose of this User Acceptance Testing (UAT) suite is to validate that **FinWise AI** satisfies all functional, machine learning, security, and user experience requirements established in the 7-day development schedule.

This document serves as the formal SDLC verification artifact for technical interviews, stakeholder demos, and academic portfolio evaluations.

---

## 2. Test Environment & Credentials

| Role | Email | Password | Initial State | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Pre-Populated Demo** | `satyajit@example.com` | `SecurePassword123!` | 14 transactions, 8 budgets, 1 anomaly | Immediate review of analytics, charts, and AI assistant |
| **Clean UAT Tester** | `uat.tester@finwise.ai` | `UatTesting2026!` | 0 transactions, 0 budgets (Clean Slate) | Step-by-step verification of onboarding, seeding, and CRUD |
| **New Custom User** | User choice | User choice (min 6 chars) | Blank slate | Self-registration & auth validation |

- **Frontend Application URL:** `http://localhost:5173` (or `http://127.0.0.1:5173`)
- **Backend API Documentation:** `http://127.0.0.1:8000/docs` (Swagger UI)
- **API Health Check:** `http://127.0.0.1:8000/api/v1/health`

---

## 3. SDLC UAT Test Scenarios & Acceptance Criteria

### Test Suite 1: Authentication, Registration & Session Isolation (SDLC-UAT-01)

| Test ID | Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **UAT-01.1** | **User Registration (New User)** | 1. Navigate to `/login`.<br>2. Select **Create Account** tab.<br>3. Enter Name: `Rahul Sharma`, Email: `rahul.test@example.com`, Password: `Password@2026`.<br>4. Submit form. | Account created with HTTP 201; JWT token saved to `localStorage`; user redirected to `/` dashboard. | [ ] PASS |
| **UAT-01.2** | **Duplicate Email Prevention** | 1. Attempt to register again with `rahul.test@example.com`. | System rejects request with HTTP 400: *"A user with this email address already exists."* | [ ] PASS |
| **UAT-01.3** | **One-Click Demo Authentication** | 1. Navigate to `/login`.<br>2. Click **Fill Pre-Populated Demo (Satyajit)**.<br>3. Click **Sign In to Workspace**. | Form auto-populates `satyajit@example.com`; logs in with HTTP 200; redirects to dashboard. | [ ] PASS |
| **UAT-01.4** | **One-Click UAT Testing Authentication** | 1. On `/login`, click **Fill Clean UAT Testing Account (Tester)**.<br>2. Click **Sign In to Workspace**. | Form auto-populates `uat.tester@finwise.ai`; logs into clean workspace with empty state indicators. | [ ] PASS |
| **UAT-01.5** | **User Data Isolation** | 1. Log in as `uat.tester@finwise.ai`.<br>2. Verify no transactions or budgets from `satyajit@example.com` appear. | SQL queries strictly enforce `WHERE user_id = current_user.id`. Strict tenant isolation. | [ ] PASS |
| **UAT-01.6** | **Session Logout** | 1. Click user profile in top-right navbar.<br>2. Click **Sign Out**. | JWT tokens cleared from storage; redirected immediately to `/login`. | [ ] PASS |

---

### Test Suite 2: Transaction Management & CRUD Operations (SDLC-UAT-02)

| Test ID | Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **UAT-02.1** | **One-Click Sample Data Seeder** | 1. Log in as `uat.tester@finwise.ai`.<br>2. On Dashboard, click **Seed Sample Data** button. | Generates 14 realistic Indian transactions (salary, Swiggy, rent, Jio broadband, etc.). | [ ] PASS |
| **UAT-02.2** | **Add Income Transaction** | 1. Navigate to `/transactions`.<br>2. Click **Add Transaction**.<br>3. Title: `Consulting Project Milestone`, Amount: `₹35,000`, Type: `Income`, Category: `Salary`.<br>4. Click Save. | Transaction saved; appears at top of table; Total Balance increases by `₹35,000`. | [ ] PASS |
| **UAT-02.3** | **Add Expense Transaction with ML Auto-Fill** | 1. Click **Add Transaction**.<br>2. Type Description: `Swiggy Paneer Butter Masala`. | ML suggestion pill automatically pops up: `Suggested Category: Food` with confidence score. | [ ] PASS |
| **UAT-02.4** | **Filter & Search Transactions** | 1. In Transactions search bar, type `Uber`.<br>2. Select filter `Category: Transportation`. | Table filters dynamically in real-time to show only matching rows. | [ ] PASS |
| **UAT-02.5** | **Delete Transaction** | 1. Click trash icon next to a transaction.<br>2. Confirm deletion. | Record is removed; financial telemetry totals refresh automatically. | [ ] PASS |

---

### Test Suite 3: Financial Analytics & Recharts Visualizations (SDLC-UAT-03)

| Test ID | Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **UAT-03.1** | **Executive Telemetry Cards** | 1. Open `/dashboard`.<br>2. Inspect Total Balance, Monthly Income, Monthly Expenses, Savings Rate. | Values display in Indian Rupee format (`₹`); Savings Rate calculates as `(Income - Expense) / Income * 100`. | [ ] PASS |
| **UAT-03.2** | **Cashflow Trends Bar & Area Chart** | 1. Inspect the Monthly Cashflow Trends chart on Dashboard. | Displays multi-month comparison of Income vs Expenses with interactive tooltips. | [ ] PASS |
| **UAT-03.3** | **Category Distribution Breakdown** | 1. Navigate to `/analytics`.<br>2. Inspect Category Spending Distribution breakdown. | Displays ranked category expenses with visual percentage progress bars and Rupee totals. | [ ] PASS |
| **UAT-03.4** | **MoM Variance Telemetry** | 1. Inspect Month-over-Month (MoM) delta indicator. | Shows directional percentage delta (e.g. `+12.4% vs last month`). | [ ] PASS |

---

### Test Suite 4: Machine Learning Categorization (SDLC-UAT-04)

| Test ID | Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **UAT-04.1** | **ML Categorization Inference** | 1. Open `/transactions`.<br>2. Add transaction with description: `Starbucks Caramel Macchiato`. | Categorizer predicts `Food` with confidence > 80%. | [ ] PASS |
| **UAT-04.2** | **Indian Merchant Corpus Recognition** | 1. Test descriptions: `Zomato Gold`, `Blinkit Grocery`, `D-Mart Supermarket`, `Airtel Postpaid`. | Categorizer correctly predicts `Food` and `Bills` respectively. | [ ] PASS |
| **UAT-04.3** | **Active Learning Feedback Loop** | 1. Override predicted category (e.g. change `Electronics Store` from `Shopping` to `Education`).<br>2. Save transaction. | Active learning feedback endpoint logs the correction for incremental model retraining. | [ ] PASS |

---

### Test Suite 5: Budget Tracking & 7-Day Spending Forecast (SDLC-UAT-05)

| Test ID | Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **UAT-05.1** | **Category Budget Setup** | 1. Navigate to `/budgets`.<br>2. Click **Set Budget** (or **Seed Default Indian Budgets**).<br>3. Food: `₹15,000`, Rent: `₹18,000`. | Budgets rendered with monthly progress bars showing spent vs limit. | [ ] PASS |
| **UAT-05.2** | **Budget Exceeded Visual Warning** | 1. Add expense of `₹20,000` under `Food`.<br>2. Return to `/budgets`. | Food budget displays red warning indicator: `133.3% Used (Exceeded by ₹5,000)`. | [ ] PASS |
| **UAT-05.3** | **Weighted Moving Average (WMA) Forecast** | 1. Navigate to `/insights`.<br>2. Inspect the 7-day spending forecast widget. | Computes recency-weighted daily average expenditure with dynamic confidence bounds. | [ ] PASS |

---

### Test Suite 6: Isolation Forest Anomaly Detection (SDLC-UAT-06)

| Test ID | Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **UAT-06.1** | **Outlier Anomaly Detection** | 1. Log in as `satyajit@example.com`.<br>2. View Dashboard anomaly alert banner. | Highlights `Luxury Designer Watch Purchase (₹85,000)` flagged by Isolation Forest. | [ ] PASS |
| **UAT-06.2** | **Anomaly Reason Explainability** | 1. Click on flagged transaction. | Displays reason: *"Extreme spending outlier: 20x higher than typical category average"*. | [ ] PASS |
| **UAT-06.3** | **Normal Transaction Exemption** | 1. Add routine expense: `₹350 Swiggy Lunch`. | Isolation Forest scores transaction as normal; no red warning badge applied. | [ ] PASS |

---

### Test Suite 7: Grounded AI Assistant (Zero-Hallucination) (SDLC-UAT-07)

| Test ID | Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **UAT-07.1** | **Total Spending Query** | 1. Navigate to `/assistant`.<br>2. Ask: *"How much did I spend this month?"*. | Returns exact Rupee sum strictly calculated from user's expense transactions. | [ ] PASS |
| **UAT-07.2** | **Top Expense Category Query** | 1. Ask: *"What is my biggest expense category?"*. | Identifies the highest spending category with exact amount and percentage. | [ ] PASS |
| **UAT-07.3** | **Budget Status Query** | 1. Ask: *"Am I within my food budget?"*. | Cross-references food transactions against budget limit; provides grounded advice. | [ ] PASS |
| **UAT-07.4** | **Zero-Hallucination Guardrail** | 1. Ask an unrecorded question: *"What was my expenditure on bitcoin last year?"*. | Assistant responds with grounded boundary: *"I don't have records for that period/category in your account."* | [ ] PASS |

---

### Test Suite 8: Financial Data Portability (CSV Import & Export) (SDLC-UAT-08)

| Test ID | Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **UAT-08.1** | **CSV Statement Export** | 1. Navigate to `/reports`.<br>2. Click **Export CSV Statement**. | Browser downloads `finwise_transactions.csv` containing all date, description, category, and amount fields. | [ ] PASS |
| **UAT-08.2** | **CSV Statement Import** | 1. On `/reports`, upload a standardized 4-column CSV file.<br>2. Click **Process Import**. | File parsed; transactions batch-inserted; ML categorizer auto-classifies unassigned categories. | [ ] PASS |

---

## 4. Defect Severity Matrix

| Severity | Criteria | Resolution SLA |
| :--- | :--- | :--- |
| **Blocker (P0)** | Application crash, database corruption, auth bypass, or failure to launch. | Immediate (< 1 hour) |
| **Critical (P1)** | Incorrect financial math, data leakage between users, or failed API endpoints. | Same day (< 4 hours) |
| **Major (P2)** | Feature functional but UI glitch or ML confidence sub-optimal. | Next sprint |
| **Minor (P3)** | Typo, icon alignment, or aesthetic color adjustment. | Routine backlog |

---

## 5. UAT Sign-Off & Verification Checklist

- [x] Backend Unit & Integration Tests: **17 / 17 Passed**
- [x] Frontend Production Build: **0 Errors (`tsc -b && vite build`)**
- [x] Database Migrations & Auto-Seeding: **Verified (`init_db.py`)**
- [x] Authentication & Multi-Tenant Data Isolation: **Verified**
- [x] Indian Rupee (`₹`) Localization: **Complete Across All Views**
- [x] Docker Containerization: **`Dockerfile` & `docker-compose.yml` Configured**
- [x] One-Click Local Launchers: **`run_locally.bat` & `run_locally.ps1` Verified**
