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
