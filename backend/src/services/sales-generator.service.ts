// Sales Data Generator Service
// Generates dummy sales data for demonstration

import type { DailySalesData, CustomerPurchase } from '../types/sales.types';

const DUMMY_CUSTOMER_NAMES = [
  'Ahmet Yılmaz',
  'Ayşe Demir',
  'Mehmet Kaya',
  'Fatma Öz',
  'Can Arslan',
  'Zeynep Çelik',
  'Burak Şahin',
  'Elif Yıldız',
  'Murat Aydın',
  'Selin Koç',
  'Emre Güneş',
  'Deniz Aksoy',
];

/**
 * Generate random number between min and max
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 */
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random customer purchases
 */
function generateCustomerPurchases(count: number): CustomerPurchase[] {
  const purchases: CustomerPurchase[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Pick unique customer name
    let customerName: string;
    do {
      customerName = DUMMY_CUSTOMER_NAMES[randomBetween(0, DUMMY_CUSTOMER_NAMES.length - 1)];
    } while (usedNames.has(customerName) && usedNames.size < DUMMY_CUSTOMER_NAMES.length);
    
    usedNames.add(customerName);

    // Random purchase amount (50 TL - 500 TL)
    const purchaseAmount = parseFloat(randomFloat(50, 500).toFixed(2));

    // Random time (09:00 - 22:00)
    const hour = randomBetween(9, 22);
    const minute = randomBetween(0, 59);
    const transactionTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    purchases.push({
      customer_name: customerName,
      purchase_amount: purchaseAmount,
      transaction_time: transactionTime,
    });
  }

  // Sort by purchase amount descending
  return purchases.sort((a, b) => b.purchase_amount - a.purchase_amount);
}

/**
 * Generate daily sales data for a specific date
 * This simulates a Z-Report that would be generated at 23:59 each day
 */
export function generateDailySalesData(date: Date): DailySalesData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  const isToday = checkDate.getTime() === today.getTime();

  // If it's today, use more realistic current day values
  // Otherwise generate random data for other days
  let totalTransactions: number;
  let averageTransaction: number;

  if (isToday) {
    // Today's values - more realistic for current day
    totalTransactions = randomBetween(45, 65); // 45-65 işlem
    averageTransaction = parseFloat(randomFloat(120, 180).toFixed(2)); // 120-180 TL ortalama
  } else {
    // Other days - wider range
    totalTransactions = randomBetween(30, 90);
    averageTransaction = parseFloat(randomFloat(80, 220).toFixed(2));
  }

  // Random customer count (slightly less than transactions, some customers buy multiple times)
  const customerCount = randomBetween(Math.floor(totalTransactions * 0.7), totalTransactions);

  // Calculate total revenue
  const totalRevenue = parseFloat((totalTransactions * averageTransaction).toFixed(2));

  // Split between cash and card (30-70% cash)
  const cashPercentage = randomFloat(0.3, 0.7);
  const cashSales = parseFloat((totalRevenue * cashPercentage).toFixed(2));
  const cardSales = parseFloat((totalRevenue - cashSales).toFixed(2));

  // Generate top 5 customer purchases
  const topCustomers = generateCustomerPurchases(5);

  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

  return {
    date: dateStr,
    total_revenue: totalRevenue,
    total_transactions: totalTransactions,
    average_transaction: averageTransaction,
    cash_sales: cashSales,
    card_sales: cardSales,
    customer_count: customerCount,
    top_customers: topCustomers,
    created_at: new Date().toISOString(),
  };
}

/**
 * Generate sales data for a week (7 days)
 */
export function generateWeeklySalesData(weekStartDate: Date): DailySalesData[] {
  const dailyData: DailySalesData[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + i);
    dailyData.push(generateDailySalesData(date));
  }

  return dailyData;
}
