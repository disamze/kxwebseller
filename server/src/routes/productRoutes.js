import { Router } from 'express';
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from '../controllers/productController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, createProduct);
router.patch('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
