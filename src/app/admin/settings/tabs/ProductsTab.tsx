"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSettings } from "@/app/context/settings_context";
import { CardSection, Toggle } from "../shared";

export default function ProductsTab() {
    const { settings: storeSettings, loading: settingsLoading, refresh } = useSettings();
    const [adminLoading, setAdminLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [settings, setSettings] = useState({
        onlyInStock:          false,
        onlyPublished:        true,
        showStatProducts:     true,
        showStatOrders:       true,
        showStatSatisfaction: true,
        showStatDelivery:     true,
    });

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(d => {
                if (d.data) setSettings(p => ({
                    ...p,
                    onlyInStock:   d.data.onlyInStock   ?? false,
                    onlyPublished: d.data.onlyPublished ?? true,
                }));
            })
            .finally(() => setAdminLoading(false));
    }, []);

    useEffect(() => {
        if (settingsLoading) return;
        setSettings(p => ({
            ...p,
            showStatProducts:     storeSettings.showStatProducts,
            showStatOrders:       storeSettings.showStatOrders,
            showStatSatisfaction: storeSettings.showStatSatisfaction,
            showStatDelivery:     storeSettings.showStatDelivery,
        }));
    }, [settingsLoading, storeSettings]);

    const loading = adminLoading || settingsLoading;

    const patch = async (key: keyof typeof settings, value: boolean) => {
        setSaving(key);
        setSettings(p => ({ ...p, [key]: value }));
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: value }),
            });
            if (res.ok) {
                toast.success("Хадгалагдлаа");
                refresh();
            } else {
                setSettings(p => ({ ...p, [key]: !value }));
                toast.error("Алдаа гарлаа");
            }
        } catch {
            setSettings(p => ({ ...p, [key]: !value }));
            toast.error("Алдаа гарлаа");
        } finally { setSaving(null); }
    };

    const productRows: { key: keyof typeof settings; label: string; desc: string }[] = [
        { key: "onlyPublished", label: "Зөвхөн нийтлэгдсэн бараа харуулах",  desc: "Идэвхгүй болон ноорог бараануудыг харагдахгүй болгоно" },
        { key: "onlyInStock",   label: "Зөвхөн нөөцтэй бараа харуулах",       desc: "Нөөц дууссан (stock = 0) бараануудыг харагдахгүй болгоно" },
    ];

    const statRows: { key: keyof typeof settings; icon: string; label: string; desc: string }[] = [
        { key: "showStatProducts",     icon: "📦", label: "Бүтээгдэхүүний тоо",    desc: "Нийт бүтээгдэхүүний тоог харуулна" },
        { key: "showStatOrders",       icon: "🛒", label: "Захиалгын тоо",          desc: "Нийт захиалгын тоог харуулна" },
        { key: "showStatSatisfaction", icon: "😊", label: "Сэтгэл ханамжийн хувь", desc: "Үнэлгээний дундаж хувийг харуулна" },
        { key: "showStatDelivery",     icon: "🚚", label: "Хүргэлтийн хугацаа",    desc: "Хүргэлтийн хугацааг харуулна" },
    ];

    const skeletonRows = (n: number) => (
        <div className="space-y-3 animate-pulse">
            {Array.from({ length: n }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
            ))}
        </div>
    );

    return (
        <>
            <CardSection title="Бүтээгдэхүүний харагдац" desc="Вэбсайтад ямар бараануудыг харуулахыг тохируулна">
                {loading ? skeletonRows(2) : (
                    <div className="space-y-3">
                        {productRows.map(({ key, label, desc }) => (
                            <div key={key} className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{desc}</p>
                                </div>
                                <Toggle checked={settings[key]} onChange={() => patch(key, !settings[key])} disabled={saving === key} />
                            </div>
                        ))}
                    </div>
                )}
            </CardSection>

            <CardSection title="Нүүр хуудасны статистик" desc="Хэрэглэгчдэд харуулах тоон үзүүлэлтүүдийг сонгоно">
                {loading ? skeletonRows(4) : (
                    <div className="space-y-2">
                        {statRows.map(({ key, icon, label, desc }) => (
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
        </>
    );
}
