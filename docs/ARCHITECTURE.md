# FinWise AI — System Architecture & Implementation Plan

FinWise AI is an enterprise-grade intelligent personal finance platform engineered for full-stack data isolation, deterministic financial intelligence, and machine learning telemetry.

```mermaid
flowchart TD
    User["User Client (Web / Mobile Browser)"]
    subgraph Frontend ["React 18 + TypeScript + Vite + Tailwind CSS"]
        UI["UI Viewport & shadcn/ui Design"]
        Charts["Recharts Visualizations"]
        AuthCtx["AuthContext (JWT Bearer Storage)"]
        AxiosClient["Axios Interceptor Layer"]
    end

    subgraph Backend ["Python 3.11+ FastAPI Core"]
        FastAPIApp["FastAPI Gateway (/api/v1)"]
        Security["JWT Security & Bcrypt Hashing"]
        DataIsolation["User Data Isolation Dependency"]
        Endpoints["REST Endpoints (Auth, Tx, Budgets, ML, AI)"]
        
        subgraph ML ["Machine Learning & AI Layer"]
            Categorizer["TF-IDF + Logistic Regression"]
            Anomaly["Isolation Forest Outlier Detection"]
            Forecasting["Moving Window Time-Series Regression"]
            Assistant["Rule-Based DB-Grounded Fallback / LLM"]
        end
    end

    subgraph Database ["Persistence Layer"]
        SQLite["Relational Database (finwise.db / PostgreSQL)"]
        UsersTable["Users Table"]
        TxTable["Transactions Table"]
        BudgetTable["Budgets Table"]
        InsightTable["AI Insights Table"]
        ChatTable["Chat History Table"]
    end

    User --> UI
    UI --> AxiosClient
    AxiosClient --> FastAPIApp
    FastAPIApp --> Security
    Security --> DataIsolation
    DataIsolation --> Endpoints
    Endpoints --> ML
    Endpoints --> Database
```

## Relational Database Schema Design

1. **Users (`users`)**
   - `id`: Integer, Primary Key, Indexed
   - `name`: Varchar(100)
   - `email`: Varchar(255), Unique, Indexed
   - `hashed_password`: Varchar(255)
   - `currency`: Varchar(10), Default "INR"
   - `created_at`, `updated_at`: Timestamps

2. **Transactions (`transactions`)**
   - `id`: Integer, Primary Key, Indexed
   - `user_id`: Integer, Foreign Key -> `users.id`
   - `description`: Varchar(255)
   - `amount`: Float
   - `transaction_type`: Enum ('income', 'expense')
   - `category`: Varchar(50), Indexed
   - `transaction_date`: Date, Indexed
   - `is_flagged_anomaly`: Boolean, Default False
   - `anomaly_reason`: Varchar(255)
   - `anomaly_score`: Float
   - `review_status`: Enum ('unreviewed', 'confirmed_ok', 'reviewed')
   - `created_at`, `updated_at`: Timestamps

3. **Budgets (`budgets`)**
   - `id`: Integer, Primary Key, Indexed
   - `user_id`: Integer, Foreign Key -> `users.id`
   - `category`: Varchar(50)
   - `monthly_limit`: Float
   - `month`: Integer (1-12)
   - `year`: Integer
   - Unique Constraint: `(user_id, category, month, year)`

4. **AI Insights (`ai_insights`)**
   - `id`: Integer, Primary Key, Indexed
   - `user_id`: Integer, Foreign Key -> `users.id`
   - `insight_type`: Varchar(50)
   - `title`: Varchar(150)
   - `message`: Text
   - `severity`: Varchar(20) ('info', 'warning', 'success')
   - `created_at`: Timestamp

5. **Chat History (`chat_history`)**
   - `id`: Integer, Primary Key, Indexed
   - `user_id`: Integer, Foreign Key -> `users.id`
   - `message`: Text
   - `response`: Text
   - `intent`: Varchar(50)
   - `created_at`: Timestamp
