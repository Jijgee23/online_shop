import { OrderItem } from "@/interface/order";

const ATTR_LABEL: Record<string, string> = {
    COLOR: "Өнгө",
    SIZE: "Хэмжээ",
    MATERIAL: "Материал",
    DESIGN: "Загвар",
};

/**
 * Захиалгын мөрийн хувилбар/хослолын дэлгэрэнгүй шошго ба өнгөний hex буцаана.
 * Шинэ загвар (productVariant) бол төрөл бүрээр нь "Өнгө: Улаан · Хэмжээ: XL",
 * хуучин загвар (productStock) бол өнгө/хэмжээгээр нь гаргана.
 */
export function variantInfo(item: OrderItem): { label: string; hex: string | null } {
    const pv = item.productVariant;
    if (pv?.values?.length) {
        const parts = pv.values
            .map(v => {
                const av = v.attributeValue;
                if (!av?.value) return null;
                const type = av.attribute?.type;
                const label = type ? (ATTR_LABEL[type] ?? type) : null;
                return label ? `${label}: ${av.value}` : av.value;
            })
            .filter(Boolean) as string[];
        const hex = pv.values.map(v => v.attributeValue?.hex).find(Boolean) ?? null;
        return { label: parts.join(" · "), hex };
    }

    const ps = item.productStock;
    if (ps) {
        const parts = [
            ps.color?.name ? `Өнгө: ${ps.color.name}` : null,
            ps.size?.sizeName ? `Хэмжээ: ${ps.size.sizeName}` : null,
        ].filter(Boolean) as string[];
        return { label: parts.join(" · "), hex: ps.color?.hex ?? null };
    }

    return { label: "", hex: null };
}

/**
 * Захиалгын мөрөнд сонгосон хувилбарт ХОЛБОГДСОН зургийг буцаана (сагстай ижил логик).
 * Тохирох холбоостой зураг олдвол түүнийг, эс бөгөөс эхний (main) зургийг буцаана.
 */
export function orderItemImageUrl(item: OrderItem): string | undefined {
    const imgs = item.product?.images ?? [];
    const pv = item.productVariant;
    if (pv && imgs.length > 0) {
        // Сонголт: attrId → сонгосон valueId
        const selByAttr = new Map<number, number>();
        (pv.values ?? []).forEach(v => {
            const aId = v.attributeValue?.attributeId;
            if (aId != null && v.attributeValueId != null) selByAttr.set(aId, v.attributeValueId);
        });
        if (selByAttr.size > 0) {
            const match = imgs.find(im => {
                const links = im.links ?? [];
                if (links.length === 0) return false;
                const byAttr = new Map<number, Set<number>>();
                for (const l of links) {
                    const aId = l.attributeValue?.attributeId;
                    if (aId == null) continue;
                    if (!byAttr.has(aId)) byAttr.set(aId, new Set());
                    byAttr.get(aId)!.add(l.attributeValueId);
                }
                for (const [aId, set] of byAttr) {
                    const sel = selByAttr.get(aId);
                    if (sel == null || !set.has(sel)) return false;
                }
                return true;
            });
            if (match) return match.url;
        }
    }
    return imgs[0]?.url;
}
