import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {


    try {
        const orders = await prisma.order.findMany({
            include: { items: { include: { product: { include: { images: true } } }, }, user: true },
            orderBy: { createdAt: 'desc' },
        })

        if (orders) {
            return NextResponse.json({
                orders: orders ?? [],
                status: 200,
            })
        }

        return NextResponse.json({
            orders: [],
            status: 404,
        })

    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 })
    }
}