import { ProductState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { products } = await req.json();

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: "Мэдээлэл хоосон байна" }, { status: 400 });
        }

        // Resolve fallback category ("Бусад")
        const busad = await prisma.category.findUnique({ where: { slug: "busad" } });
        if (!busad) {
            return NextResponse.json({ error: '"Бусад" ангилал олдсонгүй' }, { status: 500 });
        }

        // Collect unique categoryIds from the payload and verify which ones exist
        const rawIds = [...new Set(products.map((p) => parseInt(p.categoryId)).filter(Boolean))];
        const existingCategories = await prisma.category.findMany({
            where: { id: { in: rawIds } },
            select: { id: true },
        });
        const validIds = new Set(existingCategories.map((c) => c.id));

        // Төрөлжүүлж бэлтгэх (Excel-ээс ирсэн датаг Prisma-д тааруулах)
        const formattedProducts = products.map((p) => {
            const cid = parseInt(p.categoryId);
            return {
                name: String(p.name),
                price: parseFloat(p.price),
                stock: parseInt(p.stock),
                categoryId: validIds.has(cid) ? cid : busad.id,
                slug: p.slug || String(p.name).toLowerCase().replace(/ /g, "-"),
                isPublished: true,
                description: p.description || "",
                state: ProductState.ACTIVE,
            };
        });

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