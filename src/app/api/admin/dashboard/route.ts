import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfDay, subDays } from "date-fns";

export async function GET() {
  try {
    // 1. Нийт үзүүлэлтүүд (Summary)
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      revenueData,
      pendingOrders
    ] = await Promise.all([
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: "DELIVERED" } // Зөвхөн хүргэгдсэн захиалгын орлого
      }),
      prisma.order.count({ where: { status: "PENDING" } })
    ]);

    // 2. Сүүлийн 7 хоногийн борлуулалтын график өгөгдөл
    const last7Days = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const date = subDays(startOfDay(new Date()), i);
        const nextDate = subDays(startOfDay(new Date()), i - 1);

        const dayRevenue = await prisma.order.aggregate({
          _sum: { totalPrice: true },
          where: {
            createdAt: { gte: date, lt: nextDate },
            status: "DELIVERED"
          }
        });

        return {
          date: date.toLocaleDateString('mn-MN', { weekday: 'short' }),
          revenue: dayRevenue._sum.totalPrice || 0
        };
      })
    );

    // 3. Хамгийн их зарагдсан 5 бараа (Top Selling Products)
    // Энэ нь OrderItem дээр GroupBy хийж байна
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
        return {
          ...product,
          totalSold: item._sum.quantity
        };
      })
    );

    // 4. Сүүлийн 5 захиалга (Recent Orders)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });

    return NextResponse.json({
      summary: {
        totalRevenue: revenueData._sum.totalPrice || 0,
        totalOrders,
        totalUsers,
        totalProducts,
        pendingOrders
      },
      chartData: last7Days.reverse(),
      topProducts,
      recentOrders
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json({ error: "Статистик татахад алдаа гарлаа" }, { status: 500 });
  }
}