import { ProductColor, ProductState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises"; // Файл бичих сан
import path from "path";
import { generateSlug } from "@/utils/utils";

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
        const sku = generateSlug(name)
        const isPublished = formData.get("isPublished") === "true";
        const featured   = formData.get("featured")   === "true";
        const discountPrice = formData.get("discountPrice") ? Number(formData.get("discountPrice")) : null;
        const imageFiles = formData.getAll("images") as File[];
        const uploadDir = path.join(process.cwd(), "public/uploads");
        const state = formData.get("state") as ProductState;

        const colorsRaw   = formData.get("colors")   as string | null;
        const sizesRaw    = formData.get("sizes")    as string | null;
        const featuresRaw = formData.get("features") as string | null;

        const colors   = colorsRaw   ? JSON.parse(colorsRaw)   as { hex: string; name: string }[]            : [];
        const sizes    = sizesRaw    ? JSON.parse(sizesRaw)    as { sizeName: string; value: string }[]      : [];
        const features = featuresRaw ? JSON.parse(featuresRaw) as { title: string; description: string }[]   : [];

        if (!name || isNaN(price) || isNaN(categoryId)) {
            return NextResponse.json({ error: "Мэдээлэл дутуу эсвэл буруу байна" }, { status: 400 });
        }

        const category = await prisma.category.findFirst({
            where: { id: categoryId, deletedAt: null }
        });

        if (!category) {
            return NextResponse.json({ error: "Ангилал олдсонгүй" }, { status: 404 });
        }

        let slug = generateSlug(name);
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) {
            let suffix = 2;
            while (await prisma.product.findUnique({ where: { slug: `${slug}-${suffix}` } })) {
                suffix++;
            }
            slug = `${slug}-${suffix}`;
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
                slug,
                sku,
                discountPrice,
                isPublished,
                featured,
                state: state ?? ProductState.ACTIVE,
                images:       { create: imageUrls.map(url => ({ url })) },
                colors:       { create: colors },
                productSizes: { create: sizes },
                features:     { create: features },
            },
            include: {
                images: true,
                category: true,
                colors: true,
                productSizes: true,
                features: true,
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

const ORDER_BY_MAP: Record<string, any> = {
    newest:     { createdAt: "desc" },
    oldest:     { createdAt: "asc" },
    price_asc:  { price: "asc" },
    price_desc: { price: "desc" },
    stock_asc:  { stock: "asc" },
    stock_desc: { stock: "desc" },
};

export async function GET(req: NextRequest) {
    try {
        const p          = req.nextUrl.searchParams;
        const page       = Math.max(1, Number(p.get("page")     || 1));
        const pageSize   = Math.max(1, Number(p.get("pageSize") || 20));
        const search     = p.get("search")      || "";
        const sort       = p.get("sort")        || "newest";
        const catId      = p.get("categoryId")  ? Number(p.get("categoryId")) : undefined;
        const stockF     = p.get("stock")       || "all";
        const stateF     = p.get("state")       || "all";
        const priceMin   = p.get("priceMin")    ? Number(p.get("priceMin")) : undefined;
        const priceMax   = p.get("priceMax")    ? Number(p.get("priceMax")) : undefined;

        const where: any = {};

        if (stateF === "DELETED") {
            where.deletedAt = { not: null };
        } else if (stateF === "ACTIVE") {
            where.deletedAt = null;
            where.state     = ProductState.ACTIVE;
        } else if (stateF === "INACTIVE") {
            where.deletedAt = null;
            where.state     = { not: ProductState.ACTIVE };
        } else {
            // "all" — include deleted too (admin view)
        }

        if (catId) where.categoryId = catId;

        if (search.trim()) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku:  { contains: search, mode: "insensitive" } },
                { category: { name: { contains: search, mode: "insensitive" } } },
            ];
        }

        if (priceMin !== undefined || priceMax !== undefined) {
            where.price = {
                ...(priceMin !== undefined ? { gte: priceMin } : {}),
                ...(priceMax !== undefined ? { lte: priceMax } : {}),
            };
        }

        if (stockF === "in_stock")  where.stock = { gt: 5 };
        if (stockF === "low_stock") where.stock = { gt: 0, lte: 5 };
        if (stockF === "out")       where.stock = 0;

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