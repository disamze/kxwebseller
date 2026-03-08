import { Router } from 'express';
import { getAnalytics, getMe, getUnlockedMaterials, syncUser, updateMe } from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();

router.post('/sync', syncUser);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.get('/materials', protect, getUnlockedMaterials);
router.get('/analytics', protect, adminOnly, getAnalytics);

export default router;
