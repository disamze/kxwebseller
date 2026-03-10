import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    purchasedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralBalance: { type: Number, default: 0 },
    personalCouponCode: { type: String, unique: true, sparse: true },
    personalCouponUsed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
