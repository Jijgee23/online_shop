import { ProductState, Review } from "@/generated/prisma";

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
    rewievs: Review[] | []
}

export interface ProductWithRelations extends Product {
  category: Category;
  images: ProductImage[];
//   reviews?: Review[];
  // Шаардлагатай бол бусад харилцааг нэмж болно
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