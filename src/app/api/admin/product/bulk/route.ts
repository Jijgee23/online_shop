import { ProductState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { products } = await req.json();

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: "Мэдээлэл хоосон байна" }, { status: 400 });
        }

        // Төрөлжүүлж бэлтгэх (Excel-ээс ирсэн датаг Prisma-д тааруулах)
        const formattedProducts = products.map((p) => ({
            name: String(p.name),
            price: parseFloat(p.price),
            stock: parseInt(p.stock),
            categoryId: parseInt(p.categoryId),
            slug: p.slug || String(p.name).toLowerCase().replace(/ /g, "-"),
            isPublished: true,
            description: p.description || "",
            state: ProductState.ACTIVE
        }));

        // Олноор нь үүсгэх
        const result = await prisma.product.createMany({
            data: formattedProducts,
            skipDuplicates: true, // Ижил slug-тай бараа байвал алгасах
        });

        return NextResponse.json({
            message: `${result.count} бараа амжилттай нэмэгдлээ`,
            count: result.count
        });
    } catch (error) {
        console.error("Bulk Upload Error:", error);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}