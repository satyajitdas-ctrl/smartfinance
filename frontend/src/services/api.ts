import axios from 'axios';
import type { AuthResponse, SystemHealth, User, Transaction } from '../types';

const API_BASE_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if access token exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('finwise_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 Unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('finwise_token');
      localStorage.removeItem('finwise_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// System Health API
export const checkHealth = async (): Promise<SystemHealth> => {
  const response = await apiClient.get<SystemHealth>('/health');
  return response.data;
};

// Auth APIs
export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  currency?: string;
}): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

// Transaction APIs
export interface TransactionFilters {
  search?: string;
  category?: string;
  transaction_type?: 'income' | 'expense' | 'all';
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}

export interface TransactionSummaryData {
  total_income: number;
  total_expenses: number;
  current_balance: number;
  total_savings: number;
  savings_rate_percentage: number;
  monthly_spending: number;
  transactions_count: number;
}

export const getTransactions = async (filters?: TransactionFilters): Promise<Transaction[]> => {
  const params: Record<string, any> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.category && filters.category !== 'All') params.category = filters.category;
  if (filters?.transaction_type && filters.transaction_type !== 'all') {
    params.transaction_type = filters.transaction_type;
  }
  if (filters?.start_date) params.start_date = filters.start_date;
  if (filters?.end_date) params.end_date = filters.end_date;
  if (filters?.skip !== undefined) params.skip = filters.skip;
  if (filters?.limit !== undefined) params.limit = filters.limit;

  const response = await apiClient.get<Transaction[]>('/transactions', { params });
  return response.data;
};

export const createTransaction = async (data: {
  description: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  category: string;
  transaction_date: string;
}): Promise<Transaction> => {
  const response = await apiClient.post<Transaction>('/transactions', data);
  return response.data;
};

export const updateTransaction = async (
  id: number,
  data: Partial<Transaction>
): Promise<Transaction> => {
  const response = await apiClient.put<Transaction>(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id: number): Promise<{ message: string; id: number }> => {
  const response = await apiClient.delete<{ message: string; id: number }>(`/transactions/${id}`);
  return response.data;
};

export const getTransactionSummary = async (): Promise<TransactionSummaryData> => {
  const response = await apiClient.get<TransactionSummaryData>('/transactions/summary');
  return response.data;
};

export const seedTransactions = async (): Promise<Transaction[]> => {
  const response = await apiClient.post<Transaction[]>('/transactions/seed');
  return response.data;
};

// Analytics APIs
export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface MonthlyComparisonItem {
  category: string;
  current_month: number;
  previous_month: number;
  difference: number;
  percentage_change: number;
  trend: 'increased' | 'decreased' | 'neutral';
}

export interface CashflowTrendItem {
  month: string;
  year: number;
  income: number;
  expenses: number;
  savings: number;
}

export const getCategoryBreakdown = async (): Promise<{
  total_expense: number;
  categories: CategoryBreakdownItem[];
}> => {
  const response = await apiClient.get('/analytics/category-breakdown');
  return response.data;
};

export const getMonthlyComparison = async (): Promise<{
  current_month: string;
  previous_month: string;
  categories: MonthlyComparisonItem[];
}> => {
  const response = await apiClient.get('/analytics/monthly-comparison');
  return response.data;
};

export const getCashflowTrends = async (): Promise<CashflowTrendItem[]> => {
  const response = await apiClient.get<CashflowTrendItem[]>('/analytics/cashflow-trends');
  return response.data;
};

// Machine Learning APIs
export interface CategoryPrediction {
  description: string;
  predicted_category: string;
  confidence: number;
  model_version: string;
}

export const predictCategory = async (description: string): Promise<CategoryPrediction> => {
  const response = await apiClient.post<CategoryPrediction>('/ml/predict-category', {
    description,
  });
  return response.data;
};

export const correctCategory = async (data: {
  description: string;
  original_category: string;
  corrected_category: string;
}): Promise<any> => {
  const response = await apiClient.post('/ml/correct-category', data);
  return response.data;
};

export const getModelInfo = async (): Promise<any> => {
  const response = await apiClient.get('/ml/model-info');
  return response.data;
};

// ----------------------------------------------------
// Budget APIs
// ----------------------------------------------------

export interface BudgetStatusItem {
  id: number;
  category: string;
  monthly_limit: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  month: number;
  year: number;
  is_exceeded: boolean;
}

export interface BudgetStatusResponse {
  month: number;
  year: number;
  total_budget: number;
  total_spent: number;
  overall_percentage_used: number;
  is_overall_exceeded: boolean;
  budgets: BudgetStatusItem[];
}

export const getBudgetsStatus = async (
  month?: number,
  year?: number
): Promise<BudgetStatusResponse> => {
  const params: any = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const response = await apiClient.get<BudgetStatusResponse>('/budgets/status', { params });
  return response.data;
};

export const createOrUpdateBudget = async (data: {
  category: string;
  monthly_limit: number;
  month: number;
  year: number;
}): Promise<any> => {
  const response = await apiClient.post('/budgets/', data);
  return response.data;
};

export const updateBudgetLimit = async (id: number, monthly_limit: number): Promise<any> => {
  const response = await apiClient.put(`/budgets/${id}`, { monthly_limit });
  return response.data;
};

export const deleteBudget = async (id: number): Promise<any> => {
  const response = await apiClient.delete(`/budgets/${id}`);
  return response.data;
};

export const seedDefaultBudgets = async (month?: number, year?: number): Promise<any[]> => {
  const params: any = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const response = await apiClient.post<any[]>('/budgets/seed-defaults', {}, { params });
  return response.data;
};

// ----------------------------------------------------
// Anomaly Detection & Forecasting APIs
// ----------------------------------------------------

export interface AnomalyItem {
  transaction_id: number;
  description: string;
  amount: number;
  category: string;
  transaction_date: string;
  anomaly_reason: string;
  anomaly_score: number;
  review_status: string;
}

export interface ForecastItem {
  category: string;
  predicted_amount: number;
  historical_avg: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ForecastResponse {
  forecast_month: string;
  total_predicted_expense: number;
  current_budget: number;
  budget_variance: number;
  is_budget_exceeded: boolean;
  categories: ForecastItem[];
  disclaimer: string;
}

export const getAnomalies = async (): Promise<AnomalyItem[]> => {
  const response = await apiClient.get<AnomalyItem[]>('/ml/anomalies');
  return response.data;
};

export const triggerAnomalyScan = async (): Promise<{
  message: string;
  anomalies_detected: number;
  anomalies: AnomalyItem[];
}> => {
  const response = await apiClient.post('/ml/anomalies/detect');
  return response.data;
};

export const reviewAnomaly = async (
  transaction_id: number,
  status_choice: string = 'confirmed_ok'
): Promise<any> => {
  const response = await apiClient.post(
    `/ml/anomalies/${transaction_id}/review?status_choice=${status_choice}`
  );
  return response.data;
};

export const getExpenseForecast = async (): Promise<ForecastResponse> => {
  const response = await apiClient.get<ForecastResponse>('/ml/forecast');
  return response.data;
};

// ----------------------------------------------------
// AI Finance Assistant APIs
// ----------------------------------------------------

export interface ChatMessage {
  id?: number;
  message: string;
  response: string;
  intent?: string;
  created_at?: string;
}

export const sendChatMessage = async (message: string): Promise<ChatMessage> => {
  const response = await apiClient.post<ChatMessage>('/assistant/chat', { message });
  return response.data;
};

export const getChatHistory = async (): Promise<ChatMessage[]> => {
  const response = await apiClient.get<ChatMessage[]>('/assistant/history');
  return response.data;
};

export const clearChatHistory = async (): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>('/assistant/history');
  return response.data;
};

// ----------------------------------------------------
// Reports & CSV Import/Export APIs
// ----------------------------------------------------

export interface CSVImportResult {
  message: string;
  total_rows_evaluated: number;
  imported_count: number;
  duplicates_skipped: number;
  errors_count: number;
  errors: string[];
}

export const downloadSampleCSV = async (): Promise<void> => {
  const response = await apiClient.get('/reports/sample-csv', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'finwise_sample_transactions.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportTransactionsCSV = async (): Promise<void> => {
  const response = await apiClient.get('/reports/export-csv', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'finwise_transactions.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const importTransactionsCSV = async (file: File): Promise<CSVImportResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<CSVImportResult>('/reports/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
