import { ProductState } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });

        const where: any = { deletedAt: null, state: ProductState.ACTIVE, featured: true };
        if (settings?.onlyPublished ?? true) where.isPublished = true;
        if (settings?.onlyInStock)           where.stock = { gt: 0 };

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: { category: true, images: true },
        });

        return NextResponse.json({ data: products, status: 200 });

    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 })
    }
}