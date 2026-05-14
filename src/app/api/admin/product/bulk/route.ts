import { ProductState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/admin/product/bulk
// body: { ids, action: "deactivate" | "setCategory", categoryId? }
export async function PATCH(req: NextRequest) {
    try {
        const { ids, action, categoryId } = await req.json();
        if (!Array.isArray(ids) || ids.length === 0)
            return NextResponse.json({ error: "Барааны жагсаалт хоосон байна" }, { status: 400 });

        if (action === "deactivate") {
            await prisma.product.updateMany({
                where: { id: { in: ids } },
                data: { state: ProductState.INACTIVE, isPublished: false, deletedAt: new Date() },
            });
            return NextResponse.json({ message: `${ids.length} бараа идэвхгүй болгогдлоо` });
        }

        if (action === "setCategory") {
            if (!categoryId)
                return NextResponse.json({ error: "Ангилал сонгоогүй байна" }, { status: 400 });
            await prisma.product.updateMany({
                where: { id: { in: ids } },
                data: { categoryId },
            });
            return NextResponse.json({ message: `${ids.length} барааны ангилал шинэчлэгдлээ` });
        }

        return NextResponse.json({ error: "Буруу action" }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}

// DELETE /api/admin/product/bulk
// body: { ids }
export async function DELETE(req: NextRequest) {
    try {
        const { ids } = await req.json();
        if (!Array.isArray(ids) || ids.length === 0)
            return NextResponse.json({ error: "Барааны жагсаалт хоосон байна" }, { status: 400 });

        await prisma.$transaction(async (tx) => {
            await tx.productImage.deleteMany({ where: { productId: { in: ids } } });
            await tx.cartItem.deleteMany({   where: { productId: { in: ids } } });
            await tx.review.deleteMany({     where: { productId: { in: ids } } });
            await tx.orderItem.deleteMany({  where: { productId: { in: ids } } });
            await tx.product.deleteMany({    where: { id:        { in: ids } } });
        });

        return NextResponse.json({ message: `${ids.length} бараа бүр мөсөн устгагдлаа` });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}

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