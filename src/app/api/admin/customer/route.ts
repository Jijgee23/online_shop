import { prisma } from '@/lib/prisma';
import { UserRole } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const p        = req.nextUrl.searchParams;
        const page     = Math.max(1, Number(p.get("page")     || 1));
        const pageSize = Math.max(1, Number(p.get("pageSize") || 20));
        const search   = p.get("search") || "";
        const status   = p.get("status") || "";

        const where: any = { role: UserRole.CUSTOMER, deletedAt: null };

        if (search.trim()) {
            where.OR = [
                { name:  { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
            ];
        }

        if (status) where.status = status;

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                select: {
                    id:        true,
                    name:      true,
                    email:     true,
                    phone:     true,
                    status:    true,
                    role:      true,
                    createdAt: true,
                    orders: {
                        select: { totalPrice: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.user.count({ where }),
        ]);

        const customers = users.map(user => ({
            id:          user.id,
            name:        user.name,
            email:       user.email,
            phone:       user.phone,
            status:      user.status,
            role:        user.role,
            createdAt:   user.createdAt,
            totalOrders: user.orders.length,
            totalSpent:  user.orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0),
        }));

        return NextResponse.json({ data: customers, total, page, pageSize }, { status: 200 });
    } catch (err) {
        console.error("get customers error:", err);
        return NextResponse.json({ error: "Хэрэглэгчид татахад алдаа гарлаа" }, { status: 500 });
    }
}
