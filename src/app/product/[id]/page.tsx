"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Product, ProductReview } from "@/interface/product";
import { useCart } from "@/app/context/cart_context";
import { useWishlist } from "@/app/context/wishlist_context";
import { useAuth } from "@/app/context/auth_context";
import { useSettings } from "@/app/context/settings_context";
import Header from "@/app/components/Header";
import { ArrowLeft, Loader2, Heart, CheckCircle2, Truck, Share2, ZoomIn, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { imgUrl } from "@/utils/imgUrl";

const ATTR_LABEL: Record<string, string> = {
    COLOR: "Өнгө",
    SIZE: "Хэмжээ",
    MATERIAL: "Материал",
    DESIGN: "Загвар",
};

export default function ProductDetail() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const { cart, add } = useCart();
    const { wishIds, toggleWish } = useWishlist();
    const { user, isAuthenticated, openLogin } = useAuth();
    const { settings } = useSettings();
    const showStock = settings.showStock;
    const router = useRouter();

    const [product, setProduct] = useState<Product>();
    const [fetching, setFetching] = useState(false);
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
    const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
    // Шинэ attribute/variant систем: attributeId → сонгосон attributeValueId
    const [selectedValues, setSelectedValues] = useState<Record<number, number>>({});

    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    const myReview = reviews.find(r => String(r.userId) === String(user?.id));

    const fetchDetail = async () => {
        setFetching(true);
        const res = await fetch(`/api/product/${id}`);
        if (res.ok) {
            const data = await res.json();
            const prod = data.product;
            setProduct(prod);
            setReviews(prod.reviews ?? []);
            const mine = (prod.reviews ?? []).find((r: ProductReview) => String(r.userId) === String(user?.id));
            if (mine) { setReviewRating(mine.rating); setReviewComment(mine.comment ?? ""); }
            if (prod.colors?.length > 0) setSelectedColorId(prod.colors[0].id);
            const sizes = prod.productSizes || prod.size;
            if (sizes?.length > 0) setSelectedSizeId(sizes[0].id);
            // Шинэ загвар: эхний БОДИТ variant-ийн утгуудаар анхдагч сонголт хийнэ
            // (variant байхгүй бол attribute бүрийн эхний утгаар fallback)
            if (prod.attributes?.length > 0) {
                const init: Record<number, number> = {};
                const firstVariant = prod.variants?.[0];
                if (firstVariant) {
                    const attrOfValue = new Map<number, number>(); // valueId → attributeId
                    prod.attributes.forEach((a: any) => (a.values ?? []).forEach((v: any) => attrOfValue.set(v.id, a.id)));
                    (firstVariant.values ?? []).forEach((vv: any) => {
                        const attrId = attrOfValue.get(vv.attributeValueId);
                        if (attrId != null) init[attrId] = vv.attributeValueId;
                    });
                } else {
                    for (const attr of prod.attributes) {
                        if (attr.values?.length > 0) init[attr.id] = attr.values[0].id;
                    }
                }
                setSelectedValues(init);
            }
        }
        setFetching(false);
    };

    useEffect(() => { fetchDetail(); }, []);

    // Сонголт солиход тоо хэмжээг эхлэл рүү буцаах
    useEffect(() => { setQuantity(1); }, [selectedColorId, selectedSizeId, selectedValues]);

    // Сонголт солих үед галерейг эхэнд (тухайн өнгөний зураг) буцаана
    useEffect(() => { setActiveImgIndex(0); }, [selectedColorId, selectedValues]);

    const handleReviewSubmit = async () => {
        if (reviewRating === 0) { toast.error("Одны үнэлгээ өгнө үү"); return; }
        setReviewSubmitting(true);
        const t = toast.loading("Хадгалж байна...");
        try {
            const res = await fetch("/api/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: Number(id), rating: reviewRating, comment: reviewComment }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message ?? "Алдаа гарлаа", { id: t }); return; }
            toast.success(myReview ? "Шинэчлэгдлээ" : "Сэтгэгдэл нэмэгдлээ", { id: t });
            setReviews(prev => [data, ...prev.filter(r => r.id !== data.id)]);
        } finally { setReviewSubmitting(false); }
    };

    const handleReviewDelete = async () => {
        if (!myReview) return;
        const t = toast.loading("Устгаж байна...");
        try {
            const res = await fetch("/api/review", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: Number(id) }),
            });
            if (!res.ok) { toast.error("Устгахад алдаа гарлаа", { id: t }); return; }
            toast.success("Устгагдлаа", { id: t });
            setReviews(prev => prev.filter(r => r.id !== myReview.id));
            setReviewRating(0); setReviewComment("");
        } catch { toast.error("Алдаа гарлаа", { id: t }); }
    };

    // Сонгосон өнгө/хэмжээнд тохирох ProductStock мөрийг олох (хослолгүй бол null → барааны нийт рүү fallback)
    const activeStock = useMemo(() => {
        const stocks = product?.productStocks ?? [];
        if (stocks.length === 0) return null;
        return stocks.find(ps =>
            (ps.productColorId ?? null) === selectedColorId &&
            (ps.productSizeId ?? null) === selectedSizeId
        ) ?? null;
    }, [product, selectedColorId, selectedSizeId]);

    // Шинэ загвар: сонгосон attribute утгуудад тохирох variant (хослол)-ыг олох
    const activeVariant = useMemo(() => {
        const variants = product?.variants ?? [];
        if (variants.length === 0) return null;
        const selectedIds = Object.values(selectedValues);
        if (selectedIds.length === 0) return null;
        return variants.find(v => {
            const vIds = v.values.map(x => x.attributeValueId);
            return vIds.length === selectedIds.length && selectedIds.every(id => vIds.includes(id));
        }) ?? null;
    }, [product, selectedValues]);

    const addCart = async (): Promise<boolean> => {
        if (!product) return false;
        if (!isAuthenticated) { openLogin(); return false; }
        const useNewModel = (product.attributes?.length ?? 0) > 0;
        await add({
            productId: Number(id),
            productQty: quantity,
            cartId: cart?.id ?? null,
            productStockId: useNewModel ? null : (activeStock?.id ?? null),
            productVariantId: useNewModel ? (activeVariant?.id ?? null) : null,
        });
        return true;
    };

    // Захиалах — сагсанд нэмээд шууд сагс/төлбөр рүү
    const buyNow = async () => {
        const ok = await addCart();
        if (ok) router.push("/cart");
    };

    if (fetching) return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
        </div>
    );

    if (!product) return <div className="p-20 text-center text-slate-500">Бараа олдсонгүй</div>;

    const sizes = product.productSizes || product.sizes || [];
    const hasColors = (product.colors?.length ?? 0) > 0;

    // Шинэ attribute/variant загвар идэвхтэй эсэх
    const attributes = product.attributes ?? [];
    const useNewModel = attributes.length > 0;
    const variants = product.variants ?? [];

    // valueId → attributeId зураглал (snap хийхэд хэрэгтэй)
    const attrOfValue = new Map<number, number>();
    attributes.forEach(a => a.values.forEach(v => attrOfValue.set(v.id, a.id)));

    // Тухайн утга ямар нэг variant-д орсон бол сонгох боломжтой (бусад сонголтоор түгжихгүй)
    const isValueAvailable = (_attrId: number, valueId: number): boolean => {
        if (variants.length === 0) return true;
        return variants.some(v => v.values.some(x => x.attributeValueId === valueId));
    };

    // Утга сонгоход — хослол variant-тэй нийцэхгүй бол бусад attribute-ийг тохирох variant руу автоматаар тааруулна
    const selectValue = (attrId: number, valueId: number) => {
        setSelectedValues(prev => {
            const next = { ...prev, [attrId]: valueId };
            if (variants.length === 0) return next;

            const selectedCount = Object.keys(next).length;
            const comboExists = variants.some(v => {
                const vIds = v.values.map(x => x.attributeValueId);
                return vIds.length === selectedCount && Object.values(next).every(id => vIds.includes(id));
            });
            if (comboExists) return next;

            // valueId-г агуулсан variant-уудаас өмнөх сонголттой хамгийн их давхцахыг сонгоно (нөөцтэйг нь эхэлж)
            const candidates = variants.filter(v => v.values.some(x => x.attributeValueId === valueId));
            if (candidates.length === 0) return next;

            let best = candidates[0];
            let bestScore = -1;
            for (const v of candidates) {
                const vIds = v.values.map(x => x.attributeValueId);
                const overlap = Object.entries(prev)
                    .filter(([aid, vid]) => Number(aid) !== attrId && vIds.includes(vid)).length;
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

    // Тухайн өнгө/хэмжээ хослолын нөөц (хуучин загвар)
    const stockFor = (colorId: number | null, sizeId: number | null): number | null => {
        const stocks = product.productStocks ?? [];
        if (stocks.length === 0) return null;
        const row = stocks.find(ps =>
            (ps.productColorId ?? null) === colorId && (ps.productSizeId ?? null) === sizeId
        );
        return row ? row.stock : null;
    };

    // Галерей: шинэ загварт сонгосон хувилбарт ХОЛБОГДСОН зургийг эхэлж харуулна.
    // Дүрэм: зураг холбогдсон ТӨРӨЛ бүрд (өнгө/хэмжээ/загвар/материал) сонгосон утга нь
    // тухайн зургийн тэр төрлийн холбоосуудын аль нэгэнд багтаж байвал тохирно.
    // (Нэг зураг нэг төрөлд олон утгатай холбогдож болно — ж: бүх материалд хамаарах.)
    // Холбоогүй зураг бүх хувилбарт хамаарна.
    let productImages: { url: string }[];
    if (useNewModel) {
        const imgs = product.images ?? [];
        const tagged = imgs.filter(im => (im.links?.length ?? 0) > 0);
        const untagged = imgs.filter(im => (im.links?.length ?? 0) === 0);
        const matched = tagged.filter(im => {
            // Зургийн холбоосыг attribute-аар бүлэглэх: attrId → {тэр төрлийн холбогдсон valueId-ууд}
            const byAttr = new Map<number, Set<number>>();
            for (const l of im.links!) {
                const aId = attrOfValue.get(l.attributeValueId);
                if (aId == null) continue;
                if (!byAttr.has(aId)) byAttr.set(aId, new Set());
                byAttr.get(aId)!.add(l.attributeValueId);
            }
            // Холбогдсон төрөл бүрд сонгосон утга нь холбоосуудад багтсан байх ёстой
            for (const [aId, set] of byAttr) {
                const sel = selectedValues[aId];
                if (sel == null || !set.has(sel)) return false;
            }
            return true;
        });
        const combined = [...matched, ...untagged];
        productImages = combined.length > 0
            ? combined
            : (imgs.length > 0 ? imgs : [{ url: "/uploads/placeholder.png" }]);
    } else {
        const selectedColor = product.colors?.find(c => c.id === selectedColorId);
        const colorImage = selectedColor?.imageUrl ?? null;
        const baseImages = product.images?.length > 0 ? product.images : [{ url: "/uploads/placeholder.png" }];
        productImages = colorImage ? [{ url: colorImage }, ...baseImages] : baseImages;
    }

    // Сонгосон хувилбарын үнэ/үлдэгдэл — шинэ бол variant-аас, хуучин бол ProductStock-оос.
    // Үнэ ба хямдрал нэг эх сурвалжаас (хувилбар өөрийн үнэтэй бол түүний л хямдрал).
    let effectiveStock: number, effectivePrice: number, effectiveDiscount: number | null;
    if (useNewModel) {
        effectiveStock    = activeVariant ? activeVariant.stock : 0;
        effectivePrice    = activeVariant?.price != null ? activeVariant.price : product.price;
        effectiveDiscount = activeVariant?.price != null ? (activeVariant.discountPrice ?? null) : product.discountPrice;
    } else {
        const usingComboPrice = activeStock?.price != null;
        effectiveStock    = activeStock ? activeStock.stock : product.stock;
        effectivePrice    = usingComboPrice ? activeStock!.price! : product.price;
        effectiveDiscount = usingComboPrice ? (activeStock!.discountPrice ?? null) : product.discountPrice;
    }
    const hasDiscount = effectiveDiscount != null && effectiveDiscount < effectivePrice;
    const discountPct = hasDiscount ? Math.round((1 - effectiveDiscount! / effectivePrice) * 100) : 0;
    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const isWished = wishIds.includes(product.id);

    // Сонгосон хувилбарын шошго
    const selectedVariantLabel = useNewModel
        ? attributes.map(a => a.values.find(v => v.id === selectedValues[a.id])?.value).filter(Boolean).join(" / ")
        : [
            product.colors.find(c => c.id === selectedColorId)?.name,
            sizes.find(s => s.id === selectedSizeId)?.sizeName,
        ].filter(Boolean).join(" / ");
    const hasVariants = useNewModel || hasColors || sizes.length > 0;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <Header />

            <div className="w-full px-4 sm:px-6 lg:px-10 pt-24 pb-20">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-8">
                    <button onClick={() => router.push("/")} className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Нүүр</button>
                    <span>/</span>
                    <button onClick={() => router.push("/product")} className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Бүтээгдэхүүн</button>
                    {product.category && (<><span>/</span><span className="text-slate-600 dark:text-slate-400">{product.category.name}</span></>)}
                    <span>/</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]">{product.name}</span>
                </nav>

                {/* ── Main product grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 xl:gap-14 mb-20">

                    {/* LEFT: Gallery */}
                    <div className="flex gap-3 min-w-0">
                        {/* Vertical thumbnails */}
                        {productImages.length > 1 && (
                            <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
                                {productImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImgIndex(idx)}
                                        className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImgIndex === idx ? "border-slate-900 dark:border-white" : "border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100"}`}
                                    >
                                        <img src={imgUrl(img.url)} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main image */}
                        <div className="flex-1 relative">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-300 flex items-center justify-center">
                                <img
                                    key={activeImgIndex}
                                    src={imgUrl((productImages[activeImgIndex] ?? productImages[0]).url)}
                                    alt={product.name}
                                    className="w-full h-full object-contain transition-opacity duration-300"
                                />
                            </div>
                            <button
                                onClick={() => router.back()}
                                className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:scale-105 transition-transform"
                            >
                                <ArrowLeft className="w-4 h-4 text-slate-800" />
                            </button>
                            {/* Zoom icon */}
                            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-md">
                                <ZoomIn className="w-4 h-4 text-slate-700" />
                            </div>
                            {hasDiscount && (
                                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                                    -{discountPct}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Info */}
                    <div className="flex flex-col min-w-0">
                        {/* Category */}
                        <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-[0.15em] mb-2">
                            {product.category?.name || "Ангилалгүй"}
                        </span>

                        {/* Name + actions */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-snug">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                                <button
                                    onClick={() => isAuthenticated ? toggleWish(product.id) : openLogin()}
                                    title="Хадгалах"
                                    className={`p-2 rounded-full border transition-all ${isAuthenticated && isWished
                                        ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 text-red-500"
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-slate-400"}`}
                                >
                                    <Heart className={`w-4 h-4 ${isAuthenticated && isWished ? "fill-red-500 text-red-500" : ""}`} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (typeof navigator !== "undefined" && navigator.share) {
                                            navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
                                        } else if (typeof navigator !== "undefined") {
                                            navigator.clipboard?.writeText(window.location.href);
                                            toast.success("Холбоос хуулагдлаа");
                                        }
                                    }}
                                    title="Хуваалцах"
                                    className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-slate-400 transition-all"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Rating row */}
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                <StarRow value={avgRating} size="sm" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{avgRating.toFixed(1)}</span>
                                <span className="text-xs text-slate-400">({reviews.length} үнэлгээ)</span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-3">
                            {hasDiscount ? (
                                <>
                                    <span className="text-4xl font-black text-slate-900 dark:text-white">₮{effectiveDiscount!.toLocaleString()}</span>
                                    <span className="text-xl text-slate-400 line-through">₮{effectivePrice.toLocaleString()}</span>
                                </>
                            ) : (
                                <span className="text-4xl font-black text-slate-900 dark:text-white">₮{effectivePrice.toLocaleString()}</span>
                            )}
                        </div>

                        {/* Stock */}
                        <div className="mb-6">
                            {effectiveStock > 0 ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    Нөөцөд байна{showStock ? ` · ${effectiveStock}ш` : ""}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                    Дууссан
                                </span>
                            )}
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-5">

                            {/* Шинэ загвар: динамик хувилбар сонголтууд (мөр болгон) */}
                            {useNewModel && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
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
                                                const available = isValueAvailable(attr.id, v.id);
                                                if (isColor) {
                                                    return (
                                                        <button key={v.id}
                                                            onClick={() => selectValue(attr.id, v.id)}
                                                            disabled={!available}
                                                            title={available ? v.value : `${v.value} (боломжгүй)`}
                                                            style={{ backgroundColor: v.hex ?? "#cccccc" }}
                                                            className={`relative w-8 h-8 rounded-full transition-all ${
                                                                !available
                                                                    ? "opacity-30 cursor-not-allowed ring-1 ring-slate-200 dark:ring-slate-700 after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-slate-500 after:rotate-45"
                                                                : active
                                                                    ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-950 scale-110"
                                                                    : "hover:scale-110 ring-1 ring-slate-200 dark:ring-slate-700"
                                                            }`}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <button key={v.id}
                                                        onClick={() => selectValue(attr.id, v.id)}
                                                        disabled={!available}
                                                        className={`h-10 min-w-[42px] px-3 rounded-lg text-sm font-semibold border transition-all ${
                                                            !available
                                                                ? "bg-slate-50 dark:bg-slate-900/50 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800 line-through cursor-not-allowed"
                                                            : active
                                                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                                                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white"}`}
                                                    >
                                                        {v.value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                            )}

                            {/* Color selector */}
                            {!useNewModel && product.colors?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                        Өнгө: <span className="text-slate-800 dark:text-white font-semibold capitalize">
                                            {product.colors.find(c => c.id === selectedColorId)?.name}
                                        </span>
                                    </p>
                                    <div className="flex flex-wrap gap-2.5">
                                        {product.colors.map(color => {
                                            const active = selectedColorId === color.id;
                                            // Зөвхөн өнгөтэй (размергүй) бараанд тухайн өнгөний нөөц дууссан эсэх
                                            const colorStock = sizes.length === 0 ? stockFor(color.id, null) : null;
                                            const soldOut = colorStock === 0;
                                            return (
                                                <button
                                                    key={color.id}
                                                    onClick={() => setSelectedColorId(color.id)}
                                                    disabled={soldOut}
                                                    title={colorStock != null ? `${color.name} · Үлдэгдэл: ${colorStock}ш` : String(color.name)}
                                                    style={{ backgroundColor: String(color.hex) }}
                                                    className={`relative w-8 h-8 rounded-full transition-all ${
                                                        soldOut
                                                            ? "opacity-30 cursor-not-allowed ring-1 ring-slate-200 dark:ring-slate-700 after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-slate-500 after:rotate-45"
                                                        : active
                                                            ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-950 scale-110"
                                                            : "hover:scale-110 ring-1 ring-slate-200 dark:ring-slate-700"
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Size selector */}
                            {!useNewModel && sizes.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                        Хэмжээ: <span className="text-slate-800 dark:text-white font-semibold">
                                            {sizes.find(s => s.id === selectedSizeId)?.sizeName}
                                        </span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {sizes.map((s) => {
                                            const active = selectedSizeId === s.id;
                                            // Сонгосон өнгөтэй хослуулсан энэ хэмжээний нөөц
                                            const sStock = stockFor(hasColors ? selectedColorId : null, s.id);
                                            const soldOut = sStock === 0;
                                            return (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setSelectedSizeId(s.id)}
                                                    disabled={soldOut}
                                                    title={sStock != null ? `Үлдэгдэл: ${sStock}ш` : undefined}
                                                    className={`relative h-10 min-w-[42px] px-3 rounded-lg text-sm font-semibold border transition-all ${
                                                        soldOut
                                                            ? "bg-slate-50 dark:bg-slate-900/50 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800 line-through cursor-not-allowed"
                                                        : active
                                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                                                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white"
                                                    }`}
                                                >
                                                    {String(s.sizeName)}
                                                    {showStock && sStock != null && sStock > 0 && (
                                                        <span className={`ml-1.5 text-[10px] font-bold ${active ? "text-teal-300 dark:text-teal-600" : "text-slate-400 dark:text-slate-500"}`}>
                                                            {sStock}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quantity + Add to cart */}
                            <div className="space-y-3 pt-1">
                                {/* Сонгосон хослолын боломжит үлдэгдэл */}
                                {hasVariants && (
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2.5">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {selectedVariantLabel
                                                ? <>Сонголт: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedVariantLabel}</span></>
                                                : "Боломжит үлдэгдэл"}
                                        </span>
                                        <span className={`text-xs font-bold ${
                                            effectiveStock === 0 ? "text-red-500"
                                            : effectiveStock <= 5 ? "text-amber-500"
                                            : "text-green-600 dark:text-green-400"
                                        }`}>
                                            {effectiveStock === 0
                                                ? "Дууссан"
                                                : !showStock
                                                    ? "Нөөцөд байна"
                                                    : effectiveStock <= 5
                                                        ? `Зөвхөн ${effectiveStock}ш үлдсэн`
                                                        : `${effectiveStock}ш бэлэн`}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    {/* Qty */}
                                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-11 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >−</button>
                                        <span className="w-10 text-center font-bold text-slate-900 dark:text-white text-sm">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(effectiveStock, q + 1))}
                                            disabled={quantity >= effectiveStock}
                                            className="w-10 h-11 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >+</button>
                                    </div>
                                    <span className="text-xs text-slate-400">Нийт: <span className="font-bold text-slate-700 dark:text-slate-200">₮{((hasDiscount ? effectiveDiscount! : effectivePrice) * quantity).toLocaleString()}</span></span>
                                </div>

                                {/* Delivery */}
                                <div className="flex items-center gap-2 pt-1">
                                    <Truck className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Хүргэлттэй</span>
                                </div>

                                {/* Сагслах + Захиалах */}
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <button
                                        onClick={addCart}
                                        disabled={effectiveStock === 0}
                                        className="flex items-center justify-center gap-2 h-13 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white font-bold text-base hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        Сагслах
                                    </button>
                                    <button
                                        onClick={buyNow}
                                        disabled={effectiveStock === 0}
                                        className="flex items-center justify-center h-13 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {effectiveStock === 0 ? "Дууссан" : "Захиалах"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-6">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Тайлбар</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{product.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Features */}
                {product.features?.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-10 mb-12">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Бүтээгдэхүүний онцлог</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {product.features.map((f, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
                                    <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        {f.title && <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.title}</p>}
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{f.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-10">
                    <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Үнэлгээ & Сэтгэгдэл</h3>
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-2">
                                <StarRow value={avgRating} size="sm" />
                                <span className="text-sm font-bold text-slate-800 dark:text-white">{avgRating.toFixed(1)}</span>
                                <span className="text-xs text-slate-400">({reviews.length})</span>
                            </div>
                        )}
                    </div>

                    {/* Review form */}
                    {user ? (
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 mb-8 border border-slate-100 dark:border-slate-800 max-w-lg">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                {myReview ? "Таны үнэлгээ засах" : "Үнэлгээ өгөх"}
                            </p>
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button key={n} type="button" onClick={() => setReviewRating(n)}
                                        onMouseEnter={() => setReviewHover(n)} onMouseLeave={() => setReviewHover(0)}
                                        className="transition-transform hover:scale-110 active:scale-95">
                                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                                fill={(reviewHover || reviewRating) >= n ? "#f59e0b" : "none"}
                                                stroke={(reviewHover || reviewRating) >= n ? "#f59e0b" : "#94a3b8"}
                                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                ))}
                                {reviewRating > 0 && (
                                    <span className="ml-2 self-center text-sm font-semibold text-amber-500">
                                        {["", "Муу", "Дунд", "Хэвийн", "Сайн", "Маш сайн"][reviewRating]}
                                    </span>
                                )}
                            </div>
                            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                                placeholder="Сэтгэгдэл бичих (заавал биш)..." rows={3}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-500/40 resize-none transition-all" />
                            <div className="flex justify-end gap-2 mt-3">
                                {myReview && (
                                    <button onClick={handleReviewDelete} className="px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-medium transition-colors">
                                        Устгах
                                    </button>
                                )}
                                <button onClick={handleReviewSubmit} disabled={reviewSubmitting || reviewRating === 0}
                                    className="px-5 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors">
                                    {myReview ? "Шинэчлэх" : "Илгээх"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 px-5 py-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 text-center max-w-lg">
                            Үнэлгээ өгөхийн тулд{" "}
                            <button onClick={openLogin} className="text-teal-500 font-semibold hover:underline">нэвтэрнэ үү</button>
                        </div>
                    )}

                    {/* Review list */}
                    {reviews.length === 0 ? (
                        <p className="text-sm text-slate-400 dark:text-slate-600 py-4">Одоогоор сэтгэгдэл байхгүй байна</p>
                    ) : (
                        <div className="space-y-5 max-w-2xl">
                            {reviews.map(r => (
                                <div key={r.id} className="flex gap-3">
                                    <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm uppercase flex-shrink-0">
                                        {r.user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-white">{r.user.name}</span>
                                            <StarRow value={r.rating} size="xs" />
                                            <span className="text-xs text-slate-400 ml-auto">{new Date(r.createdAt).toLocaleDateString("mn-MN")}</span>
                                        </div>
                                        {r.comment && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{r.comment}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StarRow({ value, size }: { value: number; size: "xs" | "sm" }) {
    const px = size === "xs" ? "w-3 h-3" : "w-4 h-4";
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <svg key={n} className={px} viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={value >= n ? "#f59e0b" : "none"}
                        stroke={value >= n - 0.5 ? "#f59e0b" : "#cbd5e1"}
                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ))}
        </div>
    );
}
