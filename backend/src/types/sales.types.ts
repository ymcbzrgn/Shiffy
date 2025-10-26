// Sales & Z-Report Types

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
