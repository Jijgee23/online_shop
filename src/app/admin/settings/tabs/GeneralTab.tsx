"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { CardSection, Field, SaveBtn, inputCls } from "../shared";

export default function GeneralTab() {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({ storeName: "", logo: "", storeDesc: "", phone: "", email: "", address: "", facebookUrl: "", instagramUrl: "" });

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(d => {
                if (d.data) setForm({
                    storeName:    d.data.storeName,
                    logo:         d.data.logo ?? "",
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

    const onPickLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (fileRef.current) fileRef.current.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Зөвхөн зураг оруулна уу"); return; }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
            const d = await res.json();
            if (res.ok && d.url) { setForm(p => ({ ...p, logo: d.url })); toast.success("Лого ачаалагдлаа. Хадгалахаа бүү мартаарай"); }
            else toast.error(d.error ?? "Ачаалахад алдаа гарлаа");
        } catch { toast.error("Ачаалахад алдаа гарлаа"); }
        finally { setUploading(false); }
    };

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
                    <Field label="Лого">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {form.logo ? (
                                    <Image src={form.logo} alt="Лого" width={80} height={80} className="w-full h-full object-contain" />
                                ) : (
                                    <ImagePlus className="w-6 h-6 text-slate-300 dark:text-zinc-600" />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-sm font-semibold transition-colors disabled:opacity-60">
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                                        {form.logo ? "Лого солих" : "Лого оруулах"}
                                    </button>
                                    {form.logo && (
                                        <button type="button" onClick={() => setForm(p => ({ ...p, logo: "" }))}
                                            className="p-2 rounded-xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 dark:text-zinc-500">PNG / SVG, ил тод дэвсгэртэй зураг тохиромжтой</p>
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickLogo} />
                        </div>
                    </Field>
                    <Field label="Дэлгүүрийн нэр">
                        <input value={form.storeName} onChange={set("storeName")} placeholder="Дэлгүүрийн нэр" className={inputCls} />
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
                        <input type="email" value={form.email} onChange={set("email")} placeholder="info@example.mn" className={inputCls} />
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
