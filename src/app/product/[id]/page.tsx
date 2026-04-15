"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Product, ProductReview } from "@/interface/product";
import { useCart } from "@/app/context/cart_context";
import { useWishlist } from "@/app/context/wishlist_context";
import { useAuth } from "@/app/context/auth_context";
import Header from "@/app/components/Header";
import { ArrowLeft, Loader2, Heart, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

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

    // ── Reviews ───────────────────────────────────────────────────────────────
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

            // Pre-fill my review if exists
            const mine = (prod.reviews ?? []).find((r: ProductReview) => String(r.userId) === String(user?.id));
            if (mine) {
                setReviewRating(mine.rating);
                setReviewComment(mine.comment ?? "");
            }

            if (prod.colors?.length > 0) setSelectedColor(String(prod.colors[0].hex));
            const sizes = prod.productSizes || prod.size;
            if (sizes?.length > 0) setSelectedSize(String(sizes[0].value));
        }
        setFetching(false);
    };

    useEffect(() => { fetchDetail() }, []);

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
            setReviews(prev => {
                const filtered = prev.filter(r => r.id !== data.id);
                return [data, ...filtered];
            });
        } finally {
            setReviewSubmitting(false);
        }
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
            setReviewRating(0);
            setReviewComment("");
        } catch {
            toast.error("Алдаа гарлаа", { id: t });
        }
    };

    const addCart = async () => {
        if (!product) return;
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }
        add({
            productId: Number(id),
            productQty: quantity,
            cartId: cart?.id ?? null,
        });
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
            </div>
        );
    }

    if (!product) return <div className="p-20 text-center">Бараа олдсонгүй</div>;

    const productImages = product.images && product.images.length > 0
        ? product.images
        : [{ url: "/uploads/placeholder.png" }];

    const sizes = product.productSizes || product.sizes || [];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col lg:flex-row pt-16">
            <Header />

            {/* ЗҮҮН ТАЛ: Галлерей */}
            <section className="relative w-full lg:w-1/2 h-[60vh] lg:h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden flex flex-col">
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
                </button>

                <div className="flex-1 w-full relative overflow-hidden group">
                    <img
                        key={activeImgIndex}
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${productImages[activeImgIndex].url}`}
                        alt={product.name}
                        className="w-full h-full object-contain transition-all duration-500"
                    />
                </div>

                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-6 z-10">
                    <div className="flex gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                        {productImages.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveImgIndex(idx)}
                                className={`relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${activeImgIndex === idx ? "border-teal-500 scale-105" : "border-transparent opacity-60"}`}
                            >
                                <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${img.url}`} className="w-full h-full object-cover" alt="thumb" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* БАРУУН ТАЛ: Мэдээлэл */}
            <section className="w-full lg:w-1/2 overflow-y-auto px-6 py-10 lg:px-16 lg:py-20 flex flex-col">
                <div className="max-w-xl mx-auto w-full">
                    <span className="text-teal-600 dark:text-teal-400 font-bold tracking-widest text-sm uppercase mb-2 block">
                        {product.category?.name || "Ангилалгүй"}
                    </span>

                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-8">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                            ₮{product.price.toLocaleString()}
                        </p>
                        {product.stock > 0 ? (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-md font-bold uppercase">Нөөцөд байгаа</span>
                        ) : (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold uppercase">Дууссан</span>
                        )}
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 leading-relaxed">
                        {product.description}
                    </p>

                    <div className="space-y-10">
                        {/* ӨНГӨ СОНГОХ */}
                        {product.colors?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-4 flex items-center gap-2">
                                    Өнгө: <span className="text-slate-400 font-medium capitalize">
                                        {product.colors.find(c => String(c.hex) === selectedColor)?.name}
                                    </span>
                                </h4>
                                <div className="flex gap-4">
                                    {product.colors.map((color) => {
                                        const hexValue = String(color.hex);
                                        const isSelected = selectedColor === hexValue;
                                        return (
                                            <button
                                                key={color.id}
                                                onClick={() => setSelectedColor(hexValue)}
                                                className={`group relative w-10 h-10 rounded-full transition-all flex items-center justify-center ${isSelected ? "ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-950 shadow-lg" : "hover:scale-110"}`}
                                                style={{ backgroundColor: hexValue }}
                                                title={String(color.name)}
                                            >
                                                {isSelected && (
                                                    <div className={`w-2 h-2 rounded-full ${hexValue.toLowerCase() === '#ffffff' ? 'bg-black' : 'bg-white'}`} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ХЭМЖЭЭ СОНГОХ */}
                        {sizes.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-4">Хэмжээ сонгох</h4>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map((s, idx) => {
                                        const val = String(s.value);
                                        const isSelected = selectedSize === val;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedSize(val)}
                                                className={`min-w-[50px] px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${isSelected
                                                    ? "border-teal-500 bg-teal-500 text-white shadow-md"
                                                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-teal-500"
                                                }`}
                                            >
                                                {val}
                                                <span className={`block text-[10px] font-normal ${isSelected ? "text-teal-100" : "opacity-70"}`}>{s.sizeName}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ТОО ШИРХЭГ & САГС */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            <div className="flex items-center border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 bg-slate-50 dark:bg-slate-900">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-xl font-bold dark:text-white hover:text-teal-500 transition">−</button>
                                <span className="w-10 text-center font-bold text-lg dark:text-white">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock} className="w-10 h-10 flex items-center justify-center text-xl font-bold dark:text-white hover:text-teal-500 transition disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                            </div>

                            <button
                                onClick={addCart}
                                className="flex-1 w-full bg-slate-900 dark:bg-teal-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                Сагсанд нэмэх ₮{(product.price * quantity).toLocaleString()}
                            </button>

                            <button
                                onClick={() => toggleWish(product.id)}
                                className={`p-5 rounded-2xl border-2 transition-all active:scale-95
                                    ${wishIds.includes(product.id)
                                        ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                            >
                                <Heart className={`w-6 h-6 transition-colors ${wishIds.includes(product.id) ? "fill-red-500 text-red-500" : "text-slate-600 dark:text-white"}`} />
                            </button>
                        </div>

                        {/* FEATURES */}
                        {product.features?.length > 0 && (
                            <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-6 tracking-widest">Бүтээгдэхүүний давуу тал</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                    {product.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3 group">
                                            <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-500 transition-colors">{feature.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{feature.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* REVIEWS */}
                        <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Үнэлгээ & Сэтгэгдэл</h4>
                                {reviews.length > 0 && (() => {
                                    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                                    return (
                                        <div className="flex items-center gap-2">
                                            <StarRow value={avg} size="sm" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-white">{avg.toFixed(1)}</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">({reviews.length})</span>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Form */}
                            {user ? (
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 mb-8 border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                        {myReview ? "Таны үнэлгээ засах" : "Үнэлгээ өгөх"}
                                    </p>
                                    {/* Star picker */}
                                    <div className="flex gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setReviewRating(n)}
                                                onMouseEnter={() => setReviewHover(n)}
                                                onMouseLeave={() => setReviewHover(0)}
                                                className="transition-transform hover:scale-110 active:scale-95"
                                            >
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                                                    <path
                                                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                                        fill={(reviewHover || reviewRating) >= n ? "#f59e0b" : "none"}
                                                        stroke={(reviewHover || reviewRating) >= n ? "#f59e0b" : "#94a3b8"}
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </button>
                                        ))}
                                        {reviewRating > 0 && (
                                            <span className="ml-2 self-center text-sm font-semibold text-amber-500">
                                                {["", "Муу", "Дунд зэрэг", "Хэвийн", "Сайн", "Маш сайн"][reviewRating]}
                                            </span>
                                        )}
                                    </div>
                                    {/* Comment */}
                                    <textarea
                                        value={reviewComment}
                                        onChange={e => setReviewComment(e.target.value)}
                                        placeholder="Сэтгэгдэл бичих (заавал биш)..."
                                        rows={3}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60 resize-none transition-all"
                                    />
                                    <div className="flex justify-end gap-2 mt-3">
                                        {myReview && (
                                            <button
                                                onClick={handleReviewDelete}
                                                className="px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-medium transition-colors"
                                            >
                                                Устгах
                                            </button>
                                        )}
                                        <button
                                            onClick={handleReviewSubmit}
                                            disabled={reviewSubmitting || reviewRating === 0}
                                            className="px-5 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors"
                                        >
                                            {myReview ? "Шинэчлэх" : "Илгээх"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-8 px-5 py-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 text-center">
                                    Үнэлгээ өгөхийн тулд{" "}
                                    <a href="/auth/login" className="text-teal-500 font-semibold hover:underline">нэвтэрнэ үү</a>
                                </div>
                            )}

                            {/* Review list */}
                            {reviews.length === 0 ? (
                                <p className="text-sm text-slate-400 dark:text-slate-600 text-center py-6">Одоогоор сэтгэгдэл байхгүй байна</p>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map(r => (
                                        <div key={r.id} className="flex gap-3">
                                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm uppercase">
                                                {r.user.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{r.user.name}</span>
                                                    <StarRow value={r.rating} size="xs" />
                                                    <span className="text-xs text-slate-400 dark:text-slate-600 ml-auto">
                                                        {new Date(r.createdAt).toLocaleDateString("mn-MN")}
                                                    </span>
                                                </div>
                                                {r.comment && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{r.comment}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// ── Star row helper ──────────────────────────────────────────────────────────

function StarRow({ value, size }: { value: number; size: "xs" | "sm" }) {
    const px = size === "xs" ? "w-3 h-3" : "w-4 h-4";
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <svg key={n} className={px} viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={value >= n ? "#f59e0b" : value >= n - 0.5 ? "url(#half)" : "none"}
                        stroke={value >= n - 0.5 ? "#f59e0b" : "#cbd5e1"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ))}
        </div>
    );
}