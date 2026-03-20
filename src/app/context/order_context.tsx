
'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useCart } from "./cart_context";
import { useRouter } from "next/navigation";
import { Order } from "@/interface/order";
interface OrderContextType {
    orders: Order[],
    create: () => Promise<void>,
    fetchOrder: () => Promise<void>,
    toOrders: () => void,
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);


export const OrderProvider = ({ children }: { children: ReactNode }) => {

    const [orders, setOrders] = useState<Order[]>([])
    const { cart, fetchCart } = useCart()
    const router = useRouter()
    const create = async () => {
        const cartId = cart?.id
        const res = await fetch("api/order", {
            method: "POST",
            headers: {
                "Content-Type": 'application-json',
            },
            body: JSON.stringify({ cartId }),
        })

        if (res.ok) {
            alert("Захиалга амжилттай үүслээ")
            await fetchCart()
            return;
        }

        const data = await res.json();
        const message = data.message ?? 'Захиалга үүсэхэд алдаа гарлаа'
        alert(message)

    }

    const toOrders = () => {
        router.push('/order')
    }


    const fetchOrder = async () => {
        const res = await fetch("api/order", {
            method: "GET"

        })
        if (res.ok) {
            const data = await res.json();
            setOrders(data.orders)
        }

        const data = await res.json();
        const message = data.message ?? 'Захиалга үүсэхэд алдаа гарлаа'
        alert(message)

    }


    const value: OrderContextType = {
        orders,
        create,
        fetchOrder,
        toOrders
    }

    useEffect(() => {
        fetchOrder()
    }, [])
    // return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}