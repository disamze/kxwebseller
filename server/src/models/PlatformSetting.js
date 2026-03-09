import mongoose from 'mongoose';

const platformSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    allowNewSignups: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);
