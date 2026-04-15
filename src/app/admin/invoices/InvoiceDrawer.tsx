"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

// ─── Small helpers ────────────────────────────────────────────────────────────

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

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface Props {
    invoiceId: string;
    onClose: () => void;
}

export default function InvoiceDrawer({ invoiceId, onClose }: Props) {
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

                            {/* Payment rows */}
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
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.payment_status === "PAID" ? "bg-teal-500/10 text-teal-400" : "bg-amber-500/10 text-amber-400"}`}>
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

                            {/* DB record */}
                            <Section title="Системийн мэдээлэл">
                                <Row label="Cart ID"    value={db?.cartId ? String(db.cartId) : "—"} mono />
                                <Row label="Address ID" value={db?.addressId ? String(db.addressId) : "—"} mono />
                                {db?.order ? (
                                    <>
                                        <Row label="Захиалга"   value={db.order.orderNumber} mono bold />
                                        <Row label="Хэрэглэгч" value={`${db.order.user?.name ?? "—"} (${db.order.user?.email ?? ""})`} />
                                        <Row label="Нийт дүн"  value={`₮${Number(db.order.totalPrice ?? 0).toLocaleString()}`} bold />
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
