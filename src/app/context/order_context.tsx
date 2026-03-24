
'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useCart } from "./cart_context";
import { useRouter } from "next/navigation";
import { Address, Order } from "@/interface/order";
import { useAuth } from "./auth_context";
import { useConfirm } from "./confirm_context";
import { useAddress } from "./address_context";
import toast from "react-hot-toast";
import { AddressInput } from "./address_context";
import { add } from "date-fns/fp";

interface OrderContextType {
    orders: Order[],
    create: () => Promise<void>,
    fetchOrder: () => Promise<void>,
    toOrders: () => void,
    fetchMyAddress: () => Promise<void>,
    address: Address | null
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);


export const OrderProvider = ({ children }: { children: ReactNode }) => {

    const [orders, setOrders] = useState<Order[]>([])
    const { cart, fetchCart } = useCart()
    const { isAdmin, user } = useAuth()
    const router = useRouter()
    const { confirm } = useConfirm();
    const { getDeliveryAddress } = useAddress();
    const [address, setAddress] = useState<Address | null>(null)
    const fetchMyAddress = async () => {
        try {
            const res = await fetch("api/address", { method: 'GET' })
            const data = await res.json()
            if (res.ok) {
                setAddress(data.address)
                return
            }
            setAddress(null)
        } catch {
            setAddress(null)
        }
    }
    const create = async () => {
        let addressData = {} as any
        if (!address) {
            const deliveryData = await getDeliveryAddress();
            if (!deliveryData) return
            addressData = deliveryData
        } else {
            addressData = {
                id: address.id,
                city: address.city,
                district: address.district,
                khoroo: address.khoroo,
                detail: address.detail,
                phone: address.phone,
                userId: address.userId
            }
        }
        // const deliveryData = await getDeliveryAddress();

        const isOk = await confirm("Та захиалга үүсгэхдээ итгэлтэй байна уу?", "Захиалга баталгаажуулах");
        if (!isOk) return;
        const loadingToast = toast.loading('Захиалга үүсгэж байна...');
        const cartId = cart?.id
        const res = await fetch("api/order", {
            method: "POST",
            headers: {
                "Content-Type": 'application-json',
            },
            body: JSON.stringify({ cartId: cartId, address: addressData }),
        })

        if (res.ok) {
            toast.success('Захиалга амжилттай бүртгэгдлээ! 🎉', { id: loadingToast });
            await fetchCart()
            return;
        }

        const data = await res.json();
        const message = data.message ?? 'Захиалга үүсэхэд алдаа гарлаа'
        toast.error(message, { id: loadingToast });

    }

    const toOrders = () => {
        router.push('/order')
    }


    const fetchOrder = async () => {
        try {
            const url = isAdmin ? "/api/admin/order" : "/api/order";
            const res = await fetch(url, { method: "GET" });

            // 1. json-ийг ганцхан удаа уншиж хувьсагчид хадгална
            const data = await res.json();

            if (res.ok) {
                setOrders(data.orders || []);
            } else {
                // 2. Хэрэв алдаа гарвал өмнө хадгалсан data-аас мессежийг авна
                const message = data.message || data.error || 'Захиалга татахад алдаа гарлаа';
                alert(message);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };


    const value: OrderContextType = {
        orders,
        create,
        fetchOrder,
        toOrders,
        fetchMyAddress,
        address
    }

    useEffect(() => {

        if (user) { // Зөвхөн хэрэглэгч байгаа үед датаг татна
            fetchOrder();
            fetchMyAddress()
        }
    }, [user])
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