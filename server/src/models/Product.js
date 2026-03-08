import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    type: { type: String, enum: ['course', 'ebook', 'test'], required: true },
    thumbnail: String,
    telegramLink: { type: String, required: true },
    previewVideoUrl: { type: String, default: '' },
    studentsCount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 }
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
