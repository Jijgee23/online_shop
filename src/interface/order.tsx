import { Product } from "./product";

// 1. Захиалгын төлөвүүд (Enum)
export enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}

// 2. Захиалгын нэгж бараа (OrderItem)
export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    price: number;
    quantity: number;
    updatedAt?: Date | string | null;
    deletedAt?: Date | string | null;

    // Relation: Product мэдээллийг хамт авах үед
    product?: Product;
}

// 3. Үндсэн захиалгын бүтэц (Order)
export interface Order {
    id: number;
    userId: number;
    status: OrderStatus;
    totalPrice: number;
    totalCount: number;
    addressId?: number | null;
    createdAt: Date | string;
    updatedAt?: Date | string | null;
    deletedAt?: Date | string | null;

    // Relations: include ашигласан үед орж ирнэ
    items?: OrderItem[];
    address?: any; // Шаардлагатай бол Address интерфэйс нэмж болно
    user?: any;
    payment?: any;
}

// 4. Оролтын төрлүүд (Input Types)
export type CreateOrderInput = {
    cartId: number;
    addressId?: number;
};

export type UpdateOrderStatusInput = {
    orderId: number;
    status: OrderStatus;
};

// 5. API Response бүтэц
export interface OrderResponse {
    success: boolean;
    orders?: Order[];
    order?: Order;
    message?: string;
}