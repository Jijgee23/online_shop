import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const [totalProducts, totalOrders, reviewAgg, settings] = await Promise.all([
            prisma.product.count({ where: { deletedAt: null } }),
            prisma.order.count({ where: { deletedAt: null } }),
            prisma.review.aggregate({ _avg: { rating: true } }),
            prisma.storeSettings.findUnique({ where: { id: 1 } }),
        ]);

        const avgRating = reviewAgg._avg.rating;
        const satisfaction = avgRating !== null
            ? Math.round((avgRating / 5) * 100)
            : 98;

        return NextResponse.json({
            totalProducts,
            totalOrders,
            satisfaction,
            visibility: {
                showStatProducts:     settings?.showStatProducts     ?? true,
                showStatOrders:       settings?.showStatOrders       ?? true,
                showStatSatisfaction: settings?.showStatSatisfaction ?? true,
                showStatDelivery:     settings?.showStatDelivery     ?? true,
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}
