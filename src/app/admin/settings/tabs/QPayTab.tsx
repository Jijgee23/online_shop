"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { CardSection, Field, SaveBtn, inputCls } from "../shared";

export default function QPayTab() {
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [testStatus, setTestStatus] = useState<"idle" | "ok" | "fail">("idle");
    const [form, setForm] = useState({ invoiceCode: "", username: "", password: "" });

    useEffect(() => {
        fetch("/api/admin/qpay")
            .then(r => r.json())
            .then(d => {
                if (d.data) {
                    setForm({
                        invoiceCode: d.data.invoiceCode ?? "",
                        username:    d.data.username    ?? "",
                        password:    d.data.password    ?? "",
                    });
                    if (d.data.testedAt) setTestStatus("ok");
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/qpay", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) toast.success("QPay тохиргоо хадгалагдлаа");
            else toast.error("Алдаа гарлаа");
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setSaving(false); }
    };

    const test = async () => {
        setTesting(true);
        setTestStatus("idle");
        try {
            const res = await fetch("/api/admin/qpay/test", { method: "POST" });
            const d = await res.json();
            if (res.ok) {
                setTestStatus("ok");
                toast.success(d.message ?? "QPay холболт амжилттай!");
            } else {
                setTestStatus("fail");
                toast.error(d.error ?? "Холболт амжилтгүй");
            }
        } catch {
            setTestStatus("fail");
            toast.error("Серверт холбогдоход алдаа гарлаа");
        } finally { setTesting(false); }
    };

    return (
        <>
            <div className="flex items-center gap-3 mb-5 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    QPay мэдээллийг аюулгүй газар хадгал. Нийтэд нээлттэй болгох хэрэггүй.
                </p>
            </div>

            <CardSection title="QPay API тохиргоо" desc="QPay системтэй холбогдох мэдээлэл">
                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />)}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Username">
                                <input value={form.username} onChange={set("username")} placeholder="qpay_username" className={inputCls} />
                            </Field>
                            <Field label="Invoice Code">
                                <input value={form.invoiceCode} onChange={set("invoiceCode")} placeholder="ISHOP_INVOICE" className={inputCls} />
                            </Field>
                        </div>
                        <Field label="Password">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={set("password")}
                                    placeholder="••••••••••••"
                                    className={`${inputCls} pr-12`}
                                />
                                <button type="button" onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>
                    </div>
                )}
                <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
                    {/* Connection status */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full transition-colors ${testStatus === "ok" ? "bg-green-500" :
                                testStatus === "fail" ? "bg-red-500" : "bg-slate-300 dark:bg-zinc-600"
                            }`} />
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                            {testStatus === "ok" ? "Холболт амжилттай" :
                                testStatus === "fail" ? "Холболт амжилтгүй" : "Холбоос шалгагдаагүй"}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={test}
                            disabled={testing || saving}
                            className="text-xs font-bold text-teal-500 hover:text-teal-400 px-3 py-1.5 border border-teal-500/30 hover:border-teal-400/50 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {testing && <div className="w-3 h-3 border border-teal-400 border-t-transparent rounded-full animate-spin" />}
                            Тест хийх
                        </button>
                        <SaveBtn onClick={save} saving={saving} />
                    </div>
                </div>
            </CardSection>
        </>
    );
}
