import mongoose from 'mongoose';
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

export const getMe = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user._id).select('name email role createdAt');
  res.json(me);
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Name is required');
  }

  const me = await User.findByIdAndUpdate(req.user._id, { name: name.trim() }, { new: true }).select('name email role createdAt');
  res.json(me);
});

export const getAnalytics = asyncHandler(async (_req, res) => {
  const [users, orders, approvedOrders] = await Promise.all([
    User.countDocuments(),
    Order.find(),
    Order.find({ status: 'Approved' })
  ]);

  const revenue = approvedOrders.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const topSelling = await Order.aggregate([
    { $match: { status: 'Approved' } },
    {
      $group: {
        _id: '$productId',
        purchases: { $sum: 1 },
        revenue: { $sum: { $ifNull: ['$amount', 0] } }
      }
    },
    { $sort: { purchases: -1 } },
    { $limit: 5 }
  ]);

  const ids = topSelling.map((row) => row._id).filter(Boolean);
  const products = await Product.find({ _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } }).select('title type');
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const topProducts = topSelling.map((row) => {
    const p = productMap.get(String(row._id));
    return {
      productId: row._id,
      title: p?.title || 'Unknown product',
      type: p?.type || 'unknown',
      purchases: row.purchases,
      revenue: row.revenue
    };
  });

  res.json({
    totalUsers: users,
    totalOrders: orders.length,
    approvedOrders: approvedOrders.length,
    revenue,
    topProducts
  });
});
