import { asyncHandler } from '../middleware/asyncHandler.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { PlatformSetting } from '../models/PlatformSetting.js';

const validStatuses = new Set(['Pending', 'Approved', 'Rejected']);

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
    if (coupon) couponDiscount = Math.floor((originalAmount * Number(coupon.percent || 0)) / 100);
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
    await User.findByIdAndUpdate(order.userId, { $addToSet: { purchasedProducts: order.productId } });

    if (order.referralDiscount > 0) {
      await User.findByIdAndUpdate(order.userId, { $inc: { referralBalance: -Math.abs(order.referralDiscount) } });
    }

    const buyer = await User.findById(order.userId);
    if (buyer?.referredBy && !order.referralBonusGranted) {
      const approvedCount = await Order.countDocuments({ userId: buyer._id, status: 'Approved' });
      if (approvedCount <= 1) {
        const settings = await getSettings();
        if (settings.referralEnabled) {
          const bonus = Number(settings.referralDiscountAmount || 200);
          await User.findByIdAndUpdate(buyer.referredBy, { $inc: { referralBalance: bonus } });
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
