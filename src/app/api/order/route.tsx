import { OrderStatus, PaymentType, UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from "../auth/jwt/jwt_controller";
import { sendPushToUsers } from "@/lib/firebase/sendPush";
export async function POST(req: NextRequest) {

    const { cartId, addressId, paymentMethod, note, paymentConfirmed } = await req.json()

    try {

        // Validate payment method is enabled in settings
        if (paymentMethod) {
            const METHOD_KEYS: Record<string, string> = {
                QPAY: "payQpay", BANK_APP: "payBankApp", CARD: "payCard", ON_DELIVERY: "payOnDelivery",
            };
            const settingsKey = METHOD_KEYS[paymentMethod];
            if (settingsKey) {
                const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
                if (settings && (settings as any)[settingsKey] === false) {
                    return NextResponse.json({ message: "Энэ төлбөрийн арга идэвхгүй байна" }, { status: 400 });
                }
            }
        }

        const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: true } } } })

        if (!cart) return NextResponse.json({ message: 'Сагсы мэдээлэл олдсонгүй!' }, { status: 404 });

        if (cart.items.length === 0 || cart.totalCount === 0 || cart.totalPrice.toNumber() === 0) {
            return NextResponse.json({ message: 'Сагс хоосон байна!' }, { status: 400 });
        }


        const stockUnavailableIds: number[] = [];

        for (const item of cart.items) {
            if (item.quantity > item.product.stock) {
                stockUnavailableIds.push(item.id);
            }
        }

        if (stockUnavailableIds.length > 0) {
            return NextResponse.json(
                {
                    message: 'Зарим бараа хүрэлцэхгүй байна!',
                    stockUnavailableIds
                },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {

            // Validate address only when provided
            if (addressId) {
                const address = await tx.address.findUnique({ where: { id: addressId, userId: cart.userId } });
                if (!address) throw new Error("Хаягын мэдээлэл олдсонгүй!");
            }

            const isPaid = paymentConfirmed === true;
            const data = {
                userId: cart.userId,
                totalPrice: cart.totalPrice,
                totalCount: cart.totalCount,
                note: note ?? '',
                addressId: addressId ?? null,
                orderNumber: `PENDING-${Date.now()}`,
                status: isPaid ? OrderStatus.PAID : OrderStatus.PENDING,
            }
            const order = await tx.order.create({
                data: data,
            });

            const formattedId = `AAA${String(order.id).padStart(6, '0')}`;
            await tx.order.update({
                where: { id: order.id },
                data: { orderNumber: formattedId },
            });


            // 2. order items create
            await tx.orderItem.createMany({
                data: cart.items.map(item => ({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price as any
                }))
            });

            // 3. stock update
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            // 3b. create payment record
            if (paymentMethod) {
                await tx.payment.create({
                    data: {
                        orderId: order.id,
                        method: paymentMethod,
                        amount: cart.totalPrice,
                        status: isPaid ? "PAID" : "PENDING",
                        type: paymentMethod as PaymentType,
                    }
                });
            }

            // 4. clear cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            await tx.cart.update({
                where: { id: cart.id },
                data: {
                    totalCount: 0,
                    totalPrice: 0
                }
            });

            return order;
        });

        // Notify all admin users about the new order
        const admins = await prisma.user.findMany({
            where: { role: UserRole.ADMIN, deletedAt: null },
            select: { id: true },
        });
        if (admins.length > 0) {
            const pushTitle = "Шинэ захиалга ирлээ";
            const pushBody  = `${result.orderNumber} — ₮${Number(cart.totalPrice).toLocaleString()} (${cart.totalCount} бараа)`;

            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    type: "ORDER",
                    title: pushTitle,
                    body:  pushBody,
                    data: { orderId: result.id, orderNumber: result.orderNumber },
                })),
            });

            // Push to admin devices
            sendPushToUsers(admins.map(a => a.id), {
                title: pushTitle,
                body:  pushBody,
                data: { orderId: String(result.id), orderNumber: result.orderNumber, link: "/admin" },
            }).catch(console.error);
        }

        return NextResponse.json(
            { success: true, order: result },
            { status: 200 }
        );



    } catch (e) {


        console.log("creat order error" + e)
        return NextResponse.json(
            { message: 'Захиалга үүсэхэд алдаа гарлаа' },
            { status: 500 })
    }
}

export async function GET(_req: NextRequest) {

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
        return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
    if (!decoded) return NextResponse.json({ message: "Нэвтрээгүй байна!" }, { status: 403 })
    try {
        const p        = _req.nextUrl.searchParams;
        const page     = Math.max(1, Number(p.get("page")     || 1));
        const pageSize = Math.max(1, Number(p.get("pageSize") || 10));
        const userId   = Number(decoded.userId);

        const where = { userId };

        const [orders, total] = await prisma.$transaction([
            prisma.order.findMany({
                where,
                include: { items: { include: { product: { include: { images: true } } } }, address: true },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.order.count({ where }),
        ]);

        return NextResponse.json({ orders, total, page, pageSize, success: true }, { status: 200 })
    } catch (e) {
        return NextResponse.json(
            { message: 'Алдаа гарлаа', },
            { status: 500 });
    }
}