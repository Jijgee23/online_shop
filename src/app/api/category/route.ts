import { CategoryState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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


    if(categories) {

    }
    return NextResponse.json(categories);
}