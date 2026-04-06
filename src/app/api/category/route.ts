import { CategoryState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
            deletedAt: null,
            state: CategoryState.ACTIVE,
        },
        take: 4,
        include: { _count: { select: { products: true } } },
    });

    return NextResponse.json(categories);
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();

        // categoryId, name гэх мэт body-оор авна
        return NextResponse.json({ message: "OK" });
    } catch (error) {
        return NextResponse.json({ error: "Амжилтгүй" }, { status: 500 });
    }
}
