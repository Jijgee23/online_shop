import toast from "react-hot-toast";

export interface CartAction {
    cartId: number | null;
    productId: number;
    productQty: number;
}

export const CartService = {
    async fetchCart(isAdmin: boolean) {
        if (isAdmin) return null;
        const res = await fetch("/api/cart");
        if (res.ok) return res.json();
    },
    async addItem(data: CartAction, fetchCart: () => Promise<void>) {
        const res = await fetch("/api/cart", {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        if (res.ok) {
            toast.success("Амжилттай сагсдагдлаа");
            await fetchCart();
            return;
        }
        const body = await res.json();
        toast.error(body.error ?? "Сагсанд нэмэхэд алдаа гарлаа");
    },
    async removeItem(itemId: number, fetchCart: () => Promise<void>) {
        const res = await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("Бараа сагнаас хасагдлаа");
            fetchCart();
        }
    },
    async updateItem(cartId: number | undefined, itemId: number, newQty: number, fetchCart: () => Promise<void>) {
        const res = await fetch("/api/cart/update", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartId, itemId, newQty }),
        });
        if (res.ok) {
            toast.success("Амжилттай");
            await fetchCart();
            return;
        }
        const data = await res.json();
        toast.error(data.error ?? "Амжилтгүй");
    },
    async clearCart(fetchCart: () => Promise<void>) {
        const res = await fetch("/api/cart/clear", { method: "POST" });
        if (res.ok) {
            toast.success("Сагс цэвэрлэгдлээ");
            await fetchCart();
        }
    },
};
