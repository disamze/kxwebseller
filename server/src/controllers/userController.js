import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { PlatformSetting } from '../models/PlatformSetting.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const SETTINGS_KEY = 'global';

function normalizeCode(value = '') {
  return String(value).trim().toUpperCase();
}

function buildReferralCode(email = '') {
  const local = (email.split('@')[0] || 'KX').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'KX';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${local}${suffix}`;
}

async function ensureReferralCode(user) {
  if (user.referralCode) return user.referralCode;
  let attempts = 0;
  while (attempts < 5) {
    attempts += 1;
    const code = buildReferralCode(user.email);
    const exists = await User.findOne({ referralCode: code }).lean();
    if (!exists) {
      user.referralCode = code;
      await user.save();
      return code;
    }
  }
  user.referralCode = `${buildReferralCode(user.email)}${Date.now().toString().slice(-2)}`;
  await user.save();
  return user.referralCode;
}

async function getOrCreateGlobalSettings() {
  return PlatformSetting.findOneAndUpdate(
    { key: SETTINGS_KEY },
    {
      $setOnInsert: {
        key: SETTINGS_KEY,
        allowNewSignups: true,
        maintenanceMode: false,
        offerEnabled: false,
        offerText: '',
        offerEndsAt: null,
        coupons: [],
        referralEnabled: true,
        referralDiscountAmount: 200,
        referralMinPurchase: 900
      }
    },
    { new: true, upsert: true }
  );
}

export const syncUser = asyncHandler(async (req, res) => {
  const { email, name, referredByCode } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOneAndUpdate(
    { email },
    { $setOnInsert: { email, name, role: 'user' } },
    { new: true, upsert: true }
  );

  if (name && name.trim() && !user.name) {
    user.name = name.trim();
  }

  if (referredByCode && !user.referredBy) {
    const ref = await User.findOne({ referralCode: normalizeCode(referredByCode) });
    if (ref && String(ref._id) !== String(user._id)) {
      user.referredBy = ref._id;
    }
  }

  await ensureReferralCode(user);
  await user.save();

  res.json(user);
});

export const getUnlockedMaterials = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('purchasedProducts');

  const unlocked = (user?.purchasedProducts || []).map((p) => ({
    id: p._id,
    title: p.title,
    thumbnail: p.thumbnail,
    type: p.type,
    telegramLink: p.telegramLink,
    classLevel: p.classLevel,
    subject: p.subject
  }));

  res.json(unlocked);
});

export const getMe = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user._id).select('name email role createdAt referralCode referralBalance personalCouponCode personalCouponUsed');
  if (me && !me.referralCode) {
    await ensureReferralCode(me);
  }
  res.json(me);
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Name is required');
  }

  const me = await User.findByIdAndUpdate(req.user._id, { name: name.trim() }, { new: true }).select('name email role createdAt referralCode referralBalance personalCouponCode personalCouponUsed');
  if (me && !me.referralCode) {
    await ensureReferralCode(me);
  }
  res.json(me);
});

export const getAnalytics = asyncHandler(async (_req, res) => {
  const [totalUsers, totalOrders, approvedOrders] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Order.find({ status: 'Approved' })
  ]);

  const revenue = approvedOrders.reduce((acc, curr) => acc + (curr.finalAmount || curr.amount || 0), 0);

  const topSelling = await Order.aggregate([
    { $match: { status: 'Approved' } },
    {
      $group: {
        _id: '$productId',
        purchases: { $sum: 1 },
        revenue: { $sum: { $ifNull: ['$finalAmount', '$amount'] } }
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
    .select('name email role createdAt purchasedProducts referralCode referralBalance')
    .sort({ createdAt: -1 })
    .lean();

  const formatted = users.map((u) => ({
    _id: u._id,
    name: u.name || 'Unnamed user',
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    purchasedCount: Array.isArray(u.purchasedProducts) ? u.purchasedProducts.length : 0,
    referralCode: u.referralCode || '',
    referralBalance: Number(u.referralBalance || 0)
  }));

  res.json(formatted);
});

export const getAdminSettings = asyncHandler(async (_req, res) => {
  const settings = await getOrCreateGlobalSettings();
  res.json(settings);
});

export const getPublicSettings = asyncHandler(async (_req, res) => {
  const settings = await getOrCreateGlobalSettings();
  res.json({
    offerEnabled: settings.offerEnabled,
    offerText: settings.offerText,
    offerEndsAt: settings.offerEndsAt,
    coupons: (settings.coupons || []).filter((c) => c.active).map((c) => ({ code: c.code, percent: c.percent })),
    referralEnabled: settings.referralEnabled,
    referralDiscountAmount: settings.referralDiscountAmount,
    referralMinPurchase: settings.referralMinPurchase
  });
});

export const updateAdminSettings = asyncHandler(async (req, res) => {
  const payload = {
    allowNewSignups: Boolean(req.body.allowNewSignups),
    maintenanceMode: Boolean(req.body.maintenanceMode),
    offerEnabled: Boolean(req.body.offerEnabled),
    offerText: String(req.body.offerText || '').trim(),
    offerEndsAt: req.body.offerEndsAt ? new Date(req.body.offerEndsAt) : null,
    referralEnabled: Boolean(req.body.referralEnabled),
    referralDiscountAmount: Math.max(0, Number(req.body.referralDiscountAmount || 0)),
    referralMinPurchase: Math.max(0, Number(req.body.referralMinPurchase || 0)),
    coupons: Array.isArray(req.body.coupons)
      ? req.body.coupons
          .map((c) => ({ code: normalizeCode(c.code), percent: Number(c.percent || 0), active: c.active !== false }))
          .filter((c) => c.code && c.percent > 0 && c.percent <= 90)
      : []
  };

  const settings = await PlatformSetting.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: payload, $setOnInsert: { key: SETTINGS_KEY } },
    { new: true, upsert: true }
  );

  res.json(settings);
});
