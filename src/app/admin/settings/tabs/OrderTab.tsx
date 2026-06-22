"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CardSection, Field, SaveBtn, Toggle, inputCls } from "../shared";

export default function OrderTab() {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [payOnDelivery, setPayOnDelivery] = useState(false);
    const [maxOrderValue, setMaxOrderValue] = useState("");

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(d => {
                if (d.data) {
                    setPayOnDelivery(d.data.payOnDelivery ?? false);
                    const m = Number(d.data.maxOrderValue ?? 0);
                    setMaxOrderValue(m > 0 ? String(m) : "");
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payOnDelivery, maxOrderValue: Number(maxOrderValue) || 0 }),
            });
            if (res.ok) toast.success("Хадгалагдлаа");
            else toast.error("Алдаа гарлаа");
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="h-4 w-40 bg-slate-100 dark:bg-zinc-800 rounded-lg" />
            <div className="h-14 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
        </div>
    );

    return (
        <>
            <CardSection title="Захиалгын тохиргоо" desc="Захиалгатай холбоотой үндсэн тохиргоонууд">
                <div className="flex items-center justify-between gap-4 py-1">
                    <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">Хүргэлтийн үеэр төлөх</p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                            Идэвхтэй бол харилцагч захиалга хийхдээ &quot;Хүргэлтийн үеэр төлөх&quot; сонголтыг ашиглаж болно
                        </p>
                    </div>
                    <Toggle checked={payOnDelivery} onChange={() => setPayOnDelivery(p => !p)} />
                </div>
            </CardSection>

            <CardSection title="Захиалгын дээд үнэ" desc="Нэг захиалгын зөвшөөрөгдөх дээд дүн. 0 буюу хоосон бол хязгааргүй.">
                <Field label="Дээд дүн (₮)">
                    <input
                        type="number"
                        min={0}
                        value={maxOrderValue}
                        onChange={e => setMaxOrderValue(e.target.value)}
                        placeholder="Жишээ: 5000000 (хязгааргүй бол хоосон)"
                        className={inputCls}
                    />
                </Field>
                {Number(maxOrderValue) > 0 && (
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2">
                        Сагсны нийт дүн ₮{Number(maxOrderValue).toLocaleString()}-аас хэтэрвэл захиалга хийх боломжгүй болно.
                    </p>
                )}
            </CardSection>

            <div className="flex justify-end">
                <SaveBtn onClick={save} saving={saving} />
            </div>
        </>
    );
}
