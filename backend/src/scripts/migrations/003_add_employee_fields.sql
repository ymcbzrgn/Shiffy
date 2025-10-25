-- ============================================================================
-- Migration 003: Add job_description and max_weekly_hours to employees table
-- ============================================================================
-- Version: 1.0.0
-- Created: 2025-10-25
-- Description: Adds optional fields for employee job roles and weekly hour limits
-- ============================================================================

-- Add job_description column
ALTER TABLE employees
ADD COLUMN job_description VARCHAR(255);

-- Add max_weekly_hours column with validation
ALTER TABLE employees
ADD COLUMN max_weekly_hours INTEGER CHECK (max_weekly_hours >= 0 AND max_weekly_hours <= 150);

-- Add column comments for documentation
COMMENT ON COLUMN employees.job_description IS 'Comma-separated job roles (e.g., "Cashier, Server"). Used by AI scheduler to understand employee capabilities.';
COMMENT ON COLUMN employees.max_weekly_hours IS 'Maximum hours per week (soft limit for AI scheduler). 0 = on leave, NULL = no limit. Range: 0-150.';

-- ============================================================================
-- MIGRATION COMPLETED
-- ============================================================================
-- Columns added: 2
-- - job_description (VARCHAR 255, nullable)
-- - max_weekly_hours (INTEGER 0-150, nullable)
-- ============================================================================
