import { Router } from 'express';
import employeeRoutes from './employee.routes';
import managerRoutes from './manager.routes';
import shiftRoutes from './shift.routes';
import scheduleRoutes from './schedule.routes';
import autoScheduleRoutes from './auto-schedule.routes';
import managerSettingsRoutes from './manager-settings.routes';

const router = Router();

// Employee authentication routes
// Mounted at: /api/employee
router.use('/employee', employeeRoutes);

// Manager employee CRUD routes
// Mounted at: /api/manager
router.use('/manager', managerRoutes);

// Shift preferences routes
// Mounted at: /api/shifts
router.use('/shifts', shiftRoutes);

// AI schedule generation routes
// Mounted at: /api/schedules
router.use('/schedules', scheduleRoutes);

// Auto-schedule routes (cron job management)
// Mounted at: /api/auto-schedule
router.use('/auto-schedule', autoScheduleRoutes);

// Manager settings routes
// Mounted at: /api/manager-settings
router.use('/manager-settings', managerSettingsRoutes);

export default router;
