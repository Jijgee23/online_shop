import { ProductState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {

    try {

        console.log("calling public prods")
        const params = req.nextUrl.searchParams;
        const cid = Number(params.get("category"));
        const query = params.get("search")
        
        let where: any = {
            deletedAt: null,
            isPublished: true,
            state: ProductState.ACTIVE,
        }

        // const categoryIdNum = Number(cid);

        if (cid && !isNaN(cid) && cid !== 0) {
            where.categoryId = cid;
        }
        if (query && query.trim() !== "") {
            const searchNumber = Number(query);

            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
            ];

            // Хэрэв хайсан үг нь тоо байвал price-аар шүүх нөхцөлийг нэмнэ
            if (!isNaN(searchNumber)) {
                where.OR.push({
                    price: {
                        equals: searchNumber
                    }
                });
            }
        }

        console.log(cid)
        const products = await prisma.product.findMany({
            where: where,
            take: 20,
            orderBy: {
                createdAt: 'desc'
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

