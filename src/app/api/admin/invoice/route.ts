import { prisma } from "@/lib/prisma";
import { QPayService } from "@/services/qpay.service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ─── GET /api/admin/invoice?invoiceId=xxx — QPay-аас нэхэмжлэхийн дэлгэрэнгүй ─
// ─── GET /api/admin/invoice?page=1&... — жагсаалт ────────────────────────────

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const invoiceId = searchParams.get("invoiceId");

    // ── Single invoice detail ──────────────────────────────────────────────────
    if (invoiceId) {
        try {
            // 1. Get token
            const tokenResult = await QPayService.getAccessToken() as any;
            if (tokenResult.error) {
                return NextResponse.json({ error: tokenResult.error }, { status: 500 });
            }

            // 2. Fetch full invoice from QPay: GET /invoice/{invoice_id}
            const qpayRes = await fetch(
                `${process.env.QPAY_MERCHANT_URL}invoice/${invoiceId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${tokenResult.accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!qpayRes.ok) {
                const err = await qpayRes.text();
                return NextResponse.json({ error: `QPay алдаа: ${err}` }, { status: qpayRes.status });
            }

            const qpayData = await qpayRes.json();

            // 3. Also get our DB record for extra context (orderId, cartId etc.)
            const dbInvoice = await prisma.invoice.findUnique({ where: { invoiceId } });
            let order = null;
            if (dbInvoice?.orderId) {
                order = await prisma.order.findUnique({
                    where: { id: dbInvoice.orderId },
                    select: { orderNumber: true, totalPrice: true, user: { select: { name: true, email: true } } },
                });
            }

            return NextResponse.json({
                qpay: qpayData,
                db: dbInvoice ? { ...dbInvoice, order } : null,
            });
        } catch (e) {
            return NextResponse.json({ error: String(e) }, { status: 500 });
        }
    }

    // ── List invoices ──────────────────────────────────────────────────────────
    const page     = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? 20));
    const search   = searchParams.get("search") ?? "";
    const hasOrder = searchParams.get("hasOrder") ?? "";

    try {
        const where: any = {};
        if (hasOrder === "yes") where.orderId = { not: null };
        if (hasOrder === "no")  where.orderId = null;
        if (search) {
            where.OR = [
                { invoiceId: { contains: search, mode: "insensitive" } },
                { senderInvoiceNo: { contains: search, mode: "insensitive" } },
            ];
        }

        const [invoices, total] = await prisma.$transaction([
            prisma.invoice.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.invoice.count({ where }),
        ]);

        const orderIds = invoices.map(i => i.orderId).filter(Boolean) as number[];
        const orders = orderIds.length
            ? await prisma.order.findMany({
                where: { id: { in: orderIds } },
                select: { id: true, orderNumber: true, user: { select: { name: true } } },
            })
            : [];
        const orderMap = Object.fromEntries(orders.map(o => [o.id, o]));

        const result = invoices.map(inv => ({
            ...inv,
            order: inv.orderId ? orderMap[inv.orderId] ?? null : null,
        }));

        return NextResponse.json({ data: result, total }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
