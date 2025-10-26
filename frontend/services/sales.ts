// Sales & Z-Report Service
// Fetches dummy sales data for demonstration

import { apiClient } from './api-client';

export interface DailySalesData {
  date: string; // YYYY-MM-DD
  total_revenue: number;
  total_transactions: number;
  average_transaction: number;
  cash_sales: number;
  card_sales: number;
  customer_count: number;
  top_customers?: CustomerPurchase[];
  created_at: string;
}

export interface CustomerPurchase {
  customer_name: string;
  purchase_amount: number;
  transaction_time: string;
}

export interface WeeklySalesReport {
  week_start: string; // YYYY-MM-DD
  total_revenue: number;
  total_transactions: number;
  average_daily_revenue: number;
  total_customers: number;
  daily_breakdown: DailySalesData[];
}

/**
 * Get daily sales data (Z-Report) for a specific date
 */
export async function getDailySales(date: string): Promise<DailySalesData | null> {
  const response = await apiClient<DailySalesData>(
    `/api/sales/daily/${date}`,
    { method: 'GET' }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch daily sales');
  }

  return response.data || null;
}

/**
 * Get weekly sales report for a specific week
 */
export async function getWeeklySales(weekStart: string): Promise<WeeklySalesReport | null> {
  const response = await apiClient<WeeklySalesReport>(
    `/api/sales/weekly/${weekStart}`,
    { method: 'GET' }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch weekly sales');
  }

  return response.data || null;
}
