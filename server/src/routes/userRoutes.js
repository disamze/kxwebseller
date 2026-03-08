import { Router } from 'express';
import {
  getAdminSettings,
  getAdminUsers,
  getAnalytics,
  getMe,
  getUnlockedMaterials,
  syncUser,
  updateAdminSettings,
  updateMe
} from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();

router.post('/sync', syncUser);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.get('/materials', protect, getUnlockedMaterials);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/admin-users', protect, adminOnly, getAdminUsers);
router.get('/admin-settings', protect, adminOnly, getAdminSettings);
router.patch('/admin-settings', protect, adminOnly, updateAdminSettings);

export default router;
