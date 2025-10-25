import { Router } from 'express';
import employeeRoutes from './employee.routes';

const router = Router();

// Employee authentication routes
// Mounted at: /api/employee
router.use('/employee', employeeRoutes);

// Placeholder for future routes
// Will add manager.routes, shift.routes in future phases

export default router;
