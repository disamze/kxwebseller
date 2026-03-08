import { Router } from 'express';
import { createProduct, getProductById, getProducts } from '../controllers/productController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, createProduct);

export default router;
