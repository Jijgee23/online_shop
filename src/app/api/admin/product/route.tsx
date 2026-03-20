import { ProductState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises"; // Файл бичих сан
import path from "path";

function createSlug(text: string) {
    return text
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        console.log(formData);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = Number(formData.get("price"));
        const stock = Number(formData.get("stock"));
        const categoryId = Number(formData.get("categoryId"));
        const sku = formData.get("sku") as string | null;
        const isPublished = formData.get("isPublished") === "true"; // Boolean болгох
        const discountPrice = formData.get("discountPrice") ? Number(formData.get("discountPrice")) : null;
        const imageFiles = formData.getAll("images") as File[];
        const uploadDir = path.join(process.cwd(), "public/uploads");
        const state = formData.get("state") as ProductState;

        if (!name || isNaN(price) || isNaN(categoryId)) {
            return NextResponse.json({ error: "Мэдээлэл дутуу эсвэл буруу байна" }, { status: 400 });
        }

        const category = await prisma.category.findFirst({
            where: { id: categoryId, deletedAt: null }
        });

        if (!category) {
            return NextResponse.json({ error: "Ангилал олдсонгүй" }, { status: 404 });
        }

        const slug = createSlug(name);
        const existingSlug = await prisma.product.findUnique({
            where: { slug }
        });

        if (existingSlug) {
            return NextResponse.json(
                { error: "Ийм slug аль хэдийн байна" },
                { status: 400 }
            );
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
        // const imageUrls = imageFiles.map((file) => {
        //     // Бодит амьдрал дээр: await uploadToCloudinary(file)
        //     return `/uploads/${file.name}`;
        // });

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                categoryId,
                slug: createSlug(name),
                sku,
                discountPrice,
                isPublished,
                state: state ?? ProductState.ACTIVE,
                images: {
                    create: imageUrls.length !== 0 ? imageUrls.map(url => ({
                        url: url
                    })) : []
                }
            },
            include: {
                images: true,
                category: true
            }
        });


        if (product) {
            return NextResponse.json({
                message: "Product амжилттай үүслээ",
                data: product
            });
        }


    } catch (error) {
        console.log("error at Create product", error);

        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {


    try {
        const products = await prisma.product.findMany({
            where: {
                deletedAt: null,
                isPublished: true,
                state: ProductState.ACTIVE
            },
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