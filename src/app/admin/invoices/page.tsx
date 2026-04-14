"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import Pagination from "@/ui/Pagination";
import { usePersistedPage } from "@/app/hooks/usePersistedPage";
import DropdownSelect from "@/ui/DropdownSelect";
import DateRangePicker from "@/ui/DateRangePicker";

const PAGE_SIZE = 20;

const HAS_ORDER_OPTIONS = [
    { id: "",    label: "Бүгд" },
    { id: "yes", label: "Захиалга үүссэн" },
    { id: "no",  label: "Захиалга үүсээгүй" },
];

function statusBadge(inv: any) {
    if (inv.orderId) return { cls: "bg-teal-500/10 text-teal-400 border border-teal-500/20", label: "Баталгаажсан" };
    const expired = inv.expiryDate && new Date(inv.expiryDate) < new Date();
    if (expired)    return { cls: "bg-red-500/10 text-red-400 border border-red-500/20",   label: "Хугацаа дууссан" };
    return           { cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20",  label: "Хүлээгдэж байна" };
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function InvoiceDrawer({ invoiceId, onClose }: { invoiceId: string; onClose: () => void }) {
    const [data, setData]       = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`/api/admin/invoice?invoiceId=${encodeURIComponent(invoiceId)}`)
            .then(r => r.json())
            .then(d => {
                if (d.error) setError(d.error);
                else setData(d);
            })
            .catch(() => setError("Холболтын алдаа гарлаа"))
            .finally(() => setLoading(false));
    }, [invoiceId]);

    const qpay = data?.qpay;
    const db   = data?.db;

    const payments: any[] = qpay?.payments ?? [];
    const paidRows = payments.filter((p: any) => p.payment_status === "PAID");

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-white dark:bg-zinc-900 shadow-2xl overflow-y-auto flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invoice дэлгэрэнгүй</h3>
                        <p className="font-mono text-xs text-teal-400 mt-0.5 truncate max-w-72">{invoiceId}</p>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1">
                    {loading && (
                        <div className="flex justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {data && (
                        <>
                            {/* QR Code */}
                            {(qpay?.qr_text || db?.qrText) && (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-inner">
                                        <QRCode
                                            value={qpay?.qr_text ?? db?.qrText}
                                            size={160}
                                            bgColor="#ffffff"
                                            fgColor="#0f172a"
                                            level="M"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">QPay QR код</p>
                                </div>
                            )}

                            {/* QPay invoice info */}
                            <Section title="QPay мэдээлэл">
                                <Row label="Invoice код"     value={qpay?.invoice_code ?? "—"} />
                                <Row label="Sender no"       value={qpay?.sender_invoice_no ?? db?.senderInvoiceNo ?? "—"} mono />
                                <Row label="Тайлбар"         value={qpay?.invoice_description ?? db?.description ?? "—"} />
                                <Row label="Дүн"             value={`₮${Number(qpay?.amount ?? db?.amount ?? 0).toLocaleString()}`} bold />
                                <Row label="Мөнгөн тэмдэгт" value={qpay?.invoice_currency_code ?? "MNT"} />
                                <Row label="Үүссэн огноо"   value={qpay?.created_date ? new Date(qpay.created_date).toLocaleString("mn-MN") : (db?.createdAt ? new Date(db.createdAt).toLocaleString("mn-MN") : "—")} />
                                <Row label="Дуусах огноо"   value={qpay?.expire_date ? new Date(qpay.expire_date).toLocaleString("mn-MN") : (db?.expiryDate ? new Date(db.expiryDate).toLocaleString("mn-MN") : "—")} />
                            </Section>

                            {/* Payment rows from QPay */}
                            <Section title={`Төлбөрийн бүртгэл ${payments.length ? `(${payments.length})` : ""}`}>
                                {payments.length === 0 ? (
                                    <p className="text-sm text-slate-400 dark:text-zinc-500 py-2">Төлбөр бүртгэгдээгүй байна</p>
                                ) : (
                                    <div className="space-y-2">
                                        {payments.map((p: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/40 rounded-xl px-4 py-3">
                                                <div>
                                                    <p className="font-mono text-xs text-slate-600 dark:text-zinc-300">{p.payment_id}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {p.payment_type ?? "—"} · {p.paid_date ? new Date(p.paid_date).toLocaleString("mn-MN") : "—"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-sm text-slate-900 dark:text-white">₮{Number(p.payment_amount ?? 0).toLocaleString()}</p>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                                        ${p.payment_status === "PAID"
                                                            ? "bg-teal-500/10 text-teal-400"
                                                            : "bg-amber-500/10 text-amber-400"}`}>
                                                        {p.payment_status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Section>

                            {/* Bank app URLs */}
                            {(qpay?.urls ?? db?.paymentUrls) && (
                                <Section title="Банкны апп холбоосууд">
                                    <div className="grid grid-cols-2 gap-2">
                                        {((qpay?.urls ?? db?.paymentUrls) as any[]).map((u: any, i: number) => (
                                            <a key={i} href={u.link ?? u.url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/40 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-slate-200 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-700 rounded-xl px-3 py-2.5 transition-all">
                                                <span className="text-xs font-medium text-slate-700 dark:text-zinc-200 truncate">{u.name}</span>
                                                <svg className="w-3 h-3 text-slate-400 flex-shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Our DB record */}
                            <Section title="Системийн мэдээлэл">
                                <Row label="Cart ID"   value={db?.cartId ? String(db.cartId) : "—"} mono />
                                <Row label="Address ID" value={db?.addressId ? String(db.addressId) : "—"} mono />
                                {db?.order ? (
                                    <>
                                        <Row label="Захиалга"    value={db.order.orderNumber} mono bold />
                                        <Row label="Хэрэглэгч"  value={`${db.order.user?.name ?? "—"} (${db.order.user?.email ?? ""})`} />
                                        <Row label="Нийт дүн"   value={`₮${Number(db.order.totalPrice ?? 0).toLocaleString()}`} bold />
                                    </>
                                ) : (
                                    <Row label="Захиалга" value="Үүсээгүй" />
                                )}
                                {paidRows.length > 0 && (
                                    <Row label="Нийт төлсөн"
                                        value={`₮${paidRows.reduce((s: number, p: any) => s + Number(p.payment_amount ?? 0), 0).toLocaleString()}`}
                                        bold />
                                )}
                            </Section>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">{title}</h4>
            <div className="bg-slate-50 dark:bg-zinc-800/40 rounded-2xl p-4 space-y-2.5">
                {children}
            </div>
        </div>
    );
}

function Row({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
    return (
        <div className="flex justify-between items-start gap-3 text-sm">
            <span className="text-slate-400 dark:text-zinc-500 flex-shrink-0">{label}</span>
            <span className={`text-right break-all ${mono ? "font-mono text-xs" : ""} ${bold ? "font-bold text-slate-900 dark:text-white" : "text-slate-700 dark:text-zinc-300"}`}>
                {value}
            </span>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminInvoicesPage() {
    const [invoices,       setInvoices]       = useState<any[]>([]);
    const [total,          setTotal]          = useState(0);
    const [loading,        setLoading]        = useState(false);
    const [search,         setSearch]         = useState("");
    const [hasOrder,       setHasOrder]       = useState("");
    const [dateFrom,       setDateFrom]       = useState("");
    const [dateTo,         setDateTo]         = useState("");
    const [selectedInvId,  setSelectedInvId]  = useState<string | null>(null);

    const [page, setPage] = usePersistedPage("admin:invoices:page", [search, hasOrder, dateFrom, dateTo]);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const q = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (search)   q.set("search",   search);
        if (hasOrder) q.set("hasOrder", hasOrder);
        if (dateFrom) q.set("dateFrom", dateFrom);
        if (dateTo)   q.set("dateTo",   dateTo);
        try {
            const res = await fetch(`/api/admin/invoice?${q}`);
            const d   = await res.json();
            if (res.ok) { setInvoices(d.data ?? []); setTotal(d.total ?? 0); }
        } finally { setLoading(false); }
    }, [page, search, hasOrder, dateFrom, dateTo]);

    useEffect(() => { fetch_(); }, [fetch_]);

    const confirmed = invoices.filter(i => i.orderId).length;
    const pending   = invoices.filter(i => !i.orderId && !(i.expiryDate && new Date(i.expiryDate) < new Date())).length;
    const expired   = invoices.filter(i => !i.orderId && i.expiryDate && new Date(i.expiryDate) < new Date()).length;

    return (
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">QPay Invoice</h2>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm">
                        Нийт <span className="text-white font-semibold">{total}</span> invoice
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto flex-wrap items-center">
                    <div className="relative group flex-1 min-w-56">
                        <input
                            type="text" placeholder="Invoice ID, sender no..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <DropdownSelect
                        value={hasOrder}
                        onChange={id => setHasOrder(String(id))}
                        options={HAS_ORDER_OPTIONS}
                        searchable={false}
                        placeholder="Бүгд"
                    />
                    <DateRangePicker
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
                    />
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {[
                    { label: "Баталгаажсан",    value: confirmed, cls: "text-teal-400"  },
                    { label: "Хүлээгдэж байна", value: pending,   cls: "text-amber-400" },
                    { label: "Хугацаа дууссан", value: expired,   cls: "text-red-400"   },
                ].map(s => (
                    <div key={s.label} className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl">
                        <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="text-4xl mb-3">🧾</div>
                        <p className="font-semibold text-slate-400 dark:text-zinc-500">Invoice олдсонгүй</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                    <th className="text-left px-6 py-4">Invoice ID</th>
                                    <th className="text-left px-6 py-4">Sender No</th>
                                    <th className="text-right px-6 py-4">Дүн</th>
                                    <th className="text-left px-6 py-4">Захиалга</th>
                                    <th className="text-left px-6 py-4">Төлөв</th>
                                    <th className="text-left px-6 py-4">Дуусах хугацаа</th>
                                    <th className="text-left px-6 py-4">Үүссэн</th>
                                    <th className="px-6 py-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {invoices.map(inv => {
                                    const badge = statusBadge(inv);
                                    return (
                                        <tr key={inv.id}
                                            onClick={() => setSelectedInvId(inv.invoiceId)}
                                            className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer">
                                            <td className="px-6 py-4">
                                                <p className="font-mono text-xs text-teal-400 truncate max-w-36" title={inv.invoiceId}>
                                                    {inv.invoiceId}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-zinc-400">
                                                {inv.senderInvoiceNo}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                                                ₮{Number(inv.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {inv.order ? (
                                                    <div>
                                                        <p className="font-mono text-xs font-bold text-teal-500">{inv.order.orderNumber}</p>
                                                        <p className="text-xs text-slate-400">{inv.order.user?.name ?? ""}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-zinc-600 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.cls}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-400 dark:text-zinc-500">
                                                {inv.expiryDate ? new Date(inv.expiryDate).toLocaleString("mn-MN") : "—"}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-400 dark:text-zinc-500">
                                                {inv.createdAt ? new Date(inv.createdAt).toLocaleString("mn-MN") : "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-teal-500 font-medium hover:underline">Харах</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Pagination currentPage={page} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

            {/* Detail drawer */}
            {selectedInvId && (
                <InvoiceDrawer invoiceId={selectedInvId} onClose={() => setSelectedInvId(null)} />
            )}
        </>
    );
}
