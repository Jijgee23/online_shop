import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const page     = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? 20));
    const search   = searchParams.get("search") ?? "";
    const status   = searchParams.get("status") ?? "";

    try {
        const where: any = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { order: { orderNumber: { contains: search, mode: "insensitive" } } },
                { order: { user: { name: { contains: search, mode: "insensitive" } } } },
            ];
        }

        const [payments, total] = await prisma.$transaction([
            prisma.payment.findMany({
                where,
                include: {
                    order: {
                        select: {
                            orderNumber: true,
                            totalPrice: true,
                            user: { select: { name: true, email: true } },
                        },
                    },
                },
                orderBy: { updatedAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.payment.count({ where }),
        ]);

        return NextResponse.json({ data: payments, total }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
