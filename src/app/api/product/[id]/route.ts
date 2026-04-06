import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;
    console.log(id)
    const producdId = Number(id);

    try {
        const product = await prisma.product.findUnique({
            where: { id: producdId },
            include: {
                images: true,
                category: true,
                _count: true,
                reviews: {
                    where: { deletedAt: null },
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { createdAt: "desc" },
                },
                productSizes: true,
                colors: true,
                features: true
            }
        })

        if (!product) return NextResponse.json({ error: 'product not found' }, { status: 400 })
        // console.log(product)
        return NextResponse.json({ product: product }, { status: 200 })

    } catch (e) {
        console.log(e)
        return NextResponse.json({ error: e }, { status: 400 })
    }
}