import { asyncHandler } from '../middleware/asyncHandler.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { PlatformSetting } from '../models/PlatformSetting.js';

const validStatuses = new Set(['Pending', 'Approved', 'Rejected']);

function generateCode(prefix = 'KX') {
  const seed = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${seed}`;
}

function normalizeCode(value = '') {
  return String(value || '').trim().toUpperCase();
}

async function ensurePersonalCoupon(user) {
  if (!user) return null;
  if (user.personalCouponCode && !user.personalCouponUsed) return user.personalCouponCode;

  for (let i = 0; i < 6; i += 1) {
    const code = generateCode('FRIEND');
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
  const { productId, transactionId, couponCode, referralCode } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('productId is required');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('paymentScreenshot is required');
  }

  const [user, settings, product] = await Promise.all([
    User.findById(req.user._id),
    getSettings(),
    Product.findById(productId).select('price')
  ]);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const originalAmount = Number(product.price || 0);

  let couponDiscount = 0;
  const code = normalizeCode(couponCode);
  if (code && originalAmount > 0) {
    const coupon = (settings.coupons || []).find((c) => c.active && normalizeCode(c.code) === code);

    if (coupon) {
      couponDiscount = Math.floor((originalAmount * Number(coupon.percent || 0)) / 100);
    } else if (
      user?.personalCouponCode &&
      code === normalizeCode(user.personalCouponCode) &&
      !user.personalCouponUsed
    ) {
      couponDiscount = Math.min(200, originalAmount);
    }
  }

  const postCouponAmount = Math.max(0, originalAmount - couponDiscount);

  let referralWalletDiscount = 0;
  if (settings.referralEnabled && originalAmount >= Number(settings.referralMinPurchase || 900)) {
    const available = Number(user?.referralBalance || 0);
    referralWalletDiscount = Math.min(available, Number(settings.referralDiscountAmount || 200), postCouponAmount);
  }

  const normalizedReferralCode = normalizeCode(referralCode);
  let referralCodeDiscount = 0;
  if (normalizedReferralCode) {
    if (!settings.referralEnabled) {
      res.status(400);
      throw new Error('Referral offers are currently disabled');
    }
    if (originalAmount < Number(settings.referralMinPurchase || 900)) {
      res.status(400);
      throw new Error(`Referral code is valid on purchases of ₹${Number(settings.referralMinPurchase || 900)} or above`);
    }

    const referrer = await User.findOne({ referralCode: normalizedReferralCode }).select('_id');
    if (!referrer) {
      res.status(400);
      throw new Error('Invalid referral code');
    }
    if (String(referrer._id) === String(req.user._id)) {
      res.status(400);
      throw new Error('You cannot use your own referral code');
    }

    const remainingAfterReferralWallet = Math.max(0, postCouponAmount - referralWalletDiscount);
    referralCodeDiscount = Math.min(Number(settings.referralDiscountAmount || 200), remainingAfterReferralWallet);
  }

  const totalReferralDiscount = referralWalletDiscount + referralCodeDiscount;
  const finalAmount = Math.max(0, postCouponAmount - totalReferralDiscount);

  const order = await Order.create({
    userId: req.user._id,
    productId,
    amount: originalAmount,
    transactionId,
    paymentScreenshot: `/uploads/${req.file.filename}`,
    status: 'Pending',
    couponCode: code,
    couponDiscount,
    referralDiscount: totalReferralDiscount,
    referralCodeUsed: normalizedReferralCode,
    referralCodeDiscount,
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
      const deduction = Math.max(0, Number(order.referralDiscount || 0) - Number(order.referralCodeDiscount || 0));
      if (deduction > 0) {
        await User.findByIdAndUpdate(order.userId, { $inc: { referralBalance: -Math.abs(deduction) } });
      }
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
