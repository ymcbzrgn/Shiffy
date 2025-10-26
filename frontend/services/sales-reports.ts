// Sales Reports Service
// API calls for manual sales reporting by managers

import { apiClient } from './api-client';

export interface SalesReport {
  id: string;
  manager_id: string;
  report_date: string; // YYYY-MM-DD
  total_revenue: number;
  total_transactions: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklySalesData {
  week_start: string;
  daily_reports: SalesReport[];
  total_revenue: number;
  total_transactions: number;
  average_daily_revenue: number;
  days_with_data: number;
}

/**
 * Create or update a daily sales report
 */
export async function saveSalesReport(
  reportDate: string,
  totalRevenue: number,
  totalTransactions: number,
  notes?: string
): Promise<SalesReport> {
  const response = await apiClient<SalesReport>(
    `/api/sales-reports`,
    {
      method: 'POST',
      body: JSON.stringify({
        report_date: reportDate,
        total_revenue: totalRevenue,
        total_transactions: totalTransactions,
        notes,
      }),
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to save sales report');
  }

  return response.data;
}

/**
 * Get sales report for a specific date
 */
export async function getDailySalesReport(date: string): Promise<SalesReport | null> {
  const response = await apiClient<SalesReport>(
    `/api/sales-reports/daily/${date}`,
    { method: 'GET' }
  );

  if (!response.success) {
    // 404 is okay, means no report yet
    return null;
  }

  return response.data || null;
}

/**
 * Get weekly sales reports
 */
export async function getWeeklySalesReports(weekStart: string): Promise<WeeklySalesData | null> {
  const response = await apiClient<WeeklySalesData>(
    `/api/sales-reports/weekly/${weekStart}`,
    { method: 'GET' }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch weekly sales reports');
  }

  return response.data || null;
}

/**
 * Delete a sales report
 */
export async function deleteSalesReport(reportId: string): Promise<void> {
  const response = await apiClient(
    `/api/sales-reports/${reportId}`,
    { method: 'DELETE' }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete sales report');
  }
}
