-- ============================================================================
-- Shiffy Database Schema - Initial Migration
-- ============================================================================
-- Version: 1.0.0
-- Created: 2025-10-25
-- Description: Creates all tables, indexes, and RLS policies for Shiffy MVP
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: managers
-- ============================================================================
-- Purpose: Store manager profiles (linked to Supabase Auth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS managers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  store_name VARCHAR(255) NOT NULL,
  deadline_day INTEGER NOT NULL DEFAULT 5 CHECK (deadline_day >= 1 AND deadline_day <= 7),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for managers
CREATE INDEX IF NOT EXISTS idx_managers_email ON managers(email);

-- ============================================================================
-- TABLE: employees
-- ============================================================================
-- Purpose: Store employee accounts (created by managers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_login BOOLEAN DEFAULT TRUE,
  manager_notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Indexes for employees
CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- ============================================================================
-- TABLE: shift_preferences
-- ============================================================================
-- Purpose: Store employee shift availability requests
-- ============================================================================

CREATE TABLE IF NOT EXISTS shift_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  slots JSONB NOT NULL,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_employee_week UNIQUE(employee_id, week_start)
);

-- Indexes for shift_preferences
CREATE INDEX IF NOT EXISTS idx_preferences_employee ON shift_preferences(employee_id);
CREATE INDEX IF NOT EXISTS idx_preferences_week ON shift_preferences(week_start);
CREATE INDEX IF NOT EXISTS idx_preferences_submitted ON shift_preferences(submitted_at);

-- ============================================================================
-- TABLE: schedules
-- ============================================================================
-- Purpose: Store AI-generated and approved shift schedules
-- ============================================================================

CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'approved')),
  shifts JSONB NOT NULL,
  ai_metadata JSONB,
  generated_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_manager_week UNIQUE(manager_id, week_start)
);

-- Indexes for schedules
CREATE INDEX IF NOT EXISTS idx_schedules_manager ON schedules(manager_id);
CREATE INDEX IF NOT EXISTS idx_schedules_week ON schedules(week_start);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);

-- ============================================================================
-- TABLE: audit_logs (Optional for MVP, but included for future)
-- ============================================================================
-- Purpose: Track all modifications for compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('manager', 'employee')),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================

-- Enable RLS
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: managers
-- ============================================================================
-- Managers can only read/update their own profile
-- ============================================================================

CREATE POLICY IF NOT EXISTS manager_own_profile ON managers
  FOR ALL
  USING (auth.uid() = id);

-- ============================================================================
-- RLS POLICIES: employees
-- ============================================================================
-- Managers can only access their own employees
-- ============================================================================

CREATE POLICY IF NOT EXISTS manager_own_employees ON employees
  FOR ALL
  USING (manager_id IN (
    SELECT id FROM managers WHERE id = auth.uid()
  ));

-- Employees can read their own profile (for employee auth via backend JWT)
-- Note: This uses backend JWT, so we'll implement this via service key
-- For now, only managers can access via Supabase Auth

-- ============================================================================
-- RLS POLICIES: shift_preferences
-- ============================================================================
-- Managers can read preferences of their employees
-- Employees can manage their own preferences (via backend)
-- ============================================================================

CREATE POLICY IF NOT EXISTS manager_read_employee_preferences ON shift_preferences
  FOR SELECT
  USING (employee_id IN (
    SELECT id FROM employees WHERE manager_id = auth.uid()
  ));

-- ============================================================================
-- RLS POLICIES: schedules
-- ============================================================================
-- Managers can only access their own schedules
-- Employees can read schedules from their manager (via backend)
-- ============================================================================

CREATE POLICY IF NOT EXISTS manager_own_schedules ON schedules
  FOR ALL
  USING (manager_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: audit_logs
-- ============================================================================
-- Only service role can access audit logs (admin only)
-- ============================================================================

CREATE POLICY IF NOT EXISTS admin_only_audit_logs ON audit_logs
  FOR ALL
  USING (false); -- No direct access, only via service key

-- ============================================================================
-- FUNCTIONS: Updated timestamp trigger
-- ============================================================================
-- Automatically update updated_at column on UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_managers_updated_at'
  ) THEN
    CREATE TRIGGER update_managers_updated_at
      BEFORE UPDATE ON managers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_employees_updated_at'
  ) THEN
    CREATE TRIGGER update_employees_updated_at
      BEFORE UPDATE ON employees
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_preferences_updated_at
      BEFORE UPDATE ON shift_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_schedules_updated_at'
  ) THEN
    CREATE TRIGGER update_schedules_updated_at
      BEFORE UPDATE ON schedules
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- ============================================================================
-- MIGRATION COMPLETED
-- ============================================================================
-- Tables created: 5
-- Indexes created: 13
-- RLS policies created: 5
-- Triggers created: 4
-- ============================================================================
