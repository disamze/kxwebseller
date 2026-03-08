import cloudinary from '../config/cloudinary.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

const validStatuses = new Set(['Pending', 'Approved', 'Rejected']);

export const createOrder = asyncHandler(async (req, res) => {
  const screenshot = req.file
    ? await cloudinary.uploader.upload(req.file.path, { folder: 'edumarket/orders' })
    : null;

  const order = await Order.create({
    userId: req.user._id,
    productId: req.body.productId,
    amount: req.body.amount,
    paymentScreenshot: screenshot?.secure_url,
    status: 'Pending'
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

  order.status = nextStatus;
  await order.save();

  if (order.status === 'Approved') {
    await User.findByIdAndUpdate(order.userId, { $addToSet: { purchasedProducts: order.productId } });
  }

  res.json(order);
});

export const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().populate('userId', 'name email').populate('productId', 'title');
  res.json(orders);
});
