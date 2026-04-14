"use client";
import { useState, useEffect } from "react";
import { UserStatus } from "@/generated/prisma";
import { Customer } from "@/interface/user";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

const STATUS_CONFIG: Record<UserStatus, { label: string; cls: string }> = {
    [UserStatus.ACTIVE]:   { label: "Идэвхтэй",  cls: "bg-teal-500/10 border-teal-500/30 text-teal-400" },
    [UserStatus.NEW]:      { label: "Шинэ",       cls: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
    [UserStatus.INACTIVE]: { label: "Идэвхгүй",  cls: "bg-red-500/10  border-red-500/30  text-red-400"  },
};

const ORDER_STATUS_CLS: Record<string, string> = {
    PENDING:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    PAID:      "bg-teal-500/10   text-teal-400   border-teal-500/20",
    SHIPPED:   "bg-blue-500/10   text-blue-400   border-blue-500/20",
    DELIVERED: "bg-green-500/10  text-green-400  border-green-500/20",
    CANCELLED: "bg-red-500/10    text-red-400    border-red-500/20",
};

const ORDER_STATUS_LABEL: Record<string, string> = {
    PENDING: "Хүлээгдэж байна", PAID: "Төлөгдсөн",
    SHIPPED: "Илгээгдсэн", DELIVERED: "Хүргэгдсэн", CANCELLED: "Цуцлагдсан",
};

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"orders" | "addresses">("orders");

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/customer/${id}`);
            if (!res.ok) throw new Error();
            setCustomer(await res.json());
        } catch {
            toast.error("Хэрэглэгчийн мэдээлэл татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) fetchCustomer(); }, [id]);

    const handleStatusChange = async (status: UserStatus) => {
        if (!customer) return;
        const t = toast.loading("Төлөв өөрчлөж байна...");
        try {
            const res = await fetch(`/api/admin/customer/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error();
            setCustomer(prev => prev ? { ...prev, status } : prev);
            toast.success("Төлөв шинэчлэгдлээ", { id: t });
        } catch {
            toast.error("Алдаа гарлаа", { id: t });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-teal-500" />
        </div>
    );

    if (!customer) return (
        <div className="text-center py-24">
            <p className="text-slate-500 dark:text-zinc-400 text-lg mb-4">Хэрэглэгч олдсонгүй</p>
            <button onClick={() => router.back()} className="text-teal-400 hover:underline text-sm">← Буцах</button>
        </div>
    );

    const statusCfg = STATUS_CONFIG[customer.status];

    return (
        <div className="max-w-6xl mx-auto pb-20 pt-2">

            {/* Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 hover:text-teal-400 transition-colors mb-8 group text-sm"
            >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Хэрэглэгчид рүү буцах
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left column ── */}
                <div className="space-y-4">

                    {/* Profile card */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-600 to-blue-600 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg">
                                {customer.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">{customer.name}</h1>
                            <p className="text-slate-400 dark:text-zinc-500 text-xs font-mono mb-4">ID: #USR-{customer.id + 1000}</p>

                            {/* Status badge */}
                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${statusCfg.cls} mb-5`}>
                                {statusCfg.label}
                            </span>

                            {/* Contact info */}
                            <div className="w-full space-y-2 text-left">
                                <InfoRow icon="✉️" label="Имэйл" value={customer.email} />
                                <InfoRow icon="📞" label="Утас" value={customer.phone} />
                                <InfoRow icon="👤" label="Эрх" value={customer.role} />
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Дансны хураангуй</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-100 dark:bg-zinc-800/50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{customer.totalOrders}</p>
                                <p className="text-slate-400 dark:text-zinc-500 text-xs mt-1">Захиалга</p>
                            </div>
                            <div className="bg-slate-100 dark:bg-zinc-800/50 rounded-2xl p-4 text-center">
                                <p className="text-lg font-extrabold text-teal-400">₮{(customer.totalSpent ?? 0).toLocaleString()}</p>
                                <p className="text-slate-400 dark:text-zinc-500 text-xs mt-1">Нийт зарцуулалт</p>
                            </div>
                        </div>
                    </div>

                    {/* Status change */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Төлөв өөрчлөх</h3>
                        <div className="space-y-2">
                            {(Object.keys(STATUS_CONFIG) as UserStatus[]).map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    disabled={customer.status === s}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all border
                                        ${customer.status === s
                                            ? `${STATUS_CONFIG[s].cls} cursor-default`
                                            : "border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                >
                                    {STATUS_CONFIG[s].label}
                                    {customer.status === s && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right column ── */}
                <div className="lg:col-span-2">

                    {/* Tabs */}
                    <div className="flex gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-1 mb-5">
                        {(["orders", "addresses"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                                    ${tab === t ? "bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"}`}
                            >
                                {t === "orders" ? `Захиалгууд (${customer.orders?.length ?? 0})` : "Хаягууд"}
                            </button>
                        ))}
                    </div>

                    {/* Orders tab */}
                    {tab === "orders" && (
                        <>
                            {!customer.orders?.length ? (
                                <EmptyState
                                    icon="📦"
                                    title="Захиалгын түүх хоосон"
                                    desc="Энэ хэрэглэгч одоогоор ямар нэгэн захиалга хийгээгүй байна."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {customer.orders.map((order: any) => {
                                        const statusCls = ORDER_STATUS_CLS[order.status] ?? "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-300 dark:border-zinc-700";
                                        const statusLabel = ORDER_STATUS_LABEL[order.status] ?? order.status;
                                        return (
                                            <div key={order.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-2xl p-5 transition-all">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-teal-500 flex-shrink-0">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 118 0v4M5 9h14l1 12H4L5 9z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-900 dark:text-white font-bold text-sm">
                                                                {order.orderNumber || `#ORD-${order.id}`}
                                                            </p>
                                                            <p className="text-slate-400 dark:text-zinc-500 text-xs">
                                                                {new Date(order.createdAt).toLocaleDateString("mn-MN")}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <p className="text-slate-900 dark:text-white font-bold text-sm hidden sm:block font-mono">
                                                            ₮{order.totalPrice?.toLocaleString()}
                                                        </p>
                                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${statusCls}`}>
                                                            {statusLabel}
                                                        </span>
                                                        <button
                                                            onClick={() => router.push(`/admin/order/${order.id}`)}
                                                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-teal-500/20 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-teal-400 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* Addresses tab */}
                    {tab === "addresses" && (
                        <>
                            {!(customer as any).addresses?.length ? (
                                <EmptyState icon="📍" title="Хаяг бүртгэлгүй" desc="Энэ хэрэглэгч хаяг бүртгээгүй байна." />
                            ) : (
                                <div className="space-y-3">
                                    {(customer as any).addresses.map((addr: any, i: number) => (
                                        <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 flex-shrink-0 mt-0.5">
                                                        📍
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-900 dark:text-white font-semibold text-sm">
                                                            {addr.city}, {addr.district}, {addr.khoroo}-р хороо
                                                        </p>
                                                        <p className="text-slate-400 dark:text-zinc-500 text-xs mt-0.5">{addr.detail}</p>
                                                        <p className="text-slate-400 dark:text-zinc-500 text-xs mt-1">📞 {addr.phone}</p>
                                                    </div>
                                                </div>
                                                {addr.isMain && (
                                                    <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded-lg flex-shrink-0">
                                                        Үндсэн
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800/40 rounded-xl">
            <span className="text-sm w-5 text-center flex-shrink-0">{icon}</span>
            <div className="overflow-hidden">
                <p className="text-[10px] text-slate-400 dark:text-zinc-600 uppercase tracking-wider">{label}</p>
                <p className="text-sm text-slate-700 dark:text-zinc-200 truncate">{value}</p>
            </div>
        </div>
    );
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 flex flex-col items-center text-center">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-400 dark:text-zinc-500 text-sm max-w-xs leading-relaxed">{desc}</p>
        </div>
    );
}
