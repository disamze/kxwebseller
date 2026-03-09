import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    percent: { type: Number, required: true, min: 0, max: 90 },
    active: { type: Boolean, default: true }
  },
  { _id: false }
);

const platformSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    allowNewSignups: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    offerEnabled: { type: Boolean, default: false },
    offerText: { type: String, default: '' },
    coupons: { type: [couponSchema], default: [] },
    referralEnabled: { type: Boolean, default: true },
    referralDiscountAmount: { type: Number, default: 200 },
    referralMinPurchase: { type: Number, default: 900 }
  },
  { timestamps: true }
);

export const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);
