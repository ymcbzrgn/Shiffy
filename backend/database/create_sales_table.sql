-- ============================================================================
-- Sales Report Table
-- ============================================================================
-- Purpose: Stores daily sales data entered manually by managers
-- Note: Using Service Role Key (RLS bypassed), security handled in backend
-- ============================================================================

CREATE TABLE IF NOT EXISTS sales_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  total_revenue DECIMAL(10, 2) NOT NULL CHECK (total_revenue >= 0),
  total_transactions INTEGER NOT NULL CHECK (total_transactions >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one report per manager per day
  CONSTRAINT unique_manager_report_date UNIQUE(manager_id, report_date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for manager + date queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_sales_reports_manager_date
  ON sales_reports(manager_id, report_date DESC);

-- Index for date range queries (weekly reports)
CREATE INDEX IF NOT EXISTS idx_sales_reports_date
  ON sales_reports(report_date DESC);

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================
-- Uses existing update_updated_at_column() function from schema
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_sales_reports_updated_at'
  ) THEN
    CREATE TRIGGER update_sales_reports_updated_at
      BEFORE UPDATE ON sales_reports
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- ============================================================================
-- NOTE: No RLS policies needed
-- Backend uses Service Role Key which bypasses RLS
-- Security is enforced in backend routes via .eq('manager_id', userId)
-- ============================================================================
