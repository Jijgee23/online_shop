import { ProductState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const ORDER_BY_MAP: Record<string, any> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    popular: { orderItems: { _count: "desc" } },
};

export async function GET(req: NextRequest) {
    try {
        const p = req.nextUrl.searchParams;
        const cid = Number(p.get("category"));
        const query = p.get("search") ?? "";
        const priceMin = p.get("priceMin") ? Number(p.get("priceMin")) : undefined;
        const priceMax = p.get("priceMax") ? Number(p.get("priceMax")) : undefined;
        const inStock = p.get("inStock") === "1";
        const sort = p.get("sort") || "newest";
        const page = p.get("page") ? Number(p.get("page")) : 1;
        const pageSize = p.get("pageSize") ? Number(p.get("pageSize")) : 20;

        const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });

        const where: any = {
            deletedAt: null,
            state: ProductState.ACTIVE,
        };

        if (settings?.onlyPublished ?? true) where.isPublished = true;
        if (settings?.onlyInStock) where.stock = { gt: 0 };

        if (cid && !isNaN(cid) && cid !== 0) where.categoryId = cid;

        if (query.trim()) {
            const asNum = Number(query);
            where.OR = [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ];
            if (!isNaN(asNum)) where.OR.push({ price: { equals: asNum } });
        }

        if (priceMin !== undefined || priceMax !== undefined) {
            where.price = {
                ...(priceMin !== undefined ? { gte: priceMin } : {}),
                ...(priceMax !== undefined ? { lte: priceMax } : {}),
            };
        }

        if (inStock) where.stock = { gt: 0 }; // user filter overrides setting

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                orderBy: ORDER_BY_MAP[sort] ?? ORDER_BY_MAP.newest,
                include: {
                    category: true,
                    images: true,
                    colors: true,
                    features: true,
                    reviews: true,
                    productSizes: true,
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({ data: products ?? [], total, page, pageSize });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}
