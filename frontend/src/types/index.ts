export interface User {
  id: number;
  name: string;
  email: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Transaction {
  id: number;
  user_id: number;
  description: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  category: string;
  transaction_date: string;
  is_flagged_anomaly: boolean;
  anomaly_reason?: string | null;
  anomaly_score?: number | null;
  review_status: 'unreviewed' | 'confirmed_ok' | 'reviewed';
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category: string;
  monthly_limit: number;
  spent_amount?: number;
  month: number;
  year: number;
  created_at: string;
}

export interface AIInsight {
  id: number;
  user_id: number;
  insight_type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'success';
  created_at: string;
}

export interface ChatMessage {
  id?: number;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
  intent?: string;
  data_context?: Record<string, any>;
}

export interface SystemHealth {
  status: string;
  app_name: string;
  environment: string;
  database: string;
  default_currency: string;
  currency_symbol: string;
  llm_provider: string;
  version: string;
}
