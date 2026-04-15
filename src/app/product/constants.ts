import { OrderStatus } from "@/generated/prisma";

export const PAGE_SIZE = 20;

// Customer-facing product page sort
export const SORT_OPTIONS = [
    { value: "newest",     label: "Шинэ эхэлж" },
    { value: "popular",    label: "Эрэлттэй" },
    { value: "price_asc",  label: "Хямд эхэлж" },
    { value: "price_desc", label: "Үнэтэй эхэлж" },
];

// Admin product list sort
export const ADMIN_PRODUCT_SORT_OPTIONS = [
    { value: "newest",     label: "Шинэ эхэлж" },
    { value: "oldest",     label: "Хуучин эхэлж" },
    { value: "price_asc",  label: "Үнэ: Бага → Их" },
    { value: "price_desc", label: "Үнэ: Их → Бага" },
    { value: "stock_asc",  label: "Нөөц: Бага → Их" },
    { value: "stock_desc", label: "Нөөц: Их → Бага" },
];

// Admin product stock filter
export const STOCK_OPTIONS = [
    { value: "all",       label: "Бүгд" },
    { value: "in_stock",  label: "Нөөцтэй" },
    { value: "low_stock", label: "Бага нөөц (≤5)" },
    { value: "out",       label: "Дууссан" },
];

// Admin order sort
export const ORDER_SORT_OPTIONS = [
    { value: "newest",     label: "Шинэ эхэлж" },
    { value: "oldest",     label: "Хуучин эхэлж" },
    { value: "total_desc", label: "Дүн: Их → Бага" },
    { value: "total_asc",  label: "Дүн: Бага → Их" },
];

// Admin order status filter
export const ORDER_STATUS_OPTIONS = [
    { value: "all",                    label: "Бүгд" },
    { value: OrderStatus.PENDING,      label: "Хүлээгдэж буй" },
    { value: OrderStatus.PAID,         label: "Баталгаажсан" },
    { value: OrderStatus.SHIPPED,      label: "Хүргэлтэнд гарсан" },
    { value: OrderStatus.DELIVERED,    label: "Хүргэгдсэн" },
    { value: OrderStatus.CANCELLED,    label: "Цуцлагдсан" },
];
