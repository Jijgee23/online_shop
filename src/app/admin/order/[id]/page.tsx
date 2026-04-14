"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Order, OrderStatus } from "@/interface/order";
import { useOrder } from "@/app/context/order_context";
import { getOrderStatusInfo } from "../components/AdminOrderTile";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import DropdownSelect from "@/ui/DropdownSelect";

const MapPicker = dynamic(() => import("@/app/components/MapPicker"), { ssr: false });

const PAYMENT_STATUS_MN: Record<string, string> = {
    PENDING:   "Хүлээгдэж буй",
    PAID:      "Төлөгдсөн",
    FAILED:    "Амжилтгүй",
    CANCELLED: "Цуцлагдсан",
    REFUNDED:  "Буцаагдсан",
};

// ─── Status pipeline config ────────────────────────────────────────────────────

const PIPELINE: { status: OrderStatus; label: string }[] = [
    { status: OrderStatus.PENDING,   label: "Хүлээгдэж буй" },
    { status: OrderStatus.PAID,      label: "Баталгаажсан" },
    { status: OrderStatus.SHIPPED,   label: "Хүргэлтэнд гарсан" },
    { status: OrderStatus.DELIVERED, label: "Хүргэгдсэн" },
];

const NEXT_STATUS_LABEL: Record<string, string> = {
    [OrderStatus.PENDING]:  "Баталгаажуулах",
    [OrderStatus.PAID]:     "Хүргэлтэнд гаргах",
    [OrderStatus.SHIPPED]:  "Хүргэгдсэн болгох",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const router  = useRouter();
    const { updateOrderStatus } = useOrder();

    const [order,         setOrder]         = useState<Order | null>(null);
    const [loading,       setLoading]       = useState(true);
    const [saving,        setSaving]        = useState(false);
    const [note,          setNote]          = useState("");
    const [noteChanged,   setNoteChanged]   = useState(false);
    const [showMap,       setShowMap]       = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<string>("");
    const [savingPayment, setSavingPayment] = useState(false);

    // ── Fetch order ────────────────────────────────────────────────────────────
    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/order/${id}`);
            const data = await res.json();
            if (res.ok) {
                setOrder(data.order);
                setNote(data.order.note ?? "");
                setPaymentStatus(data.order.payment?.status ?? "");
            } else {
                toast.error("Захиалга олдсонгүй");
                router.back();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const advanceStatus = async () => {
        if (!order) return;
        const idx  = PIPELINE.findIndex(s => s.status === order.status);
        const next = PIPELINE[idx + 1];
        if (!next) return;
        setSaving(true);
        const ok = await updateOrderStatus(order.id, next.status);
        if (ok) {
            setOrder(prev => prev ? { ...prev, status: next.status } : prev);
            toast.success(`Төлөв "${next.label}" болгов`);
        } else {
            toast.error("Алдаа гарлаа");
        }
        setSaving(false);
    };

    const cancelOrder = async () => {
        if (!order || !confirm("Энэ захиалгыг цуцлах уу?")) return;
        setSaving(true);
        const ok = await updateOrderStatus(order.id, OrderStatus.CANCELLED);
        if (ok) {
            setOrder(prev => prev ? { ...prev, status: OrderStatus.CANCELLED } : prev);
            toast.success("Захиалга цуцлагдлаа");
        } else {
            toast.error("Алдаа гарлаа");
        }
        setSaving(false);
    };

    const saveNote = async () => {
        if (!order) return;
        setSaving(true);
        const res = await fetch(`/api/admin/order/${order.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note }),
        });
        if (res.ok) {
            setNoteChanged(false);
            toast.success("Тэмдэглэл хадгалагдлаа");
        } else {
            toast.error("Алдаа гарлаа");
        }
        setSaving(false);
    };

    const updatePaymentStatus = async () => {
        if (!order || !paymentStatus) return;
        setSavingPayment(true);
        try {
            const res = await fetch(`/api/admin/order/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus }),
            });
            if (res.ok) {
                setOrder(prev => prev?.payment ? { ...prev, payment: { ...prev.payment, status: paymentStatus } } : prev);
                toast.success("Төлбөрийн төлөв шинэчлэгдлээ");
            } else {
                toast.error("Алдаа гарлаа");
            }
        } catch {
            toast.error("Алдаа гарлаа");
        } finally {
            setSavingPayment(false);
        }
    };

    // ── Loading / not found ────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500" />
            </div>
        );
    }

    if (!order) return null;

    const statusInfo  = getOrderStatusInfo(order.status);
    const pipelineIdx = PIPELINE.findIndex(s => s.status === order.status);
    const isFinal     = order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED;
    const nextLabel   = NEXT_STATUS_LABEL[order.status];

    return (
        <>
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-300">
            {/* Admin top bar */}
            <div className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-6 py-4 flex items-center gap-4">
                <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tighter">
                    ISHOP <span className="text-teal-500">ADMIN</span>
                </span>
                <span className="text-slate-500 dark:text-zinc-700">/</span>
                <button onClick={() => router.back()} className="text-slate-400 dark:text-zinc-500 hover:text-teal-400 text-sm transition-colors">
                    Захиалгууд
                </button>
                <span className="text-slate-500 dark:text-zinc-700">/</span>
                <span className="text-slate-500 dark:text-zinc-400 text-sm">{order.orderNumber?.toString()}</span>
            </div>
            <div className="max-w-7xl mx-auto p-6 md:p-10">
            {/* ── Back + title ── */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Захиалга #{order.orderNumber?.toString()}
                    </h2>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm">
                        {new Date(order.createdAt).toLocaleString("mn-MN")}
                    </p>
                </div>
                <span className={`ml-auto px-4 py-1.5 text-xs font-bold rounded-full border ${statusInfo.color}`}>
                    {statusInfo.name}
                </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ── Left: items + customer + address ── */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Order items */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                Бараанууд
                                <span className="ml-2 text-slate-400 dark:text-zinc-500 font-normal text-sm">({order.items?.length ?? 0} төрөл)</span>
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-zinc-800">
                            {order.items?.map(item => {
                                const img = item.product?.images?.[0]?.url;
                                return (
                                    <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 overflow-hidden flex-shrink-0">
                                            {img
                                                ? <img src={img} alt={item.product?.name} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-600 text-xs">—</div>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{item.product?.name ?? "—"}</p>
                                            <p className="text-slate-400 dark:text-zinc-500 text-xs">₮{item.price.toLocaleString()} × {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">
                                            ₮{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-slate-400 dark:text-zinc-500 text-sm">Нийт дүн</span>
                            <span className="text-xl font-bold text-teal-400">₮{order.totalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Customer info */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Хэрэглэгч</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 bg-teal-500/20 border border-teal-500/30 text-teal-400">
                                {order.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{order.user?.name}</p>
                                <p className="text-slate-400 dark:text-zinc-500 text-sm">{order.user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    {order.address && (
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white">Хүргэлтийн хаяг</h3>
                                {order.address.latitude && order.address.longitude && (
                                    <button
                                        onClick={() => setShowMap(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-500 text-xs font-bold transition-colors"
                                    >
                                        <MapPin className="w-3.5 h-3.5" />
                                        Газрын зураг
                                    </button>
                                )}
                            </div>
                            <div className="space-y-1.5 text-sm">
                                <Row label="Хот/Аймаг"   value={order.address.city} />
                                <Row label="Дүүрэг"      value={order.address.district?.name} />
                                <Row label="Хороо"       value={order.address.khoroo} />
                                <Row label="Дэлгэрэнгүй" value={order.address.detail} />
                                <Row label="Утас"        value={order.address.phone} />
                            </div>
                        </div>
                    )}

                    {/* Note */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Тэмдэглэл</h3>
                        <textarea
                            value={note}
                            onChange={e => { setNote(e.target.value); setNoteChanged(true); }}
                            rows={3}
                            placeholder="Тэмдэглэл нэмэх..."
                            className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none transition-all"
                        />
                        {noteChanged && (
                            <button
                                onClick={saveNote}
                                disabled={saving}
                                className="mt-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                Хадгалах
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Right: status + payment ── */}
                <div className="space-y-6">

                    {/* Status stepper */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Захиалгын явц</h3>

                        {order.status === OrderStatus.CANCELLED ? (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span className="text-red-400 font-bold text-sm">Захиалга цуцлагдсан</span>
                            </div>
                        ) : (
                            <div className="relative flex flex-col gap-0">
                                {PIPELINE.map((step, i) => {
                                    const done    = i < pipelineIdx;
                                    const current = i === pipelineIdx;
                                    return (
                                        <div key={step.status} className="flex items-start gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                                                    done    ? "bg-teal-500 border-teal-500"  :
                                                    current ? "bg-teal-500/20 border-teal-500" :
                                                              "bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                                                }`}>
                                                    {done ? (
                                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <div className={`w-2 h-2 rounded-full ${current ? "bg-teal-400" : "bg-slate-400 dark:bg-zinc-600"}`} />
                                                    )}
                                                </div>
                                                {i < PIPELINE.length - 1 && (
                                                    <div className={`w-0.5 h-8 mt-1 ${done ? "bg-teal-500" : "bg-slate-300 dark:bg-zinc-700"}`} />
                                                )}
                                            </div>
                                            <div className="pb-4">
                                                <p className={`text-sm font-semibold ${current ? "text-teal-400" : done ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-600"}`}>
                                                    {step.label}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Action buttons */}
                        {!isFinal && (
                            <div className="mt-4 flex flex-col gap-2">
                                {nextLabel && (
                                    <button
                                        onClick={advanceStatus}
                                        disabled={saving}
                                        className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-2xl transition-colors text-sm disabled:opacity-50"
                                    >
                                        {saving ? "Хадгалж байна..." : nextLabel}
                                    </button>
                                )}
                                <button
                                    onClick={cancelOrder}
                                    disabled={saving}
                                    className="w-full py-2.5 border border-red-800 text-red-400 hover:bg-red-500/10 font-bold rounded-2xl transition-colors text-sm disabled:opacity-50"
                                >
                                    Цуцлах
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Order summary */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Захиалгын дэлгэрэнгүй</h3>
                        <div className="space-y-2.5 text-sm">
                            <Row label="Дугаар"    value={order.orderNumber?.toString()} />
                            <Row label="Барааны тоо" value={`${order.totalCount} ширхэг`} />
                            <Row label="Нийт дүн"  value={`₮${order.totalPrice.toLocaleString()}`} bold />
                            <Row label="Огноо"     value={new Date(order.createdAt).toLocaleString("mn-MN")} />
                        </div>
                    </div>

                    {/* Payment */}
                    {order.payment && (
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Төлбөр</h3>
                            <div className="space-y-2.5 text-sm mb-4">
                                <Row label="Арга" value={order.payment.type === "ON_DELIVERY" ? "Хүргэлтийн үеэр" : order.payment.method} />
                                <Row label="Дүн"  value={`₮${order.payment.amount.toLocaleString()}`} bold />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Төлбөрийн төлөв</p>
                                <DropdownSelect
                                    value={paymentStatus}
                                    onChange={v => setPaymentStatus(v as string)}
                                    options={Object.entries(PAYMENT_STATUS_MN).map(([val, label]) => ({ id: val, label }))}
                                    searchable={false}
                                />
                                <button
                                    onClick={updatePaymentStatus}
                                    disabled={savingPayment || paymentStatus === order.payment.status}
                                    className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
                                >
                                    {savingPayment ? "Хадгалж байна..." : "Төлөв шинэчлэх"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>

        {showMap && order?.address?.latitude && order?.address?.longitude && (
            <MapPicker
                lat={order.address.latitude}
                lng={order.address.longitude}
                onClose={() => setShowMap(false)}
                readOnly
            />
        )}
        </>
    );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Row({ label, value, bold }: { label: string; value?: string | null; bold?: boolean }) {
    return (
        <div className="flex justify-between items-center gap-4">
            <span className="text-slate-400 dark:text-zinc-500">{label}</span>
            <span className={`text-right ${bold ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-zinc-300"}`}>{value ?? "—"}</span>
        </div>
    );
}
