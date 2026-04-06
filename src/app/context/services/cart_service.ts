import toast from "react-hot-toast";
import { CartAction } from "../cart_context";

export const CartService = {
    async fetchCart(isAdmin: boolean) {
        const res = await fetch("/api/cart");
        if (res.ok) {
            const data = await res.json()
            return data;
        }
    },
    async addItem(data: CartAction, fetchCart: () => Promise<void>) {
        const res = await fetch("/api/cart", {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        if (res.ok) {
            toast.success("Амжилттай сагсдагдлаа")
            await fetchCart();
            return;
        }

        const body = await res.json()

        toast.error(body.error)
    },
    async removeItem(itemId: Number, fetchCart: () => Promise<void>) {
        const res = await fetch(`/api/cart?itemId=${itemId}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            toast.success('Бараа сагнаас хасагдлаа')
            fetchCart();
        }
    },
    async updateItem(cartId: Number | undefined, itemId: Number, newQty: number, fetchCart: () => Promise<void>) {
        const res = await fetch("/api/cart/update", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartId, itemId, newQty }),
        });

        if (res.ok) {
            toast.success('Амжилттай')
            await fetchCart();
        }

        const data = await res.json()

        if (!res.ok)
            toast.error(data.error ?? 'Амжилтгүй')
    },
    async clearCart(fetchCart: () => Promise<void>) {
        const res = await fetch("/api/cart/clear", {
            method: "POST",
        });

        if (res.ok) {
            toast.success('Сагс цэвэрлэгдлээ')
            await fetchCart()
        }
    }
}