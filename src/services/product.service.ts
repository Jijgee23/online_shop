import { ProductState, AttributeType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/utils/utils";
import { getUploadDir, uniqueFileName } from "@/utils/uploadDir";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// ─── Generic attribute / variant контракт (админ формоос) ───────────────────
type AttrValueInput = { value: string; hex?: string | null; imageUrl?: string | null };
type AttrInput = { type: AttributeType; values: AttrValueInput[] };
type VariantComboInput = {
    values: { type: AttributeType; value: string }[];
    price: number | null;
    discountPrice: number | null;
    stock: number;
    sku?: string | null;
};

// Зураг ↔ хувилбарын утга холбоос (админ формоос).
// Зургийг ref-ээр зааж өгнө: одоо байгаа (id) эсвэл шинээр оруулсан (index).
type ImageLinkInput = {
    ref: { kind: "existing"; id: number } | { kind: "new"; index: number };
    values: { type: AttributeType; value: string }[];
};

// Барааны attribute (төрөл+утга) болон variant (хослол)-уудыг үүсгэнэ.
// Өнгөний утгын зургийг формоос `attrImg_<attrIdx>_<valIdx>` файлаар хүлээж авна.
async function saveAttributesAndVariants(
    productId: number,
    attrs: AttrInput[],
    variants: VariantComboInput[],
    formData: FormData,
) {
    // 1. Attribute + утгууд (нэр → id map)
    const valueIdMap = new Map<string, number>(); // `${type}:::${value}` → attributeValueId
    for (let ai = 0; ai < attrs.length; ai++) {
        const a = attrs[ai];
        const attr = await prisma.productAttribute.create({ data: { productId, type: a.type } });
        for (let vi = 0; vi < a.values.length; vi++) {
            const v = a.values[vi];
            const file = formData.get(`attrImg_${ai}_${vi}`) as File | null;
            const imageUrl = file && typeof file !== "string" ? await saveUpload(file) : (v.imageUrl ?? null);
            const cv = await prisma.productAttributeValue.create({
                data: { attributeId: attr.id, value: v.value, hex: v.hex ?? null, imageUrl },
            });
            valueIdMap.set(`${a.type}:::${v.value}`, cv.id);
        }
    }

    // 2. Variant (хослол) бүр + холбоос
    for (const variant of variants) {
        const valueIds = variant.values
            .map(vv => valueIdMap.get(`${vv.type}:::${vv.value}`))
            .filter((x): x is number => typeof x === "number");
        await prisma.productVariant.create({
            data: {
                productId,
                price: variant.price,
                discountPrice: variant.discountPrice,
                stock: Number.isFinite(variant.stock) ? variant.stock : 0,
                sku: variant.sku ?? null,
                values: { create: valueIds.map(attributeValueId => ({ attributeValueId })) },
            },
        });
    }

    // Зургийн холбоос үүсгэхэд хэрэгтэй тул нэр → id map-ыг буцаана
    return valueIdMap;
}

// Зураг ↔ хувилбарын утга холбоосыг үүсгэнэ.
// imageLinks доторх зургийг id (existing) эсвэл шинэ зургийн index-ээр шийднэ.
async function saveImageLinks(
    links: ImageLinkInput[],
    valueIdMap: Map<string, number>,
    newIndexToImageId: Map<number, number>,
) {
    const rows: { imageId: number; attributeValueId: number }[] = [];
    for (const link of links) {
        const imageId = link.ref.kind === "existing"
            ? link.ref.id
            : newIndexToImageId.get(link.ref.index);
        if (!imageId) continue;
        for (const val of link.values) {
            const attributeValueId = valueIdMap.get(`${val.type}:::${val.value}`);
            if (attributeValueId) rows.push({ imageId, attributeValueId });
        }
    }
    if (rows.length > 0) {
        await prisma.productImageLink.createMany({ data: rows, skipDuplicates: true });
    }
}

// Админ формоос ирэх ProductStock мөрийн бүтэц.
// Өнгө/размерыг НЭРЭЭР нь холбоно — учир нь color/size нь ижил хүсэлтэд
// шинээр үүсэх тул id хараахан байхгүй.
type StockInput = {
    colorName: string | null;
    sizeName: string | null;
    price: number | null;
    discountPrice: number | null;
    stock: number;
    sku?: string | null;
};

/**
 * Үүсгэгдсэн color/size-уудын нэр → id map дээр тулгуурлан
 * StockInput[]-ийг prisma.productStock.create-д тохирох data[] болгож хувиргана.
 * Тохирох нэр олдоогүй бол тухайн талыг null болгоно (сонголтгүй хослол).
 */
function buildStockRows(
    productId: number,
    stocks: StockInput[],
    colors: { id: number; name: string }[],
    sizes: { id: number; sizeName: string }[],
) {
    const colorByName = new Map(colors.map(c => [c.name, c.id]));
    const sizeByName = new Map(sizes.map(s => [s.sizeName, s.id]));
    return stocks.map(s => ({
        productId,
        productColorId: s.colorName ? (colorByName.get(s.colorName) ?? null) : null,
        productSizeId: s.sizeName ? (sizeByName.get(s.sizeName) ?? null) : null,
        price: s.price ?? null,
        discountPrice: s.discountPrice ?? null,
        stock: Number.isFinite(s.stock) ? s.stock : 0,
        sku: s.sku ?? null,
    }));
}

// Нэг файлыг public/uploads-д хадгалж, public URL буцаана
async function saveUpload(file: File): Promise<string> {
    const uploadDir = getUploadDir();
    try { await mkdir(uploadDir, { recursive: true }); } catch { /* хавтас байвал алгасна */ }
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = uniqueFileName(file.name);
    await writeFile(path.join(uploadDir, fileName), buffer);
    return `/uploads/${fileName}`;
}

// colors массивын imageUrl-ийг шинэ файл (colorImage_<i>) байвал upload хийж тохируулна
async function resolveColorImages(
    formData: FormData,
    colors: { hex: string; name: string; imageUrl?: string | null }[],
) {
    return Promise.all(colors.map(async (c, i) => {
        const file = formData.get(`colorImage_${i}`) as File | null;
        const imageUrl = file && typeof file !== "string"
            ? await saveUpload(file)
            : (c.imageUrl ?? null);
        return { hex: c.hex, name: c.name, imageUrl };
    }));
}

export const ProductService = {
    async postProduct(formData: FormData) {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = Number(formData.get("price"));
        const stock = Number(formData.get("stock"));
        let categoryId = Number(formData.get("categoryId"));
        const sku = generateSlug(name)
        const barcode = (formData.get("barcode") as string | null)?.trim() || null;
        const isPublished = formData.get("isPublished") === "true";
        const featured = formData.get("featured") === "true";
        const hasVariants = formData.get("hasVariants") === "true";
        const discountPrice = formData.get("discountPrice") ? Number(formData.get("discountPrice")) : null;
        const imageFiles = formData.getAll("images") as File[];
        const state = formData.get("state") as ProductState;
        const colorsRaw = formData.get("colors") as string | null;
        const sizesRaw = formData.get("sizes") as string | null;
        const featuresRaw = formData.get("features") as string | null;
        const stocksRaw = formData.get("productStocks") as string | null;
        const colors = colorsRaw ? JSON.parse(colorsRaw) as { hex: string; name: string; imageUrl?: string | null }[] : [];
        const sizes = sizesRaw ? JSON.parse(sizesRaw) as { sizeName: string; value: string }[] : [];
        const features = featuresRaw ? JSON.parse(featuresRaw) as { title: string; description: string }[] : [];
        const stocks = stocksRaw ? JSON.parse(stocksRaw) as StockInput[] : [];
        const attributesRaw = formData.get("attributes") as string | null;
        const variantsRaw = formData.get("variants") as string | null;
        const imageLinksRaw = formData.get("imageLinks") as string | null;
        const attributes = attributesRaw ? JSON.parse(attributesRaw) as AttrInput[] : [];
        const variantCombos = variantsRaw ? JSON.parse(variantsRaw) as VariantComboInput[] : [];
        const imageLinks = imageLinksRaw ? JSON.parse(imageLinksRaw) as ImageLinkInput[] : [];

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
        const uploadDir = getUploadDir();
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Хавтас аль хэдийн байвал алдаа өгөхгүй
        }

        const imageUrls = await Promise.all(
            imageFiles.map(async (file) => {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = uniqueFileName(file.name);
                const filePath = path.join(uploadDir, fileName);
                await writeFile(filePath, buffer);
                return `/uploads/${fileName}`;
            })
        );
        // Өнгө бүрийн зургийг (байвал) upload хийж imageUrl тохируулна
        const colorsData = await resolveColorImages(formData, colors);

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                categoryId,
                slug,
                sku,
                barcode,
                discountPrice,
                isPublished,
                featured,
                hasVariants,
                state: state ?? ProductState.ACTIVE,
                images: { create: imageUrls.map(url => ({ url })) },
                colors: { create: colorsData },
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
            // ProductStock мөрүүдийг үүсгэх.
            // Хослол ирээгүй бол барааны нийт stock/price-аар нэг default мөр үүсгэнэ.
            const stockRows = stocks.length > 0
                ? buildStockRows(product.id, stocks, product.colors, product.productSizes)
                : [{
                    productId: product.id,
                    productColorId: null,
                    productSizeId: null,
                    price: price,
                    discountPrice: discountPrice,
                    stock: stock,
                    sku: sku,
                }];
            await prisma.productStock.createMany({ data: stockRows });
            const productStocks = await prisma.productStock.findMany({ where: { productId: product.id } });

            // Шинэ attribute/variant систем (ирсэн бол)
            if (attributes.length > 0) {
                const valueIdMap = await saveAttributesAndVariants(product.id, attributes, variantCombos, formData);
                // Шинэ зургийн index → үүсгэгдсэн imageId (url-ээр тааруулна)
                const urlToId = new Map(product.images.map(i => [i.url, i.id]));
                const newIndexToImageId = new Map<number, number>();
                imageUrls.forEach((url, idx) => {
                    const imgId = urlToId.get(url);
                    if (imgId) newIndexToImageId.set(idx, imgId);
                });
                if (imageLinks.length > 0) {
                    await saveImageLinks(imageLinks, valueIdMap, newIndexToImageId);
                }
            }

            return {
                message: "Product амжилттай үүслээ",
                data: { ...product, productStocks }
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
        const barcodeRaw = formData.get("barcode");
        const hasVariantsRaw = formData.get("hasVariants");

        if (nameRaw !== null) data.name = nameRaw as string;
        if (descRaw !== null) data.description = descRaw as string;
        if (priceRaw !== null) { const v = Number(priceRaw); if (!isNaN(v)) data.price = v; }
        if (stockRaw !== null) { const v = Number(stockRaw); if (!isNaN(v)) data.stock = v; }
        if (categoryIdRaw !== null) { const v = Number(categoryIdRaw); if (v) data.category = { connect: { id: v } }; }
        if (stateRaw !== null && stateRaw !== "null") data.state = stateRaw as ProductState;
        if (featuredRaw !== null) data.featured = featuredRaw === "true";
        if (isPublishedRaw !== null) data.isPublished = isPublishedRaw === "true";
        if (barcodeRaw !== null) data.barcode = (barcodeRaw as string).trim() || null;
        if (hasVariantsRaw !== null) data.hasVariants = hasVariantsRaw === "true";

        // Relations — only replace if explicitly sent
        const colorsRaw = formData.get("colors");
        const featuresRaw = formData.get("features");
        const sizesRaw = formData.get("productSizes");
        const stocksRaw = formData.get("productStocks");

        if (colorsRaw && typeof colorsRaw === "string" && colorsRaw !== "[object Object]") {
            const parsed = JSON.parse(colorsRaw) as { hex: string; name: string; imageUrl?: string | null }[];
            const colorsData = await resolveColorImages(formData, parsed);
            data.colors = { deleteMany: {}, create: colorsData };
        }
        if (featuresRaw && typeof featuresRaw === "string" && featuresRaw !== "[object Object]") {
            const featuresData = JSON.parse(featuresRaw);
            data.features = { deleteMany: {}, create: featuresData.map((f: any) => ({ title: f.title, description: f.description })) };
        }
        if (sizesRaw && typeof sizesRaw === "string" && sizesRaw !== "[object Object]") {
            const sizesData = JSON.parse(sizesRaw);
            data.productSizes = { deleteMany: {}, create: sizesData.map((s: any) => ({ sizeName: s.sizeName, value: s.value })) };
        }

        // Images — sync existing (delete removed) + upload new.
        // id-аар устгана (url-аар БИШ) — ингэснээр ижил url-тай давхардсан мөрүүдийг
        // тус тусад нь зөв устгана.
        const existingImagesRaw = formData.get("existingImages");
        const keptIds: number[] = existingImagesRaw
            ? (JSON.parse(existingImagesRaw as string) as { id?: number }[])
                .map(i => i.id)
                .filter((x): x is number => typeof x === "number")
            : [];

        // Delete images that the user removed in the UI
        await prisma.productImage.deleteMany({
            where: { productId: id, id: { notIn: keptIds } },
        });

        // Upload and create new images
        const imageFiles = formData.getAll("images") as File[];
        // Шинэ зургийн url-ууд (формын index дарааллаар) — холбоос үүсгэхэд хэрэгтэй
        let newImageUrls: string[] = [];
        if (imageFiles.length > 0) {
            const uploadDir = getUploadDir();
            try { await mkdir(uploadDir, { recursive: true }); } catch (err) {
                console.error("Хавтас үүсгэхэд алдаа гарлаа:", err);
            }

            newImageUrls = await Promise.all(
                imageFiles.map(async (file) => {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const fileName = uniqueFileName(file.name);
                    await writeFile(path.join(uploadDir, fileName), buffer);
                    return `/uploads/${fileName}`;
                })
            );
            data.images = { create: newImageUrls.map(url => ({ url })) };
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

        // ProductStock — зөвхөн илгээгдсэн үед бүрэн дахин барина.
        // colors/sizes дээр deleteMany+create хийгдсэн тул шинэ id-аар дахин холбоно.
        if (stocksRaw && typeof stocksRaw === "string" && stocksRaw !== "[object Object]") {
            const stocks = JSON.parse(stocksRaw) as StockInput[];
            await prisma.productStock.deleteMany({ where: { productId: Number(id) } });
            const stockRows = stocks.length > 0
                ? buildStockRows(Number(id), stocks, updatedProduct.colors, updatedProduct.productSizes)
                : [{
                    productId: Number(id),
                    productColorId: null,
                    productSizeId: null,
                    price: updatedProduct.price,
                    discountPrice: updatedProduct.discountPrice,
                    stock: updatedProduct.stock,
                    sku: updatedProduct.sku,
                }];
            await prisma.productStock.createMany({ data: stockRows });
        }

        const productStocks = await prisma.productStock.findMany({ where: { productId: Number(id) } });

        // Attribute/variant систем — илгээгдсэн үед бүрэн дахин барина
        const attributesRaw = formData.get("attributes");
        const variantsRaw = formData.get("variants");
        const imageLinksRaw = formData.get("imageLinks");
        if (attributesRaw && typeof attributesRaw === "string" && attributesRaw !== "[object Object]") {
            const attributes = JSON.parse(attributesRaw) as AttrInput[];
            const variantCombos = variantsRaw && typeof variantsRaw === "string"
                ? JSON.parse(variantsRaw) as VariantComboInput[] : [];
            const imageLinks = imageLinksRaw && typeof imageLinksRaw === "string"
                ? JSON.parse(imageLinksRaw) as ImageLinkInput[] : [];
            // Хуучин attribute/variant-уудыг устгана (cascade-аар утга + зургийн холбоос устана)
            await prisma.productVariant.deleteMany({ where: { productId: Number(id) } });
            await prisma.productAttribute.deleteMany({ where: { productId: Number(id) } });
            if (attributes.length > 0) {
                const valueIdMap = await saveAttributesAndVariants(Number(id), attributes, variantCombos, formData);
                // Шинэ зургийн index → imageId (шинэ url-уудыг updatedProduct.images-аас тааруулна)
                const urlToId = new Map(updatedProduct.images.map(i => [i.url, i.id]));
                const newIndexToImageId = new Map<number, number>();
                newImageUrls.forEach((url, idx) => {
                    const imgId = urlToId.get(url);
                    if (imgId) newIndexToImageId.set(idx, imgId);
                });
                if (imageLinks.length > 0) {
                    await saveImageLinks(imageLinks, valueIdMap, newIndexToImageId);
                }
            }
        }

        return { success: true, data: { ...updatedProduct, productStocks } };
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
                { barcode: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
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
                    productStocks: true,
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
        return deactivatedProduct
    },
    async permanentDelete(id: number) {
        const product = await prisma.product.findUnique({ where: { id: Number(id) } })
        if (!product) return { message: 'Бараа олдсонгүй' }
        await prisma.$transaction(async (tx) => {
            await tx.productImage.deleteMany({ where: { productId: id } });
            await tx.cartItem.deleteMany({   where: { productId: id } });
            await tx.review.deleteMany({     where: { productId: id } });
            await tx.orderItem.deleteMany({  where: { productId: id } });
            await tx.product.delete({        where: { id } });
        });
        return product
    },
    async productDetail(id: number) {
        const product = await prisma.product.findUnique({
            where: { id: id },
            include: {
                images: { include: { links: { select: { attributeValueId: true } } } },
                category: true,
                colors: true,
                features: true,
                productSizes: true,
                productStocks: true,
                attributes: { include: { values: true } },
                variants: { include: { values: { include: { attributeValue: true } } } }
            }
        });
        if (!product) return { message: "Барааны мэдээлэл олдсонгүй!" }
        return product
    }
}