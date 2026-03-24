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
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = Number(formData.get("price"));
        const stock = Number(formData.get("stock"));
        const categoryId = Number(formData.get("categoryId"));
        const state = formData.get("state") as ProductState;
        const imageFiles = formData.getAll("images") as File[];
        const uploadDir = path.join(process.cwd(), "public/uploads");

        let data = {} as any
        if (name) {
            data.name = name
        }
        if (categoryId) {
            data.categoryId = categoryId
        }
        if (price) {
            data.price = price
        }
        if (state) {
            data.state = state
        }
        if (stock) {
            data.stock = stock
        }

        if (description) {
            data.description = description
        }

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Хавтас аль хэдийн байвал алдаа өгөхгүй
        }

        // 3. Файлуудаа бодитоор хадгалах
        const imageUrls = await Promise.all(
            imageFiles.map(async (file) => {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Файлын нэрийг давхцуулахгүйн тулд Timestamp нэмж болно
                const fileName = `${Date.now()}-${file.name}`;
                const filePath = path.join(uploadDir, fileName);

                // Файлыг public/uploads дотор бичих
                await writeFile(filePath, buffer);

                // Бааз руу хадгалах зам (URL)
                return `/uploads/${fileName}`;
            })
        );

        if (imageUrls) {
            data.images = {
                create: imageUrls.length !== 0 ? imageUrls.map(url => ({
                    url: url
                })) : []
            }
        }
        const updatedProduct = await prisma.product.update({ where: { id: Number(id) }, data: data });

        if (!updatedProduct) return NextResponse.json({ message: 'Өгөгдөл шинэчилж чадсангүй' }, { status: 400 })

        return NextResponse.json({ procuct: updatedProduct }, { status: 200 })

    } catch (err) {
        console.log(err)
        return NextResponse.json({ message: 'Амжилтгүй' }, { status: 500 })
    }
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> },) {

    const { id } = await context.params

    console.log('fetching product id on backend', id)

    try {

        const productId = Number(id)

        if (!productId) return NextResponse.json({ message: "Барааны ID буруу байна!" }, { status: 404 })

        const product = await prisma.product.findUnique({ where: { id: productId }, include: { images: true, category: true } })

        if (!product) return NextResponse.json({ message: "Барааны мэдээлэл олдсонгүй!" }, { status: 404 })

        return NextResponse.json({ product: product }, { status: 200 })


    } catch (err) {
        return NextResponse.json({ message: 'Амжилтгүй', error: err }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },) {



    try {
        const { id } = await context.params;
        const product = await prisma.product.findUnique({ where: { id: Number(id) } })
        if (!product) return NextResponse.json({ message: 'Бараа олдсонгүй' }, { status: 404 })
        const updatedProduct = await prisma.product.update({ where: { id: Number(id) }, data: { state: ProductState.INACTIVE, isPublished: false } });

        if (!updatedProduct) return NextResponse.json({ message: 'Өгөгдөл шинэчилж чадсангүй' }, { status: 400 })

        return NextResponse.json({ procuct: updatedProduct }, { status: 200 })

    } catch (err) {
        console.log(err)
        return NextResponse.json({ message: 'Амжилтгүй' }, { status: 500 })
    }
}