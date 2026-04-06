"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { CardSection, Field, SaveBtn, Toggle, inputCls } from "../shared";

const LS_KEY = "ishop_qpay_settings";

function PaymentMethodsCard() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [settings, setSettings] = useState({
        payQpay: true, payBankApp: true, payCard: true, payOnDelivery: false,
    });

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(d => {
                if (d.data) setSettings({
                    payQpay:       d.data.payQpay       ?? true,
                    payBankApp:    d.data.payBankApp     ?? true,
                    payCard:       d.data.payCard        ?? true,
                    payOnDelivery: d.data.payOnDelivery  ?? false,
                });
            })
            .finally(() => setLoading(false));
    }, []);

    const patch = async (key: keyof typeof settings, value: boolean) => {
        setSaving(key);
        setSettings(p => ({ ...p, [key]: value }));
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: value }),
            });
            if (res.ok) toast.success("Хадгалагдлаа");
            else { setSettings(p => ({ ...p, [key]: !value })); toast.error("Алдаа гарлаа"); }
        } catch {
            setSettings(p => ({ ...p, [key]: !value }));
            toast.error("Алдаа гарлаа");
        } finally { setSaving(null); }
    };

    const methods: { key: keyof typeof settings; icon: string; label: string; desc: string }[] = [
        { key: "payQpay",       icon: "📱", label: "QPay",              desc: "QR кодоор төлөх" },
        { key: "payBankApp",    icon: "🏦", label: "Банкны апп",        desc: "Шилжүүлгээр төлөх" },
        { key: "payCard",       icon: "💳", label: "Картаар",            desc: "Visa / Mastercard" },
        { key: "payOnDelivery", icon: "💵", label: "Хүргэлтэд бэлнээр", desc: "Хүргэлтийн үед төлнө" },
    ];

    return (
        <CardSection title="Төлбөрийн аргууд" desc="Харилцагчид санал болгох төлбөрийн сонголтууд">
            {loading ? (
                <div className="space-y-3 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />)}
                </div>
            ) : (
                <div className="space-y-2">
                    {methods.map(({ key, icon, label, desc }) => (
                        <div key={key} className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <span className="text-xl w-8 text-center">{icon}</span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{desc}</p>
                                </div>
                            </div>
                            <Toggle checked={settings[key]} onChange={() => patch(key, !settings[key])} disabled={saving === key} />
                        </div>
                    ))}
                </div>
            )}
        </CardSection>
    );
}

export default function QPayTab() {
    const [saving, setSaving] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [form, setForm] = useState({ merchantId: "", terminalId: "", username: "", clientSecret: "", invoiceCode: "" });

    useEffect(() => {
        try {
            const s = localStorage.getItem(LS_KEY);
            if (s) setForm(JSON.parse(s));
        } catch {}
    }, []);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const save = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 400));
        localStorage.setItem(LS_KEY, JSON.stringify(form));
        toast.success("QPay тохиргоо хадгалагдлаа");
        setSaving(false);
    };

    return (
        <>
            <PaymentMethodsCard />

            <div className="flex items-center gap-3 mb-5 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    QPay мэдээллийг аюулгүй газар хадгал. Нийтэд нээлттэй болгох хэрэггүй.
                </p>
            </div>

            <CardSection title="QPay API тохиргоо" desc="QPay системтэй холбогдох мэдээлэл">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Merchant ID">
                            <input value={form.merchantId} onChange={set("merchantId")} placeholder="ISHOP_MN" className={inputCls} />
                        </Field>
                        <Field label="Terminal ID">
                            <input value={form.terminalId} onChange={set("terminalId")} placeholder="ISHOP_TERMINAL" className={inputCls} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Username">
                            <input value={form.username} onChange={set("username")} placeholder="qpay_username" className={inputCls} />
                        </Field>
                        <Field label="Client Secret">
                            <div className="relative">
                                <input
                                    type={showSecret ? "text" : "password"}
                                    value={form.clientSecret}
                                    onChange={set("clientSecret")}
                                    placeholder="••••••••••••"
                                    className={`${inputCls} pr-12`}
                                />
                                <button type="button" onClick={() => setShowSecret(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>
                    </div>
                    <Field label="Invoice Code">
                        <input value={form.invoiceCode} onChange={set("invoiceCode")} placeholder="ISHOP_INVOICE" className={inputCls} />
                    </Field>
                </div>
                <div className="flex justify-end mt-4"><SaveBtn onClick={save} saving={saving} /></div>
            </CardSection>

            <CardSection title="Холболтын төлөв" desc="QPay API-тай холболтын байдал">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                        <span className="text-sm text-slate-500 dark:text-zinc-400">QPay холбоос шалгагдаагүй байна</span>
                    </div>
                    <button onClick={() => toast("Тест хүсэлт илгээж байна...")}
                        className="text-xs font-bold text-teal-500 hover:text-teal-400 px-3 py-1.5 border border-teal-500/30 hover:border-teal-400/50 rounded-xl transition-all">
                        Тест хийх
                    </button>
                </div>
            </CardSection>
        </>
    );
}
