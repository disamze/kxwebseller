import { asyncHandler } from '../middleware/asyncHandler.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { PlatformSetting } from '../models/PlatformSetting.js';

const validStatuses = new Set(['Pending', 'Approved', 'Rejected']);

function makePersonalCouponCode(email = '') {
  const local = (email.split('@')[0] || 'KX').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'KX';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SELF${local}${suffix}`;
}

async function ensurePersonalCoupon(user) {
  if (user.personalCouponCode) return user.personalCouponCode;
  let attempts = 0;
  while (attempts < 6) {
    attempts += 1;
    const code = makePersonalCouponCode(user.email);
    const exists = await User.findOne({ personalCouponCode: code }).lean();
    if (!exists) {
      user.personalCouponCode = code;
      user.personalCouponUsed = false;
      await user.save();
      return code;
    }
  }
  return null;
}

async function getSettings() {
  return PlatformSetting.findOneAndUpdate(
    { key: 'global' },
    {
      $setOnInsert: {
        key: 'global',
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

export const createOrder = asyncHandler(async (req, res) => {
  const { productId, amount, transactionId, couponCode } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('productId is required');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('paymentScreenshot is required');
  }

  const user = await User.findById(req.user._id);
  const settings = await getSettings();
  const originalAmount = Number(amount || 0);

  let couponDiscount = 0;
  const code = String(couponCode || '').trim().toUpperCase();
  if (code && originalAmount > 0) {
    const coupon = (settings.coupons || []).find((c) => c.active && String(c.code).toUpperCase() === code);

    if (coupon) {
      couponDiscount = Math.floor((originalAmount * Number(coupon.percent || 0)) / 100);
    } else if (
      user?.personalCouponCode &&
      code === String(user.personalCouponCode).toUpperCase() &&
      !user.personalCouponUsed
    ) {
      couponDiscount = Math.min(200, originalAmount);
    }
  }

  let referralDiscount = 0;
  if (settings.referralEnabled && originalAmount >= Number(settings.referralMinPurchase || 900)) {
    const available = Number(user?.referralBalance || 0);
    referralDiscount = Math.min(available, Number(settings.referralDiscountAmount || 200));
  }

  const finalAmount = Math.max(0, originalAmount - couponDiscount - referralDiscount);

  const order = await Order.create({
    userId: req.user._id,
    productId,
    amount: originalAmount,
    transactionId,
    paymentScreenshot: `/uploads/${req.file.filename}`,
    status: 'Pending',
    couponCode: code,
    couponDiscount,
    referralDiscount,
    finalAmount
  });

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).populate('productId');
  res.json(orders);
});

export const reviewOrder = asyncHandler(async (req, res) => {
  const nextStatus = req.body.status;
  if (!validStatuses.has(nextStatus)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const prevStatus = order.status;
  order.status = nextStatus;
  await order.save();

  if (order.status === 'Approved' && prevStatus !== 'Approved') {
    const buyer = await User.findById(order.userId);
    await User.findByIdAndUpdate(order.userId, { $addToSet: { purchasedProducts: order.productId } });

    if (order.referralDiscount > 0) {
      await User.findByIdAndUpdate(order.userId, { $inc: { referralBalance: -Math.abs(order.referralDiscount) } });
    }

    if (buyer?.personalCouponCode && order.couponCode && order.couponCode.toUpperCase() === buyer.personalCouponCode.toUpperCase()) {
      buyer.personalCouponUsed = true;
      await buyer.save();
    }

    if (buyer?.referredBy && !order.referralBonusGranted) {
      const approvedCount = await Order.countDocuments({ userId: buyer._id, status: 'Approved' });
      if (approvedCount <= 1) {
        const settings = await getSettings();
        if (settings.referralEnabled) {
          const bonus = Number(settings.referralDiscountAmount || 200);
          await User.findByIdAndUpdate(buyer.referredBy, { $inc: { referralBalance: bonus } });
          await ensurePersonalCoupon(buyer);
          order.referralBonusGranted = true;
          await order.save();
        }
      }
    }
  }

  res.json(order);
});

export const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find()
    .populate('userId', 'name email')
    .populate('productId', 'title telegramLink type thumbnail')
    .sort({ createdAt: -1 });

  res.json(orders);
});
