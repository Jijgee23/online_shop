import { Product } from "./product"; // Өмнөх файлуудаас import хийх


export interface Cart {
    id: number;
    userId: number;
    items: CartItem[];
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
    totalCount: number | 0,
    totalPrice: number | 0,
    quantity: number | 0,
}

export type CreateCartInput = Omit<Cart, 'id' | 'userId' | 'items' | 'updatedAt' | 'deletedAt' | 'totalCount' | 'totalPrice'>;

export interface CartItemStock {
    id: string;
    price: number | null;
    discountPrice: number | null;
    stock: number;
    color: { id: number; name: string; hex: string } | null;
    size: { id: number; sizeName: string; value: string } | null;
}

export interface CartItemVariant {
    id: string;
    price: number | null;
    discountPrice: number | null;
    stock: number;
    values?: {
        attributeValueId?: number;
        attributeValue?: { value: string; hex: string | null; attributeId?: number } | null;
    }[];
}

export interface CartItem {
    id: number;
    cartId: number;
    productId: number;
    productStockId: string | null;
    productVariantId: string | null;
    quantity: number;
    deletedAt: Date | null;
    updatedAt: Date | null;
    createdAt: Date;
    cart?: any;
    product: Product;
    productStock?: CartItemStock | null;
    productVariant?: CartItemVariant | null;
}

export type CreateCartItemInput = Omit<Cart, 'id' | 'cartId' | 'productId' | 'quantity' | 'deletedAt' | 'updatedAt' | 'createdAt'>;