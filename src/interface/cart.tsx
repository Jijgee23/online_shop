import { Product, ProductImage } from "./product"; // Өмнөх файлуудаас import хийх


export interface Cart {
    id: number;
    userId: number | null;
    items: CartItem[];
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
    totalCount: number | 0,
    totalPrice: number | 0,
    quantity: number | 0,
}

export type CreateCartInput = Omit<Cart, 'id' | 'userId' | 'items' | 'updatedAt' | 'deletedAt' | 'totalCount' | 'totalPrice'>;

export interface CartItem {
    id: number;
    cartId: number;
    productId: number;
    quantity: number;
    deletedAt: Date | null;
    updatedAt: Date | null;
    createdAt: Date;
    totalCount: number;
    totalPrice: number;
    cart?: any
    product: Product;
}

export type CreateCartItemInput = Omit<Cart, 'id' | 'cartId' | 'productId' | 'quantity' | 'deletedAt' | 'updatedAt' | 'createdAt' | 'totalCount' | 'totalPrice'>;