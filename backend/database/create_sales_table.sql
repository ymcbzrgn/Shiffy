-- Sales Report Table
-- Stores daily sales data entered manually by managers

CREATE TABLE IF NOT EXISTS sales_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  total_revenue DECIMAL(10, 2) NOT NULL CHECK (total_revenue >= 0),
  total_transactions INTEGER NOT NULL CHECK (total_transactions >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one report per manager per day
  UNIQUE(manager_id, report_date)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_sales_reports_manager_date 
  ON sales_reports(manager_id, report_date DESC);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_sales_reports_date 
  ON sales_reports(report_date DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_sales_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sales_reports_updated_at
  BEFORE UPDATE ON sales_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_reports_updated_at();

-- RLS Policies
ALTER TABLE sales_reports ENABLE ROW LEVEL SECURITY;

-- Managers can only see their own sales reports
CREATE POLICY sales_reports_select_policy ON sales_reports
  FOR SELECT
  USING (auth.uid() = manager_id);

-- Managers can insert their own sales reports  
CREATE POLICY sales_reports_insert_policy ON sales_reports
  FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

-- Managers can update their own sales reports
CREATE POLICY sales_reports_update_policy ON sales_reports
  FOR UPDATE
  USING (auth.uid() = manager_id)
  WITH CHECK (auth.uid() = manager_id);

-- Managers can delete their own sales reports
CREATE POLICY sales_reports_delete_policy ON sales_reports
  FOR DELETE
  USING (auth.uid() = manager_id);
