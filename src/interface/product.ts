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
  barcode: string | null;
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
  hasVariants: boolean
  productStocks: ProductStock[]
  attributes?: ProductAttribute[]
  variants?: ProductVariant[]
}

export type AttributeType = "COLOR" | "SIZE" | "MATERIAL" | "DESIGN";

export interface ProductAttributeValue {
  id: number
  attributeId: number
  value: string
  hex: string | null
  imageUrl: string | null
}

export interface ProductAttribute {
  id: number
  productId: number
  type: AttributeType
  values: ProductAttributeValue[]
}

export interface ProductVariantValue {
  id: number
  variantId: string
  attributeValueId: number
  attributeValue?: ProductAttributeValue
}

export interface ProductVariant {
  id: string
  productId: number
  price: number | null
  discountPrice: number | null
  stock: number
  sku: string | null
  values: ProductVariantValue[]
}

export interface ProductStock {
  id: string
  productId: number
  productColorId: number | null
  productSizeId: number | null
  price: number | null
  discountPrice: number | null
  stock: number
  sku: string | null
}


export interface ProductImage {
  id: number;
  url: string;
  productId: number;
  // Зураг ↔ хувилбарын утга холбоос (өнгө/загвар/материал).
  // attributeValue.attributeId-г төрлөөр бүлэглэхэд ашиглана (сагсны зураг сонгоход).
  links?: { attributeValueId: number; attributeValue?: { attributeId: number } }[];
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
  imageUrl?: string | null
}

export interface ProductSize {
  id: number
  sizeName: string
  value: string
}
