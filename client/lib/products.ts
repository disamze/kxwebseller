import { API_URL } from './api';
import { products as mockProducts } from './mock-data';

export type ProductType = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  type: 'course' | 'ebook' | 'test';
  classLevel?: string;
  subject?: string;
  thumbnail: string;
  telegramLink?: string;
};

export async function getProducts(query = ''): Promise<ProductType[]> {
  try {
    const res = await fetch(`${API_URL}/products${query ? `?${query}` : ''}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data;
  } catch {
    return mockProducts as ProductType[];
  }
}

export async function getProductById(id: string): Promise<ProductType | null> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch product');
    return await res.json();
  } catch {
    return (mockProducts as ProductType[]).find((p) => p.id === id) || null;
  }
}
