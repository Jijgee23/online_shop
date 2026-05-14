import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const PAYMENT_LABELS: Record<string, string> = {
    QPAY:        "QPay",
    CARD:        "Карт",
    BANK_APP:    "Банкны апп",
    ON_DELIVERY: "Хүргэлтэнд",
};

export async function GET(req: NextRequest) {
    try {
        const p = req.nextUrl.searchParams;
        const type     = p.get("type")   || "products";
        const dateFrom = p.get("dateFrom");
        const dateTo   = p.get("dateTo");
        const userId   = p.get("userId") ? Number(p.get("userId")) : undefined;

        if (!dateFrom || !dateTo)
            return NextResponse.json({ error: "Огноо заавал оруулна уу" }, { status: 400 });

        const from = new Date(dateFrom);
        const to   = new Date(dateTo + "T23:59:59.999Z");

        const orderWhere: any = {
            createdAt: { gte: from, lte: to },
            status: { not: OrderStatus.CANCELLED },
        };
        if (userId) orderWhere.userId = userId;

        // Shared summary
        const [totalOrders, revenueAgg] = await prisma.$transaction([
            prisma.order.count({ where: orderWhere }),
            prisma.order.aggregate({ where: orderWhere, _sum: { totalPrice: true } }),
        ]);
        const totalRevenue = Number(revenueAgg._sum.totalPrice ?? 0);

        let items: any[] = [];

        // ── By products ────────────────────────────────────────────────────────
        if (type === "products") {
            const rows = await prisma.orderItem.findMany({
                where: { order: orderWhere, deletedAt: null },
                select: {
                    productId: true,
                    price: true,
                    quantity: true,
                    orderId: true,
                    product: { select: { name: true, sku: true } },
                },
            });

            const map = new Map<number, { productId: number; name: string; sku: string | null; totalRevenue: number; totalQuantity: number; orderIds: Set<number> }>();
            for (const r of rows) {
                if (!map.has(r.productId)) {
                    map.set(r.productId, { productId: r.productId, name: r.product?.name ?? "—", sku: r.product?.sku ?? null, totalRevenue: 0, totalQuantity: 0, orderIds: new Set() });
                }
                const g = map.get(r.productId)!;
                g.totalRevenue  += Number(r.price) * r.quantity;
                g.totalQuantity += r.quantity;
                g.orderIds.add(r.orderId);
            }

            items = Array.from(map.values())
                .map(g => ({ productId: g.productId, name: g.name, sku: g.sku, totalRevenue: Math.round(g.totalRevenue), totalQuantity: g.totalQuantity, orderCount: g.orderIds.size }))
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .map((g, i) => ({ ...g, rank: i + 1 }));

        // ── By districts ───────────────────────────────────────────────────────
        } else if (type === "districts") {
            const orders = await prisma.order.findMany({
                where: orderWhere,
                select: {
                    id: true,
                    totalPrice: true,
                    address: { select: { district: { select: { id: true, name: true } } } },
                },
            });

            const map = new Map<string, { districtId: number | null; districtName: string; orderCount: number; totalRevenue: number }>();
            for (const o of orders) {
                const d   = o.address?.district;
                const key = d ? String(d.id) : "null";
                if (!map.has(key)) map.set(key, { districtId: d?.id ?? null, districtName: d?.name ?? "Тодорхойгүй", orderCount: 0, totalRevenue: 0 });
                const g = map.get(key)!;
                g.orderCount++;
                g.totalRevenue += Number(o.totalPrice);
            }

            items = Array.from(map.values())
                .map(g => ({ ...g, totalRevenue: Math.round(g.totalRevenue) }))
                .sort((a, b) => b.totalRevenue - a.totalRevenue);

        // ── By payment method ──────────────────────────────────────────────────
        } else if (type === "payment_method") {
            const payments = await prisma.payment.findMany({
                where: { order: orderWhere },
                select: { type: true, amount: true },
            });

            const map = new Map<string, { type: string; label: string; orderCount: number; totalAmount: number }>();
            for (const pmt of payments) {
                const key = String(pmt.type);
                if (!map.has(key)) map.set(key, { type: key, label: PAYMENT_LABELS[key] ?? key, orderCount: 0, totalAmount: 0 });
                const g = map.get(key)!;
                g.orderCount++;
                g.totalAmount += Number(pmt.amount);
            }

            items = Array.from(map.values())
                .map(g => ({ ...g, totalAmount: Math.round(g.totalAmount) }))
                .sort((a, b) => b.totalAmount - a.totalAmount);

        // ── By category ────────────────────────────────────────────────────────
        } else if (type === "category") {
            const rows = await prisma.orderItem.findMany({
                where: { order: orderWhere, deletedAt: null },
                select: {
                    productId: true,
                    price: true,
                    quantity: true,
                    product: { select: { category: { select: { id: true, name: true } } } },
                },
            });

            const map = new Map<number, { categoryId: number; name: string; totalRevenue: number; totalQuantity: number; productIds: Set<number> }>();
            for (const r of rows) {
                const cat = r.product?.category;
                const key = cat?.id ?? 0;
                if (!map.has(key)) map.set(key, { categoryId: key, name: cat?.name ?? "Тодорхойгүй", totalRevenue: 0, totalQuantity: 0, productIds: new Set() });
                const g = map.get(key)!;
                g.totalRevenue  += Number(r.price) * r.quantity;
                g.totalQuantity += r.quantity;
                g.productIds.add(r.productId);
            }

            items = Array.from(map.values())
                .map(g => ({ categoryId: g.categoryId, name: g.name, totalRevenue: Math.round(g.totalRevenue), totalQuantity: g.totalQuantity, productCount: g.productIds.size }))
                .sort((a, b) => b.totalRevenue - a.totalRevenue);
        }

        return NextResponse.json({
            meta: { dateFrom, dateTo, userId: userId ?? null, totalRevenue: Math.round(totalRevenue), totalOrders },
            type,
            items,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}
