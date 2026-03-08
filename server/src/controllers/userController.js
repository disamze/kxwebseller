import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const syncUser = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOneAndUpdate(
    { email },
    { $setOnInsert: { email, name, role: 'user' } },
    { new: true, upsert: true }
  );
  res.json(user);
});

export const getUnlockedMaterials = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('purchasedProducts');

  const unlocked = user.purchasedProducts.map((p) => ({
    id: p._id,
    title: p.title,
    thumbnail: p.thumbnail,
    type: p.type,
    telegramLink: p.telegramLink
  }));

  res.json(unlocked);
});

export const getAnalytics = asyncHandler(async (_req, res) => {
  const [users, orders, products] = await Promise.all([
    User.countDocuments(),
    Order.find(),
    Product.find().sort({ createdAt: -1 }).limit(5)
  ]);

  const revenue = orders
    .filter((o) => o.status === 'Approved')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  res.json({
    totalUsers: users,
    totalOrders: orders.length,
    revenue,
    topProducts: products
  });
});
