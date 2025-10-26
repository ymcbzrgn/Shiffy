// Sales Routes
// API endpoints for sales reports (manual entry by managers)

import { Router, type Request, type Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase.config';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/sales-reports
 * Create or update a daily sales report
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.manager_id || req.user?.user_id;
    const { report_date, total_revenue, total_transactions, notes } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    // Validate inputs
    if (!report_date || total_revenue === undefined || total_transactions === undefined) {
      res.status(400).json({ 
        success: false, 
        error: 'report_date, total_revenue, and total_transactions are required' 
      });
      return;
    }

    if (total_revenue < 0 || total_transactions < 0) {
      res.status(400).json({ 
        success: false, 
        error: 'total_revenue and total_transactions must be non-negative' 
      });
      return;
    }

    // Upsert (insert or update if exists)
    const { data, error } = await supabase
      .from('sales_reports')
      .upsert({
        manager_id: userId,
        report_date,
        total_revenue,
        total_transactions,
        notes: notes || null,
      }, {
        onConflict: 'manager_id,report_date',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving sales report:', error);
      res.status(500).json({ success: false, error: 'Failed to save sales report' });
      return;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in POST /api/sales:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/sales/daily/:date
 * Get sales report for a specific date
 */
router.get('/daily/:date', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.manager_id || req.user?.user_id;
    const { date } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('sales_reports')
      .select('*')
      .eq('manager_id', userId)
      .eq('report_date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching daily sales:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch sales report' });
      return;
    }

    res.json({ success: true, data: data || null });
  } catch (error) {
    console.error('Error in GET /api/sales/daily/:date:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/sales/weekly/:weekStart
 * Get sales reports for a week (7 days starting from weekStart)
 */
router.get('/weekly/:weekStart', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.manager_id || req.user?.user_id;
    const { weekStart } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    // Calculate week end (6 days after start)
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const { data, error } = await supabase
      .from('sales_reports')
      .select('*')
      .eq('manager_id', userId)
      .gte('report_date', weekStart)
      .lte('report_date', endDate.toISOString().split('T')[0])
      .order('report_date', { ascending: true });

    if (error) {
      console.error('Error fetching weekly sales:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch weekly sales' });
      return;
    }

    // Calculate weekly totals
    const totalRevenue = data.reduce((sum: number, report: any) => sum + parseFloat(report.total_revenue.toString()), 0);
    const totalTransactions = data.reduce((sum: number, report: any) => sum + report.total_transactions, 0);
    const avgDailyRevenue = data.length > 0 ? totalRevenue / 7 : 0; // Always divide by 7 days

    res.json({ 
      success: true, 
      data: {
        week_start: weekStart,
        daily_reports: data,
        total_revenue: totalRevenue,
        total_transactions: totalTransactions,
        average_daily_revenue: avgDailyRevenue,
        days_with_data: data.length,
      }
    });
  } catch (error) {
    console.error('Error in GET /api/sales/weekly/:weekStart:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/sales/:id
 * Delete a sales report
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.manager_id || req.user?.user_id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { error } = await supabase
      .from('sales_reports')
      .delete()
      .eq('id', id)
      .eq('manager_id', userId);

    if (error) {
      console.error('Error deleting sales report:', error);
      res.status(500).json({ success: false, error: 'Failed to delete sales report' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/sales/:id:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
