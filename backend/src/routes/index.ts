import { Router } from 'express';
import employeeRoutes from './employee.routes';
import managerRoutes from './manager.routes';

const router = Router();

// Employee authentication routes
// Mounted at: /api/employee
router.use('/employee', employeeRoutes);

// Manager employee CRUD routes
// Mounted at: /api/manager
router.use('/manager', managerRoutes);

// Placeholder for future routes
// Will add shift.routes in future phases

export default router;
