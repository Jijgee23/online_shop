import { ProductState } from "@/generated/prisma";

export interface ProductReview {
  id: number;
  rating: number;
  comment: string | null;
  userId: number;
  productId: number;
  createdAt: Date;
  user: { id: number; name: string };
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number;
  category: Category | null
  slug: string;
  isPublished: boolean;
  discountPrice: number | null;
  sku: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  state: ProductState
  images: ProductImage[]
  reviews: ProductReview[]
  sizes: ProductSize[]
  productSizes: ProductSize[]
  colors: ProductColor[]
  features: ProductFeature[],
  featured: boolean
}


export interface ProductImage {
  id: number;
  url: string;
  productId: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductFeature {
  id: number,
  title: string,
  description: string,
}


export interface ProductColor {
  id: number
  hex: string
  name: string
}

export interface ProductSize {
  id: number
  sizeName: string
  value: string
}
