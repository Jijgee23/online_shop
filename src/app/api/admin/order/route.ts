import { OrderStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const p = req.nextUrl.searchParams;
        const page     = Math.max(1, Number(p.get("page")     || 1));
        const pageSize = Math.max(1, Number(p.get("pageSize") || 20));
        const search   = p.get("search")   || "";
        const status   = p.get("status")   || "";
        const sort     = p.get("sort")     || "newest";
        const priceMin = p.get("priceMin") ? Number(p.get("priceMin")) : undefined;
        const priceMax = p.get("priceMax") ? Number(p.get("priceMax")) : undefined;
        const dateFrom = p.get("dateFrom") || "";
        const dateTo   = p.get("dateTo")   || "";

        const where: any = { deletedAt: null };

        if (status && status !== "all") {
            where.status = status as OrderStatus;
        }

        if (search.trim()) {
            where.OR = [
                { orderNumber: { contains: search, mode: "insensitive" } },
                { user: { name:  { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
            ];
        }

        if (priceMin !== undefined || priceMax !== undefined) {
            where.totalPrice = {
                ...(priceMin !== undefined ? { gte: priceMin } : {}),
                ...(priceMax !== undefined ? { lte: priceMax } : {}),
            };
        }

        if (dateFrom) where.createdAt = { ...(where.createdAt ?? {}), gte: new Date(dateFrom) };
        if (dateTo)   where.createdAt = { ...(where.createdAt ?? {}), lte: new Date(dateTo + "T23:59:59") };

        const ORDER_BY_MAP: Record<string, any> = {
            newest:     { createdAt: "desc" },
            oldest:     { createdAt: "asc"  },
            total_desc: { totalPrice: "desc" },
            total_asc:  { totalPrice: "asc"  },
        };

        const [orders, total] = await prisma.$transaction([
            prisma.order.findMany({
                where,
                include: { items: { include: { product: { include: { images: true } } } }, user: true },
                orderBy: ORDER_BY_MAP[sort] ?? ORDER_BY_MAP.newest,
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.order.count({ where }),
        ]);

        return NextResponse.json({ orders, total, page, pageSize });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}
