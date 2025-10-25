import { Router } from 'express';
import employeeRoutes from './employee.routes';
import managerRoutes from './manager.routes';
import shiftRoutes from './shift.routes';

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

export default router;
