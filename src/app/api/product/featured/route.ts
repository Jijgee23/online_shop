import { ProductState } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {

    const cateogory = req.nextUrl.pathname;
    const cid = req.nextUrl.searchParams;

    console.log(cateogory, cid)
    try {
        const products = await prisma.product.findMany({
            where: {
                deletedAt: null,
                isPublished: true,
                state: ProductState.ACTIVE
            },
            take: 4,
            orderBy: {
                createdAt: 'desc',
                // price: 'asc'
            },
            include: {
                category: true,
                images: true
            }
        })

        return NextResponse.json({
            data: products ?? [],
            status: 200,
        })

    } catch (err) {

        console.log(err)

        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 })
    }
}