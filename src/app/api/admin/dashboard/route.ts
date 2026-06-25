import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, subDays, eachDayOfInterval, endOfDay, startOfMonth, endOfMonth, differenceInCalendarDays } from "date-fns";
import { getLowStockProducts } from "@/services/inventory.service";

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

    // 5. Бага үлдэгдэлтэй бараа (тохиргооны босгоор)
    const lowStock = await getLowStockProducts();

    // 5b. Ангиллын статистик — ЗӨВХӨН хүргэгдсэн (DELIVERED) захиалгуудаар
    const deliveredItems = await prisma.orderItem.findMany({
      where: {
        deletedAt: null,
        order: { status: "DELIVERED", deletedAt: null, createdAt: dateFilter },
      },
      select: {
        price: true,
        quantity: true,
        product: { select: { category: { select: { id: true, name: true } } } },
      },
    });

    const catMap = new Map<number, { name: string; revenue: number; count: number }>();
    for (const it of deliveredItems) {
      const cat = it.product?.category;
      if (!cat) continue;
      const cur = catMap.get(cat.id) ?? { name: cat.name, revenue: 0, count: 0 };
      cur.revenue += Number(it.price) * it.quantity;
      cur.count   += it.quantity;
      catMap.set(cat.id, cur);
    }

    let categoryStats = Array.from(catMap.values()).sort((a, b) => b.revenue - a.revenue);
    // 6-аас олон ангилал бол эхний 5 + үлдсэнийг "Бусад" болгож нэгтгэнэ
    if (categoryStats.length > 6) {
      const rest = categoryStats.slice(5);
      categoryStats = [
        ...categoryStats.slice(0, 5),
        rest.reduce((a, c) => ({ name: "Бусад", revenue: a.revenue + c.revenue, count: a.count + c.count }), { name: "Бусад", revenue: 0, count: 0 }),
      ];
    }

    // 6. Сарын орлогын зорилт ба явц (date filter-ээс үл хамааран ЭНЭ САР)
    const now         = new Date();
    const monthStart  = startOfMonth(now);
    const monthEnd    = endOfMonth(now);
    const [monthRevenue, storeSettings] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] }, deletedAt: null, createdAt: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.storeSettings.findUnique({ where: { id: 1 }, select: { monthlyRevenueGoal: true } }),
    ]);

    const revenueGoal = {
      goal:     Number(storeSettings?.monthlyRevenueGoal) || 0,
      current:  Number(monthRevenue._sum.totalPrice) || 0,
      month:    now.toLocaleDateString("mn-MN", { month: "long" }),
      daysLeft: Math.max(0, differenceInCalendarDays(monthEnd, now)),
    };

    return NextResponse.json({
      summary: { totalRevenue: Number(revenueData._sum.totalPrice) || 0, totalOrders, totalUsers, totalProducts, pendingOrders },
      chartData,
      topProducts,
      recentOrders,
      lowStock,
      revenueGoal,
      categoryStats,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json({ error: "Статистик татахад алдаа гарлаа" }, { status: 500 });
  }
}