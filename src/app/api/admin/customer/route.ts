import { prisma } from '@/lib/prisma';
import { UserRole } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/services/customer.service';

export async function GET(req: NextRequest) {
    try {
        const p = req.nextUrl.searchParams;
        const page = Math.max(1, Number(p.get("page") || 1));
        const pageSize = Math.max(1, Number(p.get("pageSize") || 20));
        const search = p.get("search") || "";
        const status = p.get("status") || "";
        const where: any = { role: UserRole.CUSTOMER, deletedAt: null };

        if (search.trim()) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
            ];
        }
        if (status) where.status = status;

        const { customers, total } = await CustomerService.getCustomers(page, pageSize, search, status, where);
        return NextResponse.json({ data: customers, total, page, pageSize }, { status: 200 });

    } catch (err) {
        console.error("get customers error:", err);
        return NextResponse.json({ error: "Хэрэглэгчид татахад алдаа гарлаа" }, { status: 500 });
    }
}
