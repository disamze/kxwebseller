import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    amount: Number,
    transactionId: String,
    paymentScreenshot: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    couponCode: { type: String, default: '' },
    couponDiscount: { type: Number, default: 0 },
    referralDiscount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
    referralBonusGranted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
