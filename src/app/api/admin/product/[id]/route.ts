import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises"; // Файл бичих сан
import { ProductState } from "@/generated/prisma";
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },) {

    const { id } = await context.params;
    const product = await prisma.product.findUnique({ where: { id: Number(id) } })
    if (!product) return NextResponse.json({ message: 'Бараа олдсонгүй' }, { status: 404 })

    try {
        const formData = await req.formData();

        const data: any = {};

        // Only include fields that were actually sent
        const nameRaw        = formData.get("name");
        const descRaw        = formData.get("description");
        const priceRaw       = formData.get("price");
        const stockRaw       = formData.get("stock");
        const categoryIdRaw  = formData.get("categoryId");
        const stateRaw       = formData.get("state");
        const featuredRaw    = formData.get("featured");
        const isPublishedRaw = formData.get("isPublished");

        if (nameRaw        !== null) data.name        = nameRaw as string;
        if (descRaw        !== null) data.description = descRaw as string;
        if (priceRaw       !== null) { const v = Number(priceRaw);       if (!isNaN(v)) data.price = v; }
        if (stockRaw       !== null) { const v = Number(stockRaw);       if (!isNaN(v)) data.stock = v; }
        if (categoryIdRaw  !== null) { const v = Number(categoryIdRaw);  if (v)         data.category = { connect: { id: v } }; }
        if (stateRaw       !== null && stateRaw !== "null") data.state = stateRaw as ProductState;
        if (featuredRaw    !== null) data.featured    = featuredRaw    === "true";
        if (isPublishedRaw !== null) data.isPublished = isPublishedRaw === "true";

        // Relations — only replace if explicitly sent
        const colorsRaw   = formData.get("colors");
        const featuresRaw = formData.get("features");
        const sizesRaw    = formData.get("productSizes");

        if (colorsRaw && typeof colorsRaw === "string" && colorsRaw !== "[object Object]") {
            const colorsData = JSON.parse(colorsRaw);
            data.colors = { deleteMany: {}, create: colorsData.map((c: any) => ({ name: c.name, hex: c.hex })) };
        }
        if (featuresRaw && typeof featuresRaw === "string" && featuresRaw !== "[object Object]") {
            const featuresData = JSON.parse(featuresRaw);
            data.features = { deleteMany: {}, create: featuresData.map((f: any) => ({ title: f.title, description: f.description })) };
        }
        if (sizesRaw && typeof sizesRaw === "string" && sizesRaw !== "[object Object]") {
            const sizesData = JSON.parse(sizesRaw);
            data.productSizes = { deleteMany: {}, create: sizesData.map((s: any) => ({ sizeName: s.sizeName, value: s.value })) };
        }

        // Images — only upload if files were sent
        const imageFiles = formData.getAll("images") as File[];
        if (imageFiles.length > 0) {
            const uploadDir = path.join(process.cwd(), "public/uploads");
            try { await mkdir(uploadDir, { recursive: true }); } catch {}

            const imageUrls = await Promise.all(
                imageFiles.map(async (file) => {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const fileName = `${Date.now()}-${file.name}`;
                    await writeFile(path.join(uploadDir, fileName), buffer);
                    return `/uploads/${fileName}`;
                })
            );
            data.images = { create: imageUrls.map(url => ({ url })) };
        }
        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) }, data: data, include: {
                colors: true,
                features: true,
                productSizes: true,
                images: true
            }
        });

        if (!updatedProduct) return NextResponse.json({ message: 'Өгөгдөл шинэчилж чадсангүй' }, { status: 400 })

        return NextResponse.json({ procuct: updatedProduct }, { status: 200 })

    } catch (err) {
        console.log("error updating product:", err);
        return NextResponse.json({ message: 'Амжилтгүй' }, { status: 500 })
    }
}


export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> },) {
    const { id } = await context.params;
    try {
        const productId = Number(id);
        if (!productId) return NextResponse.json({ message: "Барааны ID буруу байна!" }, { status: 400 });

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                images: true,
                category: true,
                colors: true,      // Нэмсэн
                features: true,    // Нэмсэн
                productSizes: true // Нэмсэн
            }
        });

        if (!product) return NextResponse.json({ message: "Барааны мэдээлэл олдсонгүй!" }, { status: 404 });

        return NextResponse.json({ product: product }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: 'Амжилтгүй', error: err }, { status: 500 });
    }
}
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },) {



    try {
        const { id } = await context.params;
        const product = await prisma.product.findUnique({ where: { id: Number(id) } })
        if (!product) return NextResponse.json({ message: 'Бараа олдсонгүй' }, { status: 404 })
        const updatedProduct = await prisma.product.update({ where: { id: Number(id) }, data: { state: ProductState.INACTIVE, isPublished: false, deletedAt: new Date() } });

        if (!updatedProduct) return NextResponse.json({ message: 'Өгөгдөл шинэчилж чадсангүй' }, { status: 400 })

        return NextResponse.json({ procuct: updatedProduct }, { status: 200 })

    } catch (err) {
        console.log(err)
        return NextResponse.json({ message: 'Амжилтгүй' }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },) {

    try {
        const { id } = await context.params;
        const product = await prisma.product.findUnique({ where: { id: Number(id) } })
        if (!product) return NextResponse.json({ message: 'Бараа олдсонгүй' }, { status: 404 })

        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: { state: ProductState.ACTIVE, isPublished: true, deletedAt: null },
        });

        return NextResponse.json({ product: updatedProduct }, { status: 200 })
    } catch (err) {
        console.log(err)
        return NextResponse.json({ message: 'Амжилтгүй' }, { status: 500 })
    }
}