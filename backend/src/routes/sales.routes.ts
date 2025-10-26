// Sales API Routes
// Provides dummy sales data for demonstration

import { Router } from 'express';
import type { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateDailySalesData, generateWeeklySalesData } from '../services/sales-generator.service';
import type { WeeklySalesReport } from '../types/sales.types';

const router = Router();

/**
 * GET /api/sales/daily/:date
 * Get daily sales data (Z-Report) for a specific date
 */
router.get('/daily/:date', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { date } = req.params; // YYYY-MM-DD

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // Generate dummy data
    const salesData = generateDailySalesData(dateObj);

    return res.json({
      success: true,
      data: salesData,
    });
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch daily sales data',
    });
  }
});

/**
 * GET /api/sales/weekly/:weekStart
 * Get weekly sales report for a specific week
 * Returns 7 days of data + weekly totals
 */
router.get('/weekly/:weekStart', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { weekStart } = req.params; // YYYY-MM-DD (Monday)

    // Validate date format
    const weekStartDate = new Date(weekStart);
    if (isNaN(weekStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // Generate weekly data (7 days)
    const dailyBreakdown = generateWeeklySalesData(weekStartDate);

    // Calculate weekly totals
    const totalRevenue = dailyBreakdown.reduce((sum, day) => sum + day.total_revenue, 0);
    const totalTransactions = dailyBreakdown.reduce((sum, day) => sum + day.total_transactions, 0);
    const totalCustomers = dailyBreakdown.reduce((sum, day) => sum + day.customer_count, 0);
    const averageDailyRevenue = totalRevenue / 7;

    const weeklyReport: WeeklySalesReport = {
      week_start: weekStart,
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      total_transactions: totalTransactions,
      average_daily_revenue: parseFloat(averageDailyRevenue.toFixed(2)),
      total_customers: totalCustomers,
      daily_breakdown: dailyBreakdown,
    };

    return res.json({
      success: true,
      data: weeklyReport,
    });
  } catch (error) {
    console.error('Error fetching weekly sales:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch weekly sales data',
    });
  }
});

export default router;
