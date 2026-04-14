import { ProductState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const productData = await ProductService.postProduct(formData)
        if (productData.error) {
            return NextResponse.json({ error: productData.error }, { status: 400 });
        }
        if (productData.data) {
            return NextResponse.json({
                message: "Бараа амжилттай үүслээ",
                data: productData.data
            }, { status: 200 });
        }
        return NextResponse.json({ error: "Бараа үүсгэхэд алдаа гарлаа" }, { status: 500 });
    } catch (error) {
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}

const ORDER_BY_MAP: Record<string, any> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    stock_asc: { stock: "asc" },
    stock_desc: { stock: "desc" },
};

export async function GET(req: NextRequest) {
    try {
        const p = req.nextUrl.searchParams;
        const page = Math.max(1, Number(p.get("page") || 1));
        const pageSize = Math.max(1, Number(p.get("pageSize") || 20));
        const search = p.get("search") || "";
        const sort = p.get("sort") || "newest";
        const catId = p.get("categoryId") ? Number(p.get("categoryId")) : undefined;
        const stockF = p.get("stock") || "all";
        const stateF = p.get("state") || "all";
        const priceMin = p.get("priceMin") ? Number(p.get("priceMin")) : undefined;
        const priceMax = p.get("priceMax") ? Number(p.get("priceMax")) : undefined;
        const where: any = {};
        if (stateF === "DELETED") {
            where.deletedAt = { not: null };
        } else if (stateF === "ACTIVE") {
            where.deletedAt = null;
            where.state = ProductState.ACTIVE;
        } else if (stateF === "INACTIVE") {
            where.deletedAt = null;
            where.state = { not: ProductState.ACTIVE };
        } else {
            // "all" — include deleted too (admin view)
        }

        if (catId) where.categoryId = catId;

        if (search.trim()) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { category: { name: { contains: search, mode: "insensitive" } } },
            ];
        }

        if (priceMin !== undefined || priceMax !== undefined) {
            where.price = {
                ...(priceMin !== undefined ? { gte: priceMin } : {}),
                ...(priceMax !== undefined ? { lte: priceMax } : {}),
            };
        }

        if (stockF === "in_stock") where.stock = { gt: 5 };
        if (stockF === "low_stock") where.stock = { gt: 0, lte: 5 };
        if (stockF === "out") where.stock = 0;

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                orderBy: ORDER_BY_MAP[sort] ?? ORDER_BY_MAP.newest,
                include: { category: true, images: true },
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