import { ProductState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/utils/utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const ProductService = {
    async postProduct(formData: FormData) {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = Number(formData.get("price"));
        const stock = Number(formData.get("stock"));
        let categoryId = Number(formData.get("categoryId"));
        const sku = generateSlug(name)
        const isPublished = formData.get("isPublished") === "true";
        const featured = formData.get("featured") === "true";
        const discountPrice = formData.get("discountPrice") ? Number(formData.get("discountPrice")) : null;
        const imageFiles = formData.getAll("images") as File[];
        const state = formData.get("state") as ProductState;
        const colorsRaw = formData.get("colors") as string | null;
        const sizesRaw = formData.get("sizes") as string | null;
        const featuresRaw = formData.get("features") as string | null;
        const colors = colorsRaw ? JSON.parse(colorsRaw) as { hex: string; name: string }[] : [];
        const sizes = sizesRaw ? JSON.parse(sizesRaw) as { sizeName: string; value: string }[] : [];
        const features = featuresRaw ? JSON.parse(featuresRaw) as { title: string; description: string }[] : [];

        if (!name || isNaN(price) || isNaN(categoryId)) {
            return { error: "Мэдээлэл дутуу эсвэл буруу байна" };
        }
        const category = await prisma.category.findFirst({
            where: { id: categoryId, deletedAt: null }
        });
        if (!category) {
            const otherCategory = await prisma.category.findFirst({ where: { slug: "busad", deletedAt: null } });
            if (!otherCategory) {
                return { error: "Ангилал олдсонгүй" };
            }
            categoryId = otherCategory.id;
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
        const uploadDir = path.join(process.cwd(), "public/uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Хавтас аль хэдийн байвал алдаа өгөхгүй
        }

        const imageUrls = await Promise.all(
            imageFiles.map(async (file) => {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `${Date.now()}-${file.name}`;
                const filePath = path.join(uploadDir, fileName);
                await writeFile(filePath, buffer);
                return `/uploads/${fileName}`;
            })
        );
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
                images: { create: imageUrls.map(url => ({ url })) },
                colors: { create: colors },
                productSizes: { create: sizes },
                features: { create: features },
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
            return {
                message: "Product амжилттай үүслээ",
                data: product
            }
        }
        return { error: "Бүтээгдэхүүн үүсгэхэд алдаа гарлаа" };
    },
    async updateProdcut(id: number, formData: FormData) {
        const data: any = {};
        const nameRaw = formData.get("name");
        const descRaw = formData.get("description");
        const priceRaw = formData.get("price");
        const stockRaw = formData.get("stock");
        const categoryIdRaw = formData.get("categoryId");
        const stateRaw = formData.get("state");
        const featuredRaw = formData.get("featured");
        const isPublishedRaw = formData.get("isPublished");

        if (nameRaw !== null) data.name = nameRaw as string;
        if (descRaw !== null) data.description = descRaw as string;
        if (priceRaw !== null) { const v = Number(priceRaw); if (!isNaN(v)) data.price = v; }
        if (stockRaw !== null) { const v = Number(stockRaw); if (!isNaN(v)) data.stock = v; }
        if (categoryIdRaw !== null) { const v = Number(categoryIdRaw); if (v) data.category = { connect: { id: v } }; }
        if (stateRaw !== null && stateRaw !== "null") data.state = stateRaw as ProductState;
        if (featuredRaw !== null) data.featured = featuredRaw === "true";
        if (isPublishedRaw !== null) data.isPublished = isPublishedRaw === "true";

        // Relations — only replace if explicitly sent
        const colorsRaw = formData.get("colors");
        const featuresRaw = formData.get("features");
        const sizesRaw = formData.get("productSizes");

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
            try { await mkdir(uploadDir, { recursive: true }); } catch { }

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

        if (!updatedProduct) return { message: 'Өгөгдөл шинэчилж чадсангүй' };
        return { success: true, data: updatedProduct };
    },
    async fetchProducts(params: {
        categoryId?: number;
        search?: string;
        priceMin?: number;
        priceMax?: number;
        inStock?: boolean;
        sort?: string;
        page: number;
        pageSize: number;
    }) {
        const { categoryId, search, priceMin, priceMax, inStock, sort, page, pageSize } = params;

        // Дэлгүүрийн тохиргоог унших
        const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });

        // Үндсэн шүүлтүүр
        const where: any = {
            deletedAt: null,
            state: ProductState.ACTIVE,
        };

        if (settings?.onlyPublished ?? true) where.isPublished = true;
        if (settings?.onlyInStock || inStock) where.stock = { gt: 0 };
        if (categoryId && categoryId !== 0) {
            // Include products from child categories as well
            const children = await prisma.category.findMany({
                where: { parentId: categoryId, deletedAt: null },
                select: { id: true },
            });
            const ids = [categoryId, ...children.map(c => c.id)];
            where.categoryId = { in: ids };
        }

        // Хайлт (Search)
        if (search?.trim()) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
            const asNum = Number(search);
            if (!isNaN(asNum)) where.OR.push({ price: { equals: asNum } });
        }

        // Үнийн шүүлтүүр
        if (priceMin !== undefined || priceMax !== undefined) {
            where.price = {
                ...(priceMin !== undefined ? { gte: priceMin } : {}),
                ...(priceMax !== undefined ? { lte: priceMax } : {}),
            };
        }

        // Sort тодорхойлох
        const ORDER_BY_MAP: Record<string, any> = {
            newest: { createdAt: "desc" },
            oldest: { createdAt: "asc" },
            price_asc: { price: "asc" },
            price_desc: { price: "desc" },
            popular: { orderItems: { _count: "desc" } },
        };

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                orderBy: ORDER_BY_MAP[sort || "newest"] ?? ORDER_BY_MAP.newest,
                include: {
                    category: true,
                    images: true,
                    colors: true,
                    features: true,
                    reviews: { take: 5 },
                    productSizes: true,
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.product.count({ where }),
        ]);

        return { products, total };
    },
    async putBack(id: number) {
        const product = await prisma.product.findUnique({ where: { id: Number(id) } })
        if (!product) return { message: 'Бараа олдсонгүй' }
        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: { state: ProductState.ACTIVE, isPublished: true, deletedAt: null },
        });
        return updatedProduct
    },
    async deactive(id: number) {
        const product = await prisma.product.findUnique({ where: { id: Number(id) } })
        if (!product) return { message: 'Бараа олдсонгүй' }
        const deactivatedProduct = await prisma.product.update({ where: { id: Number(id) }, data: { state: ProductState.INACTIVE, isPublished: false, deletedAt: new Date() } });
        if (!deactivatedProduct) return { message: 'Өгөгдөл шинэчилж чадсангүй' }
        return
    },
    async productDetail(id: number) {
        const product = await prisma.product.findUnique({
            where: { id: id },
            include: {
                images: true,
                category: true,
                colors: true,
                features: true,
                productSizes: true
            }
        });
        if (!product) return { message: "Барааны мэдээлэл олдсонгүй!" }
        return product
    }
}