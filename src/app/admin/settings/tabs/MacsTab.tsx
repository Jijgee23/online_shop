"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { CardSection, Field, SaveBtn, inputCls } from "../shared";

export default function MacsTab() {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ username: "", password: "", accessToken: "", refreshToken: "" });

    useEffect(() => {
        fetch("/api/admin/macs")
            .then(r => r.json())
            .then(d => {
                if (d.data) {
                    setForm({
                        username:     d.data.username     ?? "",
                        password:     d.data.password     ?? "",
                        accessToken:  d.data.accessToken  ?? "",
                        refreshToken: d.data.refreshToken ?? "",
                    });
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/macs", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) toast.success("MACS тохиргоо хадгалагдлаа");
            else toast.error("Алдаа гарлаа");
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setSaving(false); }
    };

    return (
        <>
            <div className="flex items-center gap-3 mb-5 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    MACS мэдээллийг аюулгүй газар хадгал. Нийтэд нээлттэй болгох хэрэггүй.
                </p>
            </div>

            <CardSection title="MACS API тохиргоо" desc="MACS системтэй холбогдох мэдээлэл">
                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />)}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Field label="Username">
                            <input value={form.username} onChange={set("username")} placeholder="macs_username" className={inputCls} />
                        </Field>
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
                        <Field label="Access Token">
                            <textarea value={form.accessToken} onChange={set("accessToken")} rows={2} placeholder="eyJhbGciOi..." className={`${inputCls} resize-none font-mono text-xs`} />
                        </Field>
                        <Field label="Refresh Token">
                            <textarea value={form.refreshToken} onChange={set("refreshToken")} rows={2} placeholder="eyJhbGciOi..." className={`${inputCls} resize-none font-mono text-xs`} />
                        </Field>
                    </div>
                )}
                <div className="flex items-center justify-end mt-4">
                    <SaveBtn onClick={save} saving={saving} />
                </div>
            </CardSection>
        </>
    );
}
