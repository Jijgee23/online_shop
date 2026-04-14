import { OrderStatus, PaymentType, UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { sendPushToUsers } from "@/lib/firebase/sendPush";

export class OrderError extends Error {
    constructor(message: string, public status: number, public extra?: Record<string, any>) {
        super(message);
    }
}

const METHOD_KEYS: Record<string, string> = {
    QPAY: "payQpay",
    ON_DELIVERY: "payOnDelivery",
};

export const OrderService = {
    async getOrders(where: any, page: number, pageSize: number) {
        const [orders, total] = await prisma.$transaction([
            prisma.order.findMany({
                where,
                include: { items: { include: { product: { include: { images: true } } } }, address: true, payment: true },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.order.count({ where }),
        ]);
        return { orders, total };
    },

    async createOrder(params: {
        cartId: number;
        addressId?: number | null;
        paymentMethod?: string | null;
        note?: string | null;
        paymentConfirmed?: boolean;
    }) {
        const { cartId, addressId, paymentMethod, note, paymentConfirmed } = params;

        // 1. Validate payment method is enabled
        if (paymentMethod) {
            const settingsKey = METHOD_KEYS[paymentMethod];
            if (settingsKey) {
                const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
                if (settings && (settings as any)[settingsKey] === false) {
                    throw new OrderError("Энэ төлбөрийн арга идэвхгүй байна", 400);
                }
            }
        }

        // 2. Load cart
        const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: { items: { include: { product: true } } },
        });
        if (!cart) throw new OrderError("Сагсны мэдээлэл олдсонгүй!", 404);
        if (cart.items.length === 0 || cart.totalCount === 0 || cart.totalPrice.toNumber() === 0) {
            throw new OrderError("Сагс хоосон байна!", 400);
        }

        // 3. Stock check
        const stockUnavailableIds = cart.items
            .filter(item => item.quantity > item.product.stock)
            .map(item => item.id);

        if (stockUnavailableIds.length > 0) {
            throw new OrderError("Зарим бараа хүрэлцэхгүй байна!", 400, { stockUnavailableIds });
        }
        // 4. Transaction: create order + items + update stock + payment + clear cart
        const isPaid = paymentConfirmed === true;
        const order = await prisma.$transaction(async (tx) => {
            if (addressId) {
                const address = await tx.address.findUnique({ where: { id: addressId, userId: cart.userId } });
                if (!address) throw new OrderError("Хаягын мэдээлэл олдсонгүй!", 400);
            }
            const created = await tx.order.create({
                data: {
                    userId: cart.userId,
                    totalPrice: cart.totalPrice,
                    totalCount: cart.totalCount,
                    note: note ?? "",
                    addressId: addressId ?? null,
                    orderNumber: `PENDING-${Date.now()}`,
                    status: isPaid ? OrderStatus.PAID : OrderStatus.PENDING,
                },
            });

            const orderNumber = `AAA${String(created.id).padStart(6, "0")}`;
            const updated = await tx.order.update({
                where: { id: created.id },
                data: { orderNumber },
            });

            await tx.orderItem.createMany({
                data: cart.items.map(item => ({
                    orderId: created.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price as any,
                })),
            });

            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            if (paymentMethod) {
                await tx.payment.create({
                    data: {
                        orderId: created.id,
                        method: paymentMethod,
                        amount: cart.totalPrice,
                        status: isPaid ? "PAID" : "PENDING",
                        type: paymentMethod as PaymentType,
                    },
                });
            }

            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            await tx.cart.update({ where: { id: cart.id }, data: { totalCount: 0, totalPrice: 0 } });

            return updated;
        });

        // 5. Notify admins
        const admins = await prisma.user.findMany({
            where: { role: UserRole.ADMIN, deletedAt: null },
            select: { id: true },
        });

        if (admins.length > 0) {
            const pushTitle = "Шинэ захиалга ирлээ";
            const pushBody = `${order.orderNumber} — ₮${Number(cart.totalPrice).toLocaleString()} (${cart.totalCount} бараа)`;

            await prisma.notification.createMany({
                data: admins.map(a => ({
                    userId: a.id,
                    type: "ORDER" as const,
                    title: pushTitle,
                    body: pushBody,
                    data: { orderId: order.id, orderNumber: order.orderNumber },
                })),
            });

            sendPushToUsers(admins.map(a => a.id), {
                title: pushTitle,
                body: pushBody,
                data: { orderId: String(order.id), orderNumber: order.orderNumber, link: "/admin" },
            }).catch(console.error);
        }

        return order;
    },
}