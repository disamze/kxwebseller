import { Router } from 'express';
import multer from 'multer';
import { uploadsDir } from '../config/uploads.js';
import { createOrder, getAllOrders, getMyOrders, reviewOrder } from '../controllers/orderController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const upload = multer({ dest: uploadsDir });
const router = Router();

router.post('/', protect, upload.single('paymentScreenshot'), createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.patch('/:id/review', protect, adminOnly, reviewOrder);

export default router;
