import { Product } from '../models/Product.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

function normalizeProductPayload(body = {}) {
  const payload = {
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    price: Number(body.price),
    type: String(body.type || '').trim(),
    classLevel: String(body.classLevel || '').trim(),
    subject: String(body.subject || '').trim(),
    thumbnail: String(body.thumbnail || '').trim(),
    telegramLink: String(body.telegramLink || '').trim(),
    previewVideoUrl: String(body.previewVideoUrl || '').trim(),
    studentsCount: Number(body.studentsCount || 0),
    rating: Number(body.rating || 4.8)
  };

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    throw new Error('Price must be a valid non-negative number');
  }

  if (!payload.title || !payload.description || !payload.telegramLink) {
    throw new Error('Title, description and telegram link are required');
  }

  if (!['course', 'ebook', 'test'].includes(payload.type)) {
    throw new Error('Type must be course, ebook, or test');
  }

  if (!Number.isFinite(payload.studentsCount) || payload.studentsCount < 0) {
    payload.studentsCount = 0;
  }

  if (!Number.isFinite(payload.rating) || payload.rating <= 0 || payload.rating > 5) {
    payload.rating = 4.8;
  }

  return payload;
}

export const getProducts = asyncHandler(async (req, res) => {
  const { type, q, classLevel, subject, priceMin, priceMax, priceType } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (classLevel) filter.classLevel = { $regex: `^${String(classLevel).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
  if (subject) filter.subject = { $regex: `^${String(subject).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };

  if (priceType === 'free') filter.price = 0;
  if (priceType === 'paid') filter.price = { ...(filter.price || {}), $gt: 0 };

  if (priceMin || priceMax) {
    filter.price = {
      ...(typeof filter.price === 'object' ? filter.price : {}),
      ...(priceMin ? { $gte: Number(priceMin) } : {}),
      ...(priceMax ? { $lte: Number(priceMax) } : {})
    };
  }

  if (q) {
    const regex = new RegExp(String(q).trim(), 'i');
    filter.$or = [{ title: regex }, { description: regex }, { subject: regex }, { classLevel: regex }];
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

export const createProduct = asyncHandler(async (req, res) => {
  try {
    const payload = normalizeProductPayload({
      ...req.body,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : req.body.thumbnail
    });
    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'Invalid product payload');
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  try {
    const payload = normalizeProductPayload({
      ...product.toObject(),
      ...req.body,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : (req.body.thumbnail || product.thumbnail)
    });
    Object.assign(product, payload);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'Invalid product payload');
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();
  res.json({ message: 'Product deleted successfully' });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});
