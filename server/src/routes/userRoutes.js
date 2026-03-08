import { Router } from 'express';
import { getAnalytics, getUnlockedMaterials, syncUser } from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();

router.post('/sync', syncUser);
router.get('/materials', protect, getUnlockedMaterials);
router.get('/analytics', protect, adminOnly, getAnalytics);

export default router;
