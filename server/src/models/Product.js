import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    type: { type: String, enum: ['course', 'ebook', 'test'], required: true },
    thumbnail: String,
    telegramLink: { type: String, required: true }
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
