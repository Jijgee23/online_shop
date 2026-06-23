"use client";

import { useEffect, useMemo, useState } from "react";
import { Product } from "@/interface/product";
import { useCart } from "@/app/context/cart_context";
import { useAuth } from "@/app/context/auth_context";
import { useSettings } from "@/app/context/settings_context";
import { imgUrl } from "@/utils/imgUrl";
import { X, ShoppingCart, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ATTR_LABEL: Record<string, string> = {
    COLOR: "Өнгө", SIZE: "Хэмжээ", MATERIAL: "Материал", DESIGN: "Загвар",
};

export default function VariantPickerModal({ productId, onClose }: { productId: number; onClose: () => void }) {
    const { cart, add } = useCart();
    const { isAuthenticated, openLogin } = useAuth();
    const { settings } = useSettings();
    const showStock = settings.showStock;

    const [product, setProduct] = useState<Product>();
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedValues, setSelectedValues] = useState<Record<number, number>>({});

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/product/${productId}`);
                if (res.ok) {
                    const prod = (await res.json()).product as Product;
                    setProduct(prod);
                    // Эхний variant-ийн утгуудаар анхдагч сонголт
                    const init: Record<number, number> = {};
                    const first = prod.variants?.[0];
                    if (first) {
                        const attrOf = new Map<number, number>();
                        (prod.attributes ?? []).forEach(a => a.values.forEach(v => attrOf.set(v.id, a.id)));
                        (first.values ?? []).forEach(vv => {
                            const aId = attrOf.get(vv.attributeValueId);
                            if (aId != null) init[aId] = vv.attributeValueId;
                        });
                    } else {
                        (prod.attributes ?? []).forEach(a => { if (a.values[0]) init[a.id] = a.values[0].id; });
                    }
                    setSelectedValues(init);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [productId]);

    useEffect(() => { setQuantity(1); }, [selectedValues]);

    const attributes = product?.attributes ?? [];
    const variants = product?.variants ?? [];

    const attrOfValue = useMemo(() => {
        const m = new Map<number, number>();
        attributes.forEach(a => a.values.forEach(v => m.set(v.id, a.id)));
        return m;
    }, [attributes]);

    const isValueAvailable = (valueId: number) =>
        variants.length === 0 || variants.some(v => v.values.some(x => x.attributeValueId === valueId));

    const selectValue = (attrId: number, valueId: number) => {
        setSelectedValues(prev => {
            const next = { ...prev, [attrId]: valueId };
            if (variants.length === 0) return next;
            const count = Object.keys(next).length;
            const exists = variants.some(v => {
                const ids = v.values.map(x => x.attributeValueId);
                return ids.length === count && Object.values(next).every(id => ids.includes(id));
            });
            if (exists) return next;
            const candidates = variants.filter(v => v.values.some(x => x.attributeValueId === valueId));
            if (candidates.length === 0) return next;
            let best = candidates[0], bestScore = -1;
            for (const v of candidates) {
                const ids = v.values.map(x => x.attributeValueId);
                const overlap = Object.entries(prev).filter(([aid, vid]) => Number(aid) !== attrId && ids.includes(vid)).length;
                const score = overlap + (v.stock > 0 ? 0.5 : 0);
                if (score > bestScore) { bestScore = score; best = v; }
            }
            const snapped: Record<number, number> = {};
            for (const vv of best.values) {
                const aId = attrOfValue.get(vv.attributeValueId);
                if (aId != null) snapped[aId] = vv.attributeValueId;
            }
            return snapped;
        });
    };

    const activeVariant = useMemo(() => {
        if (variants.length === 0) return null;
        const ids = Object.values(selectedValues);
        if (ids.length === 0) return null;
        return variants.find(v => {
            const vIds = v.values.map(x => x.attributeValueId);
            return vIds.length === ids.length && ids.every(id => vIds.includes(id));
        }) ?? null;
    }, [variants, selectedValues]);

    const effectiveStock = activeVariant ? activeVariant.stock : 0;
    const effectivePrice = activeVariant?.price != null ? activeVariant.price : (product?.price ?? 0);
    const effectiveDiscount = activeVariant?.price != null ? (activeVariant.discountPrice ?? null) : (product?.discountPrice ?? null);
    const hasDiscount = effectiveDiscount != null && effectiveDiscount < effectivePrice;

    // Сонгосон утгад холбогдсон зураг, эс бөгөөс эхний зураг
    const displayImage = useMemo(() => {
        const imgs = product?.images ?? [];
        const sel = new Set(Object.values(selectedValues));
        const matched = imgs.find(im => (im.links ?? []).some(l => sel.has(l.attributeValueId)));
        return (matched ?? imgs[0])?.url ?? "/uploads/placeholder.png";
    }, [product, selectedValues]);

    const handleAdd = async () => {
        if (!product) return;
        if (!isAuthenticated) { openLogin(); return; }
        const allSelected = attributes.every(a => selectedValues[a.id] != null);
        if (variants.length > 0 && (!allSelected || !activeVariant)) {
            toast.error("Хувилбараа бүрэн сонгоно уу");
            return;
        }
        setAdding(true);
        try {
            await add({
                cartId: cart?.id ?? null,
                productId: product.id,
                productQty: quantity,
                productVariantId: activeVariant?.id ?? null,
            });
            onClose();
        } finally {
            setAdding(false);
        }
    };

    const selectedLabel = attributes
        .map(a => a.values.find(v => v.id === selectedValues[a.id])?.value)
        .filter(Boolean).join(" / ");

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <div onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h3 className="font-bold text-slate-900 dark:text-white">Хувилбар сонгох</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading || !product ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                    </div>
                ) : (
                    <div className="p-5 space-y-5">
                        {/* Product summary */}
                        <div className="flex gap-3">
                            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                <img src={imgUrl(displayImage)} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{product.name}</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-lg font-black text-slate-900 dark:text-white">
                                        ₮{(hasDiscount ? effectiveDiscount! : effectivePrice).toLocaleString()}
                                    </span>
                                    {hasDiscount && <span className="text-xs text-slate-400 line-through">₮{effectivePrice.toLocaleString()}</span>}
                                </div>
                                {selectedLabel && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedLabel}</p>}
                            </div>
                        </div>

                        {/* Attribute selectors */}
                        {attributes.map(attr => {
                            const isColor = attr.type === "COLOR";
                            const selVal = attr.values.find(v => v.id === selectedValues[attr.id]);
                            return (
                                <div key={attr.id}>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        {ATTR_LABEL[attr.type] ?? attr.type}: <span className="text-slate-800 dark:text-white font-semibold">{selVal?.value}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2.5">
                                        {attr.values.map(v => {
                                            const active = selectedValues[attr.id] === v.id;
                                            const available = isValueAvailable(v.id);
                                            if (isColor) {
                                                return (
                                                    <button key={v.id} onClick={() => selectValue(attr.id, v.id)} disabled={!available}
                                                        title={v.value} style={{ backgroundColor: v.hex ?? "#cccccc" }}
                                                        className={`relative w-8 h-8 rounded-full transition-all ${!available
                                                            ? "opacity-30 cursor-not-allowed ring-1 ring-slate-200 dark:ring-slate-700"
                                                            : active ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900 scale-110"
                                                                : "hover:scale-110 ring-1 ring-slate-200 dark:ring-slate-700"}`} />
                                                );
                                            }
                                            return (
                                                <button key={v.id} onClick={() => selectValue(attr.id, v.id)} disabled={!available}
                                                    className={`h-10 min-w-[42px] px-3 rounded-lg text-sm font-semibold border transition-all ${!available
                                                        ? "bg-slate-50 dark:bg-slate-900/50 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800 line-through cursor-not-allowed"
                                                        : active ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                                                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white"}`}>
                                                    {v.value}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Stock + qty */}
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${effectiveStock === 0 ? "text-red-500" : effectiveStock <= 5 ? "text-amber-500" : "text-green-600 dark:text-green-400"}`}>
                                {effectiveStock === 0 ? "Дууссан" : !showStock ? "Нөөцөд байна" : effectiveStock <= 5 ? `Зөвхөн ${effectiveStock}ш үлдсэн` : `${effectiveStock}ш бэлэн`}
                            </span>
                            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-9 h-9 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">−</button>
                                <span className="w-9 text-center font-bold text-slate-900 dark:text-white text-sm">{quantity}</span>
                                <button onClick={() => setQuantity(q => Math.min(effectiveStock, q + 1))} disabled={quantity >= effectiveStock}
                                    className="w-9 h-9 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                            </div>
                        </div>

                        {/* Add button */}
                        <button onClick={handleAdd} disabled={adding || effectiveStock === 0}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                            {effectiveStock === 0 ? "Дууссан" : "Сагслах"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
