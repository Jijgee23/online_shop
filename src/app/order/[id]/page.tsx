"use client";

import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, MapPin, Package, CreditCard, CheckCircle2,
    Clock, Truck, Ban, AlertCircle, ShieldCheck, Sparkles,
    PhoneCall, Copy, Check
} from "lucide-react";
import { useOrder } from "@/app/context/order_context";
import Header from "@/app/components/Header";
import { Order, OrderStatus } from "@/interface/order";
import { useState } from "react";
import toast from "react-hot-toast";

// ─── Pipeline config ──────────────────────────────────────────────────────────

const PIPELINE = [
    {
        status: OrderStatus.PENDING,
        label: "Хүлээгдэж буй",
        sub: "Захиалга хүлээн авлаа",
        icon: Clock,
        color: "amber",
    },
    {
        status: OrderStatus.PAID,
        label: "Баталгаажсан",
        sub: "Төлбөр баталгаажлаа",
        icon: ShieldCheck,
        color: "teal",
    },
    {
        status: OrderStatus.SHIPPED,
        label: "Хүргэлтэнд гарсан",
        sub: "Таны багц замдаа байна",
        icon: Truck,
        color: "blue",
    },
    {
        status: OrderStatus.DELIVERED,
        label: "Хүргэгдсэн",
        sub: "Амжилттай хүргэгдлээ",
        icon: CheckCircle2,
        color: "green",
    },
] as const;

const STATUS_META: Record<string, { label: string; dot: string; badge: string; hero: string }> = {
    PENDING:   { label: "Хүлээгдэж буй",     dot: "bg-amber-400",  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700",   hero: "from-amber-500/10 to-amber-600/5" },
    PAID:      { label: "Баталгаажсан",       dot: "bg-teal-400",   badge: "bg-teal-100  text-teal-700  dark:bg-teal-900/40  dark:text-teal-300  border-teal-200  dark:border-teal-700",     hero: "from-teal-500/10 to-teal-600/5"  },
    SHIPPED:   { label: "Хүргэлтэнд гарсан", dot: "bg-blue-400",   badge: "bg-blue-100  text-blue-700  dark:bg-blue-900/40  dark:text-blue-300  border-blue-200  dark:border-blue-700",     hero: "from-blue-500/10 to-blue-600/5"  },
    DELIVERED: { label: "Хүргэгдсэн",        dot: "bg-green-400",  badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700",   hero: "from-green-500/10 to-green-600/5"},
    CANCELLED: { label: "Цуцлагдсан",        dot: "bg-red-400",    badge: "bg-red-100   text-red-700   dark:bg-red-900/40   dark:text-red-300   border-red-200   dark:border-red-700",      hero: "from-red-500/10 to-red-600/5"    },
};

// ─── Horizontal stepper ───────────────────────────────────────────────────────

function StatusTrack({ status }: { status: string }) {
    if (status === "CANCELLED") {
        return (
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                    <Ban className="w-5 h-5 text-red-500" />
                </div>
                <div>
                    <p className="font-bold text-red-700 dark:text-red-400">Захиалга цуцлагдсан</p>
                    <p className="text-xs text-red-400 mt-0.5">Энэ захиалга цуцлагдсан тул ямар нэгэн үйлдэл хийх боломжгүй</p>
                </div>
            </div>
        );
    }

    const currentIdx = PIPELINE.findIndex(s => s.status === status);

    return (
        <div className="relative">
            {/* Track line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
            {/* Filled track */}
            <div
                className="absolute top-5 left-5 h-0.5 bg-teal-500 z-0 transition-all duration-700"
                style={{ width: currentIdx === 0 ? "0%" : `${(currentIdx / (PIPELINE.length - 1)) * 100}%` }}
            />

            <div className="relative z-10 flex justify-between">
                {PIPELINE.map((step, idx) => {
                    const done    = idx < currentIdx;
                    const current = idx === currentIdx;
                    const Icon    = step.icon;

                    return (
                        <div key={step.status} className="flex flex-col items-center gap-2 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                done    ? "bg-teal-500 text-white shadow-md shadow-teal-500/30"
                                : current ? "bg-teal-500 text-white ring-4 ring-teal-500/25 shadow-lg shadow-teal-500/40 scale-110"
                                :           "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                            }`}>
                                {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <div className="text-center">
                                <p className={`text-[11px] font-bold leading-tight ${
                                    current ? "text-teal-600 dark:text-teal-400"
                                    : done  ? "text-slate-600 dark:text-slate-400"
                                    :         "text-slate-400 dark:text-slate-600"
                                }`}>{step.label}</p>
                                {current && (
                                    <p className="text-[10px] text-teal-400 mt-0.5 hidden sm:block">{step.sub}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button onClick={copy} className="ml-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
        </button>
    );
}

// ─── Cancel confirm panel ─────────────────────────────────────────────────────

function CancelPanel({ onConfirm, onClose, loading }: { onConfirm: () => void; onClose: () => void; loading: boolean }) {
    return (
        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-5 space-y-4">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold text-red-700 dark:text-red-400 text-sm">Захиалга цуцлах уу?</p>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        Цуцалсан захиалгыг сэргээх боломжгүй. Барааны нөөц буцаан нэмэгдэнэ.
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {loading
                        ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Цуцалж байна...</>
                        : <><Ban className="w-4 h-4" /> Тийм, цуцлах</>}
                </button>
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                    Болих
                </button>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
    const { id }   = useParams();
    const router   = useRouter();
    const { orders, fetchOrder } = useOrder();

    const [localStatus,  setLocalStatus]  = useState<string | null>(null);
    const [cancelling,   setCancelling]   = useState(false);
    const [showConfirm,  setShowConfirm]  = useState(false);

    const base   = orders.find(o => o.id === Number(id));
    const order  = base ? { ...base, status: (localStatus ?? base.status) as OrderStatus } : null;

    // ── not found ─────────────────────────────────────────────────────────────
    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center dark:bg-slate-950">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-slate-500 mb-6 text-lg font-medium">Захиалга олдсонгүй</p>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-teal-500 font-bold hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" /> Буцах
                </button>
            </div>
        );
    }

    const meta         = STATUS_META[order.status] ?? STATUS_META.PENDING;
    const isCancellable = order.status === OrderStatus.PENDING;
    const createdAt    = new Date(order.createdAt);
    const dateStr      = `${createdAt.getFullYear()}/${String(createdAt.getMonth()+1).padStart(2,"0")}/${String(createdAt.getDate()).padStart(2,"0")}`;

    const doCancel = async () => {
        setCancelling(true);
        try {
            const res = await fetch(`/api/order/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" }),
            });
            const data = await res.json();
            if (res.ok) {
                setLocalStatus("CANCELLED");
                setShowConfirm(false);
                await fetchOrder();
                toast.success("Захиалга амжилттай цуцлагдлаа");
            } else {
                toast.error(data.message ?? "Алдаа гарлаа");
            }
        } catch {
            toast.error("Алдаа гарлаа");
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-24">
            <Header />

            {/* ── Hero strip ──────────────────────────────────────────────────── */}
            <div className={`bg-gradient-to-br ${meta.hero} border-b border-slate-200 dark:border-slate-800`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-500 transition-colors mb-5 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Захиалгуудруу буцах
                    </button>

                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Захиалгын дугаар</p>
                            <div className="flex items-center gap-1">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-wider">
                                    {String(order.orderNumber)}
                                </h1>
                                <CopyBtn value={String(order.orderNumber)} />
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{dateStr}</p>
                        </div>

                        <span className={`mt-1 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${meta.badge}`}>
                            <span className={`w-2 h-2 rounded-full ${meta.dot} ${order.status === "PENDING" ? "animate-pulse" : ""}`} />
                            {meta.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Main content ────────────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">

                {/* Status track */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-900 dark:text-white">Захиалгын явц</h2>
                        {order.status === "DELIVERED" && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
                                <Sparkles className="w-3.5 h-3.5" /> Амжилттай!
                            </span>
                        )}
                    </div>
                    <StatusTrack status={order.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Items */}
                    <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <Package className="w-4 h-4 text-teal-500" />
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                Захиалсан бараанууд · {order.items?.length ?? 0}
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {order.items?.map(item => (
                                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                                        {item.product?.images?.[0]?.url
                                            ? <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{item.product?.name ?? "Бараа"}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{item.quantity} ширхэг  ×  ₮{Number(item.price).toLocaleString()}</p>
                                    </div>
                                    <p className="font-extrabold text-slate-900 dark:text-white text-sm flex-shrink-0">
                                        ₮{(Number(item.price) * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {/* Total row */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-sm text-slate-500">{order.totalCount} бараа · Нийт</span>
                            <span className="text-xl font-extrabold text-slate-900 dark:text-white">₮{Number(order.totalPrice).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Address */}
                    {order.address ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-4 h-4 text-teal-500" />
                                <h3 className="font-bold text-slate-900 dark:text-white">Хүргэлтийн хаяг</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {[order.address.city, order.address.district + " дүүрэг", order.address.khoroo + " хороо"].map((t, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg">{t}</span>
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{order.address.detail}</p>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <PhoneCall className="w-3.5 h-3.5 text-teal-500" />
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{order.address.phone}</span>
                                    <CopyBtn value={order.address.phone} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-6 flex items-center justify-center">
                            <p className="text-sm text-slate-400">Хаяг бүртгэгдээгүй</p>
                        </div>
                    )}

                    {/* Payment */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-4 h-4 text-teal-500" />
                            <h3 className="font-bold text-slate-900 dark:text-white">Төлбөрийн мэдээлэл</h3>
                        </div>
                        {order.payment ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Төлбөрийн арга</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs">
                                        {order.payment.method}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Төлбөрийн төлөв</span>
                                    <span className={`font-bold text-xs px-2.5 py-1 rounded-full ${
                                        order.payment.status === "PAID"
                                            ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                                            : order.payment.status === "FAILED"
                                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                            : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                    }`}>
                                        {order.payment.status === "PAID"    && "✓ Төлөгдсөн"}
                                        {order.payment.status === "PENDING" && "⏳ Хүлээгдэж буй"}
                                        {order.payment.status === "FAILED"  && "✕ Амжилтгүй"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-400 text-sm">Нийт дүн</span>
                                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">₮{Number(order.payment.amount).toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-4">Төлбөрийн мэдээлэл байхгүй</p>
                        )}
                    </div>

                    {/* Note */}
                    {order.note && (
                        <div className="md:col-span-2 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-800/50 p-5">
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">Тэмдэглэл</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{String(order.note)}</p>
                        </div>
                    )}

                    {/* Cancel section */}
                    {isCancellable && (
                        <div className="md:col-span-2">
                            {showConfirm ? (
                                <CancelPanel
                                    onConfirm={doCancel}
                                    onClose={() => setShowConfirm(false)}
                                    loading={cancelling}
                                />
                            ) : (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-red-300 dark:border-red-800 text-red-500 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-400 transition-all"
                                >
                                    <Ban className="w-4 h-4" />
                                    Захиалга цуцлах
                                </button>
                            )}
                        </div>
                    )}

                    {/* Non-cancellable info */}
                    {!isCancellable && order.status !== "CANCELLED" && (
                        <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl text-xs text-slate-500 dark:text-slate-400">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 text-slate-400" />
                            Захиалга баталгаажсаны дараа цуцлах боломжгүй. Асуулт байвал дэлгүүртэй холбоо барина уу.
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
