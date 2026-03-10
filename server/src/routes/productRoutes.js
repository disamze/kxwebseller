import { Router } from 'express';
import multer from 'multer';
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from '../controllers/productController.js';
import { uploadsDir } from '../config/uploads.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();
const upload = multer({ dest: uploadsDir });

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, upload.single('thumbnail'), createProduct);
router.patch('/:id', protect, adminOnly, upload.single('thumbnail'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
