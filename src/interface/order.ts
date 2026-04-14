import { Payment, User } from "@/generated/prisma";
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
    orderNumber: String;
    userId: number;
    status: OrderStatus;
    totalPrice: number;
    totalCount: number;
    addressId?: number | null;
    createdAt: Date | string;
    updatedAt?: Date | string | null;
    deletedAt?: Date | string | null;
    note: String | null;
    // Relations: include ашигласан үед орж ирнэ
    items?: OrderItem[];
    address?: Address; // Шаардлагатай бол Address интерфэйс нэмж болно
    user?: User;
    payment?: Payment;
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


export interface District {
    id: number;
    name: string;
    deliverable: boolean;
    createdAt: Date | string;
}

export interface Address {
    id: number;
    city: string;
    khoroo: string;
    detail: string;
    phone: string;
    userId: number;
    isMain: boolean;
    latitude: number;
    longitude: number;
    districtId: number;
    district?: District;
    user?: User;
    orders?: Order[];
}