import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { PlatformSetting } from '../models/PlatformSetting.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const SETTINGS_KEY = 'global';

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

  const unlocked = (user?.purchasedProducts || []).map((p) => ({
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
  const [totalUsers, totalOrders, approvedOrders] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
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
    totalUsers,
    totalOrders,
    approvedOrders: approvedOrders.length,
    revenue,
    topProducts
  });
});


export const getAdminUsers = asyncHandler(async (_req, res) => {
  const users = await User.find()
    .select('name email role createdAt purchasedProducts')
    .sort({ createdAt: -1 })
    .lean();

  const formatted = users.map((u) => ({
    _id: u._id,
    name: u.name || 'Unnamed user',
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    purchasedCount: Array.isArray(u.purchasedProducts) ? u.purchasedProducts.length : 0
  }));

  res.json(formatted);
});

export const getAdminSettings = asyncHandler(async (_req, res) => {
  const settings = await PlatformSetting.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $setOnInsert: { key: SETTINGS_KEY, allowNewSignups: true, maintenanceMode: false } },
    { new: true, upsert: true }
  );

  res.json({
    allowNewSignups: settings.allowNewSignups,
    maintenanceMode: settings.maintenanceMode,
    updatedAt: settings.updatedAt
  });
});

export const updateAdminSettings = asyncHandler(async (req, res) => {
  const payload = {
    allowNewSignups: Boolean(req.body.allowNewSignups),
    maintenanceMode: Boolean(req.body.maintenanceMode)
  };

  const settings = await PlatformSetting.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: payload, $setOnInsert: { key: SETTINGS_KEY } },
    { new: true, upsert: true }
  );

  res.json({
    allowNewSignups: settings.allowNewSignups,
    maintenanceMode: settings.maintenanceMode,
    updatedAt: settings.updatedAt
  });
});
