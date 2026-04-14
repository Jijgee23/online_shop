import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, subDays, eachDayOfInterval, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const fromParam = searchParams.get("dateFrom");
    const toParam   = searchParams.get("dateTo");

    const dateFrom = fromParam ? startOfDay(new Date(fromParam)) : subDays(startOfDay(new Date()), 6);
    const dateTo   = toParam   ? endOfDay(new Date(toParam))     : endOfDay(new Date());

    const dateFilter = { gte: dateFrom, lte: dateTo };

    // 1. Нийт үзүүлэлтүүд (Summary) — filtered by date range
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      revenueData,
      pendingOrders
    ] = await Promise.all([
      prisma.order.count({ where: { deletedAt: null, createdAt: dateFilter } }),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] }, deletedAt: null, createdAt: dateFilter }
      }),
      prisma.order.count({ where: { status: "PENDING", createdAt: dateFilter } })
    ]);

    // 2. Өдөр бүрийн борлуулалтын график (date range дотор)
    const days = eachDayOfInterval({ start: dateFrom, end: dateTo });
    const chartDays = days.length > 60 ? days.filter((_, i) => i % Math.ceil(days.length / 60) === 0) : days;

    const chartData = await Promise.all(
      chartDays.map(async (date) => {
        const dayRevenue = await prisma.order.aggregate({
          _sum: { totalPrice: true },
          where: {
            createdAt: { gte: startOfDay(date), lte: endOfDay(date) },
            status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
          },
        });
        return {
          date: date.toLocaleDateString("mn-MN", days.length <= 14 ? { weekday: "short" } : { month: "short", day: "numeric" }),
          revenue: Number(dayRevenue._sum.totalPrice) || 0,
        };
      })
    );

    // 3. Хамгийн их зарагдсан 5 бараа
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true }
        });
        return { ...product, totalSold: item._sum.quantity };
      })
    );

    // 4. Сүүлийн 5 захиалга
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { createdAt: dateFilter },
      include: { user: { select: { name: true, email: true } } }
    });

    return NextResponse.json({
      summary: { totalRevenue: Number(revenueData._sum.totalPrice) || 0, totalOrders, totalUsers, totalProducts, pendingOrders },
      chartData,
      topProducts,
      recentOrders,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json({ error: "Статистик татахад алдаа гарлаа" }, { status: 500 });
  }
}