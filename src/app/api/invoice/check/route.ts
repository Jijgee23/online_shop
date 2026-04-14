import { prisma } from "@/lib/prisma";
import { QPayService } from "@/services/qpay.service";
import { OrderService, OrderError } from "@/services/order.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { invoiceId } = await req.json();
    if (!invoiceId) {
        return NextResponse.json({ error: "invoiceId шаардлагатай" }, { status: 400 });
    }
    try {
        const result = await QPayService.checkPayment(invoiceId);
        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: 502 });
        }
        if (!result.paid) {
            return NextResponse.json({ paid: false }, { status: 200 });
        }

        // Paid — find the invoice record
        const invoice = await prisma.invoice.findUnique({ where: { invoiceId } });

        // If callback already created the order, return its number
        if (invoice?.orderId) {
            const order = await prisma.order.findUnique({
                where: { id: invoice.orderId },
                select: { orderNumber: true },
            });
            return NextResponse.json({ paid: true, orderNumber: order?.orderNumber }, { status: 200 });
        }

        // Paid but order not yet created (callback missed/failed) — create it now as fallback
        if (invoice?.cartId) {
            const order = await OrderService.createOrder({
                cartId: invoice.cartId,
                addressId: invoice.addressId ?? null,
                paymentMethod: "QPAY",
                paymentConfirmed: true,
            });
            await prisma.invoice.update({ where: { id: invoice.id }, data: { orderId: order.id } });
            return NextResponse.json({ paid: true, orderNumber: order.orderNumber }, { status: 200 });
        }

        return NextResponse.json({ paid: true }, { status: 200 });
    } catch (e: any) {
        if (e instanceof OrderError) {
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
