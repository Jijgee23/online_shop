import { prisma } from "@/lib/prisma";
import { ProductState } from "@/generated/prisma";

// ─── Төрөл ──────────────────────────────────────────────────────────────────
// Барааны үлдэгдлийг 3 механизмаар хадгалдаг:
//   simple  — хувилбаргүй бараа, Product.stock л үнэн
//   variant — hasVariants=true, ProductVariant бүрийн нийлбэр
//   stock   — өнгө/хэмжээний ProductStock хослолуудын нийлбэр

export type InventoryType = "simple" | "variant" | "stock";

export interface InventoryBreakdownRow {
    label: string;        // "Улаан / XL" г.м
    sku: string | null;
    stock: number;
}

export interface InventoryItem {
    productId: number;
    name: string;
    sku: string | null;
    categoryName: string | null;
    type: InventoryType;
    totalStock: number;
    variantCount: number;            // хувилбар/хослолын тоо (simple бол 0)
    lowStock: boolean;
    outOfStock: boolean;
    breakdown: InventoryBreakdownRow[];
}

// Prisma-аас үлдэгдэл бодоход шаардлагатай хэлбэр (include бүтэцтэй уялдана)
const productInclude = {
    category: { select: { name: true } },
    variants: {
        where: { deletedAt: null },
        include: {
            values: { include: { attributeValue: { select: { value: true } } } },
        },
    },
    productStocks: {
        where: { deletedAt: null },
        include: {
            color: { select: { name: true } },
            size: { select: { sizeName: true, value: true } },
        },
    },
} as const;

type ProductWithStock = {
    id: number;
    name: string;
    sku: string | null;
    stock: number;
    hasVariants: boolean;
    category: { name: string } | null;
    variants: {
        sku: string | null;
        stock: number;
        values: { attributeValue: { value: string } | null }[];
    }[];
    productStocks: {
        sku: string | null;
        stock: number;
        color: { name: string } | null;
        size: { sizeName: string; value: string } | null;
    }[];
};

// Нэг барааны бодит үлдэгдэл, төрөл, хувилбарын задаргааг тооцоолно
export function computeStock(p: ProductWithStock): {
    type: InventoryType;
    totalStock: number;
    variantCount: number;
    breakdown: InventoryBreakdownRow[];
} {
    // 1. Хувилбартай бараа
    if (p.hasVariants && p.variants.length > 0) {
        const breakdown = p.variants.map(v => ({
            label: v.values.map(vv => vv.attributeValue?.value).filter(Boolean).join(" / ") || "—",
            sku: v.sku,
            stock: v.stock,
        }));
        return {
            type: "variant",
            totalStock: breakdown.reduce((s, b) => s + b.stock, 0),
            variantCount: breakdown.length,
            breakdown,
        };
    }

    // 2. Өнгө/хэмжээний хослолтой бараа (default нэг мөрийг тооцохгүй)
    const realCombos = p.productStocks.filter(s => s.color || s.size);
    if (realCombos.length > 0) {
        const breakdown = realCombos.map(s => ({
            label: [s.color?.name, s.size ? `${s.size.sizeName} ${s.size.value}`.trim() : null]
                .filter(Boolean).join(" / ") || "—",
            sku: s.sku,
            stock: s.stock,
        }));
        return {
            type: "stock",
            totalStock: breakdown.reduce((sum, b) => sum + b.stock, 0),
            variantCount: breakdown.length,
            breakdown,
        };
    }

    // 3. Энгийн бараа
    return { type: "simple", totalStock: p.stock ?? 0, variantCount: 0, breakdown: [] };
}

async function readThreshold(override?: number): Promise<number> {
    if (typeof override === "number" && Number.isFinite(override)) return Math.max(0, override);
    const settings = await prisma.storeSettings.findUnique({
        where: { id: 1 },
        select: { lowStockThreshold: true },
    });
    return settings?.lowStockThreshold ?? 5;
}

// ─── Үлдэгдлийн тайлан ────────────────────────────────────────────────────────
export async function getInventory(params: {
    search?: string;
    categoryId?: number;
    lowStockOnly?: boolean;
    threshold?: number;
}) {
    const { search, categoryId, lowStockOnly } = params;
    const threshold = await readThreshold(params.threshold);

    const where: any = { deletedAt: null };
    if (categoryId && categoryId !== 0) where.categoryId = categoryId;
    if (search?.trim()) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
            { barcode: { contains: search, mode: "insensitive" } },
        ];
    }

    const products = await prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { name: "asc" },
    }) as unknown as ProductWithStock[];

    let items: InventoryItem[] = products.map(p => {
        const { type, totalStock, variantCount, breakdown } = computeStock(p);
        return {
            productId: p.id,
            name: p.name,
            sku: p.sku,
            categoryName: p.category?.name ?? null,
            type,
            totalStock,
            variantCount,
            lowStock: totalStock < threshold,
            outOfStock: totalStock <= 0,
            breakdown,
        };
    });

    if (lowStockOnly) items = items.filter(i => i.lowStock);

    const summary = {
        totalProducts: items.length,
        totalUnits: items.reduce((s, i) => s + i.totalStock, 0),
        lowStockCount: items.filter(i => i.lowStock).length,
        outOfStockCount: items.filter(i => i.outOfStock).length,
    };

    // Бага үлдэгдэлтэйг эхэнд, дараа нь нэрээр
    items.sort((a, b) => a.totalStock - b.totalStock);

    return { threshold, summary, items };
}

// ─── Хянах самбарын бага үлдэгдэлтэй бараа ────────────────────────────────────
export async function getLowStockProducts(threshold?: number, limit = 8) {
    const th = await readThreshold(threshold);

    const products = await prisma.product.findMany({
        where: { deletedAt: null, state: ProductState.ACTIVE },
        include: productInclude,
    }) as unknown as ProductWithStock[];

    const low = products
        .map(p => {
            const { type, totalStock, variantCount } = computeStock(p);
            return { id: p.id, name: p.name, sku: p.sku, type, totalStock, variantCount };
        })
        .filter(p => p.totalStock < th)
        .sort((a, b) => a.totalStock - b.totalStock);

    return { threshold: th, total: low.length, items: low.slice(0, limit) };
}
