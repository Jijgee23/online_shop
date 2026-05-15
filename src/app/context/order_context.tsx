
'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useCart } from "./cart_context";
import { useRouter } from "next/navigation";
import { Order } from "@/interface/order";
import { useAuth } from "./auth_context";
import { useAddress } from "./address_context";
import toast from "react-hot-toast";

export interface CreateOrderParams {
    addressId?: number | null;
    paymentMethod: string;
    note?: string;
    paymentConfirmed?: boolean;
}

interface OrderContextType {
    orders: Order[];
    total: number;
    page: number;
    setPage: (page: number) => void;
    pageSize: number;
    createOrder: (params: CreateOrderParams) => Promise<boolean>;
    fetchOrder: () => Promise<void>;
    toOrders: () => void;
    fetchAddress: () => Promise<void>;
    updateOrderStatus: (id: number, status: string, note?: string) => Promise<boolean>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {

    const [orders, setOrders]   = useState<Order[]>([]);
    const [total, setTotal]     = useState(0);
    const [page, setPage]       = useState(1);
    const pageSize              = 10;

    const { cart, fetchCart }   = useCart();
    const { isAdmin, user }     = useAuth();
    const router                = useRouter();
    const { fetchAddress }      = useAddress();

    const createOrder = async ({ addressId, paymentMethod, note, paymentConfirmed }: CreateOrderParams): Promise<boolean> => {
        const t = toast.loading('Захиалга үүсгэж байна...');
        try {
            const res = await fetch("/api/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartId: cart?.id, addressId: addressId ?? null, paymentMethod, note, paymentConfirmed: paymentConfirmed ?? false }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Захиалга амжилттай бүртгэгдлээ!', { id: t });
                await fetchCart();
                return true;
            }
            console.log("Create order error:", data);
            toast.error(data.message ?? 'Захиалга үүсэхэд алдаа гарлаа', { id: t });
            return false;
        } catch {
            toast.error('Алдаа гарлаа', { id: t });
            return false;
        }
    };

    const toOrders = () => router.push('/order');

    const fetchOrder = async () => {
        try {
            const url = isAdmin
                ? `/api/admin/order?page=${page}&pageSize=${pageSize}`
                : `/api/order?page=${page}&pageSize=${pageSize}`;
            const res  = await fetch(url, { method: "GET" });
            const data = await res.json();
            if (res.ok) {
                setOrders(data.orders || []);
                setTotal(data.total  ?? 0);
            } else {
                toast.error(data.message || data.error || 'Захиалга татахад алдаа гарлаа');
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const updateOrderStatus = async (id: number, status: string, note?: string): Promise<boolean> => {
        try {
            const body: any = { status };
            if (note !== undefined) body.note = note;
            const res = await fetch(`/api/admin/order/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) { await fetchOrder(); return true; }
            return false;
        } catch {
            return false;
        }
    };

    // Re-fetch when page changes
    useEffect(() => {
        if (user) fetchOrder();
    }, [user, page]);

    const value: OrderContextType = {
        orders,
        total,
        page,
        setPage,
        pageSize,
        createOrder,
        fetchOrder,
        toOrders,
        fetchAddress,
        updateOrderStatus,
    };

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within OrderProvider');
    }
    return context;
};
