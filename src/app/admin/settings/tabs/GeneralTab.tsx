"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CardSection, Field, SaveBtn, inputCls } from "../shared";

export default function GeneralTab() {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ storeName: "", storeDesc: "", phone: "", email: "", address: "", facebookUrl: "", instagramUrl: "" });

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(d => {
                if (d.data) setForm({
                    storeName:    d.data.storeName,
                    storeDesc:    d.data.storeDesc,
                    phone:        d.data.phone,
                    email:        d.data.email,
                    address:      d.data.address,
                    facebookUrl:  d.data.facebookUrl  ?? "",
                    instagramUrl: d.data.instagramUrl ?? "",
                });
            })
            .finally(() => setLoading(false));
    }, []);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) toast.success("Хадгалагдлаа");
            else toast.error("Алдаа гарлаа");
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="space-y-5 animate-pulse">
            {[1, 2].map(i => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
                    <div className="h-4 w-32 bg-slate-100 dark:bg-zinc-800 rounded-lg" />
                    <div className="h-10 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
                    <div className="h-10 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
                </div>
            ))}
        </div>
    );

    return (
        <>
            <CardSection title="Дэлгүүрийн мэдээлэл" desc="Вэбсайтад харагдах үндсэн мэдээлэл">
                <div className="space-y-4">
                    <Field label="Дэлгүүрийн нэр">
                        <input value={form.storeName} onChange={set("storeName")} placeholder="IShop" className={inputCls} />
                    </Field>
                    <Field label="Тайлбар">
                        <textarea value={form.storeDesc} onChange={set("storeDesc")} rows={3}
                            placeholder="Дэлгүүрийн товч тайлбар..." className={`${inputCls} resize-none`} />
                    </Field>
                </div>
            </CardSection>

            <CardSection title="Холбоо барих" desc="Харилцагчид харагдах мэдээлэл">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Утас">
                        <input value={form.phone} onChange={set("phone")} placeholder="99001122" className={inputCls} />
                    </Field>
                    <Field label="И-мэйл">
                        <input type="email" value={form.email} onChange={set("email")} placeholder="info@ishop.mn" className={inputCls} />
                    </Field>
                    <div className="sm:col-span-2">
                        <Field label="Хаяг">
                            <input value={form.address} onChange={set("address")} placeholder="Улаанбаатар, ..." className={inputCls} />
                        </Field>
                    </div>
                </div>
            </CardSection>

            <CardSection title="Сошиал холбоос" desc="Header дээр харагдах сошиал хаягууд">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Facebook URL">
                        <input value={form.facebookUrl} onChange={set("facebookUrl")} placeholder="https://facebook.com/..." className={inputCls} />
                    </Field>
                    <Field label="Instagram URL">
                        <input value={form.instagramUrl} onChange={set("instagramUrl")} placeholder="https://instagram.com/..." className={inputCls} />
                    </Field>
                </div>
            </CardSection>

            <div className="flex justify-end"><SaveBtn onClick={save} saving={saving} /></div>
        </>
    );
}
