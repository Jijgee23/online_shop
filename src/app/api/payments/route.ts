import { prisma } from "@/lib/prisma";
import { sendPushToUsers } from "@/lib/firebase/sendPush";
import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import { OrderError } from "@/services/order.service";

// ─── GET /api/payments — QPay callback (called by QPay merchant after payment) ──
// URL: /api/payments?cart_id=X&addressId=Y&qpay_payment_id=Z
// QPay calling this endpoint IS proof of payment — no need to re-verify via their API,
// which often lags behind the callback and causes paid:false timing failures.

export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams;
    const cartId = Number(params.get("cart_id"));
    const qpay_payment_id = params.get("qpay_payment_id");

    console.log("QPay callback — cartId:", cartId, "payment_id:", qpay_payment_id);

    if (!cartId || !qpay_payment_id) {
        return NextResponse.json({ error: "cart_id болон qpay_payment_id шаардлагатай" }, { status: 400 });
    }

    try {
        // 1. Look up the Invoice record by cartId to get stored addressId
        const invoice = await prisma.invoice.findFirst({
            where: { cartId },
            orderBy: { createdAt: "desc" },
        });
        if (!invoice) {
            console.error("QPay callback: no invoice found for cartId", cartId);
            return NextResponse.json({ error: "Invoice олдсонгүй" }, { status: 404 });
        }

        // 2. Idempotency — skip if already processed
        if (invoice.orderId) {
            console.log("QPay callback: order already created for cartId", cartId);
            return NextResponse.json({ success: true, message: "Аль хэдийн баталгаажсан" });
        }

        // 3. Create order from cart (QPay calling this endpoint is proof of payment)
        const order = await OrderService.createOrder({
            cartId,
            addressId: invoice.addressId ?? null,
            paymentMethod: "QPAY",
            paymentConfirmed: true,
        });

        // 4. Update invoice record with orderId
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: { orderId: order.id },
        });

        // 5. Notify the user via FCM push
        const cart = await prisma.cart.findUnique({ where: { id: cartId }, select: { userId: true } });
        if (cart?.userId) {
            sendPushToUsers([cart.userId], {
                title: "Захиалга амжилттай!",
                body: `${order.orderNumber} захиалга баталгаажлаа`,
                data: {
                    type: "qpay_paid",
                    orderNumber: order.orderNumber,
                    orderId: String(order.id),
                    link: "/order",
                },
            }).catch(console.error);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        if (e instanceof OrderError) {
            console.error("QPay callback OrderError:", e.message);
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        console.error("QPay callback error:", e);
        return NextResponse.json({ error: "Callback боловсруулахад алдаа гарлаа" }, { status: 500 });
    }
}
