"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Product, ProductReview } from "@/interface/product";
import { useCart } from "@/app/context/cart_context";
import { useWishlist } from "@/app/context/wishlist_context";
import { useAuth } from "@/app/context/auth_context";
import Header from "@/app/components/Header";
import { ArrowLeft, Loader2, Heart, CheckCircle2, Truck, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { imgUrl } from "@/utils/imgUrl";

export default function ProductDetail() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const { cart, add } = useCart();
    const { wishIds, toggleWish } = useWishlist();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const [product, setProduct] = useState<Product>();
    const [fetching, setFetching] = useState(false);
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

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
            if (prod.colors?.length > 0) setSelectedColor(String(prod.colors[0].hex));
            const sizes = prod.productSizes || prod.size;
            if (sizes?.length > 0) setSelectedSize(String(sizes[0].value));
        }
        setFetching(false);
    };

    useEffect(() => { fetchDetail(); }, []);

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

    const addCart = async () => {
        if (!product) return;
        if (!isAuthenticated) { router.push("/auth/login"); return; }
        add({ productId: Number(id), productQty: quantity, cartId: cart?.id ?? null });
    };

    if (fetching) return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
        </div>
    );

    if (!product) return <div className="p-20 text-center text-slate-500">Бараа олдсонгүй</div>;

    const productImages = product.images?.length > 0 ? product.images : [{ url: "/uploads/placeholder.png" }];
    const sizes = product.productSizes || product.sizes || [];
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const discountPct = hasDiscount ? Math.round((1 - product.discountPrice! / product.price) * 100) : 0;
    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const isWished = wishIds.includes(product.id);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 mb-20">

                    {/* LEFT: Gallery */}
                    <div className="flex gap-3">
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
                            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                                <img
                                    key={activeImgIndex}
                                    src={imgUrl(productImages[activeImgIndex].url)}
                                    alt={product.name}
                                    className="w-full h-full object-contain transition-opacity duration-300"
                                />
                            </div>
                            <button
                                onClick={() => router.back()}
                                className="absolute top-4 left-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:scale-105 transition-transform"
                            >
                                <ArrowLeft className="w-4 h-4 text-slate-800 dark:text-white" />
                            </button>
                            {hasDiscount && (
                                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                                    -{discountPct}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Info */}
                    <div className="flex flex-col">
                        {/* Category */}
                        <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-[0.15em] mb-2">
                            {product.category?.name || "Ангилалгүй"}
                        </span>

                        {/* Name */}
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug mb-3">
                            {product.name}
                        </h1>

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
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">₮{product.discountPrice!.toLocaleString()}</span>
                                    <span className="text-lg text-slate-400 line-through">₮{product.price.toLocaleString()}</span>
                                </>
                            ) : (
                                <span className="text-3xl font-black text-slate-900 dark:text-white">₮{product.price.toLocaleString()}</span>
                            )}
                        </div>

                        {/* Stock */}
                        <div className="mb-6">
                            {product.stock > 0 ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    Нөөцөд байна · {product.stock}ш
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                    Дууссан
                                </span>
                            )}
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-5">

                            {/* Color selector */}
                            {product.colors?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                        Өнгө: <span className="text-slate-800 dark:text-white font-semibold capitalize">
                                            {product.colors.find(c => String(c.hex) === selectedColor)?.name}
                                        </span>
                                    </p>
                                    <div className="flex flex-wrap gap-2.5">
                                        {product.colors.map(color => {
                                            const hex = String(color.hex);
                                            const active = selectedColor === hex;
                                            return (
                                                <button
                                                    key={color.id}
                                                    onClick={() => setSelectedColor(hex)}
                                                    title={String(color.name)}
                                                    style={{ backgroundColor: hex }}
                                                    className={`w-8 h-8 rounded-full transition-all ${active ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-950 scale-110" : "hover:scale-110 ring-1 ring-slate-200 dark:ring-slate-700"}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Size selector */}
                            {sizes.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Хэмжээ</p>
                                    <div className="flex flex-wrap gap-2">
                                        {sizes.map((s, idx) => {
                                            const val = String(s.value);
                                            const active = selectedSize === val;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedSize(val)}
                                                    className={`h-10 min-w-[42px] px-3 rounded-lg text-sm font-semibold border transition-all ${active
                                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                                                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white"
                                                    }`}
                                                >
                                                    {val}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quantity + Add to cart */}
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center gap-3">
                                    {/* Qty */}
                                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-11 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >−</button>
                                        <span className="w-10 text-center font-bold text-slate-900 dark:text-white text-sm">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                            disabled={quantity >= product.stock}
                                            className="w-10 h-11 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >+</button>
                                    </div>
                                    <span className="text-xs text-slate-400">Нийт: <span className="font-bold text-slate-700 dark:text-slate-200">₮{(product.price * quantity).toLocaleString()}</span></span>
                                </div>

                                {/* Add to cart */}
                                <button
                                    onClick={addCart}
                                    disabled={product.stock === 0}
                                    className="w-full h-13 py-3.5 bg-slate-900 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                                >
                                    {product.stock === 0 ? "Дууссан" : "Сагсанд нэмэх"}
                                </button>

                                {/* Wishlist */}
                                <button
                                    onClick={() => isAuthenticated ? toggleWish(product.id) : router.push("/auth/login")}
                                    title={isAuthenticated ? undefined : "Нэвтэрч орно уу"}
                                    className={`w-full h-11 py-3 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all
                                        ${!isAuthenticated ? "border-slate-200 dark:border-slate-700 text-slate-400 opacity-50 cursor-not-allowed"
                                            : isWished ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 text-red-500"
                                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"}`}
                                >
                                    <Heart className={`w-4 h-4 ${isAuthenticated && isWished ? "fill-red-500 text-red-500" : ""}`} />
                                    {isAuthenticated && isWished ? "Хадгалсан" : "Хадгалах"}
                                </button>
                            </div>

                            {/* Delivery + trust badges */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2.5">
                                    <Truck className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Хүргэлттэй</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2.5">
                                    <ShieldCheck className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Баталгаатай</span>
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
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{f.description}</p>
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
                            <a href="/auth/login" className="text-teal-500 font-semibold hover:underline">нэвтэрнэ үү</a>
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
