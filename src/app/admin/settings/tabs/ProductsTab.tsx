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
        showStock:            true,
        showStatProducts:     true,
        showStatOrders:       true,
        showStatSatisfaction: true,
        showStatDelivery:     true,
    });
    const [lowStockThreshold, setLowStockThreshold] = useState(5);
    const [savingThreshold,   setSavingThreshold]   = useState(false);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(d => {
                if (d.data) {
                    setSettings(p => ({
                        ...p,
                        onlyInStock:   d.data.onlyInStock   ?? false,
                        onlyPublished: d.data.onlyPublished ?? true,
                        showStock:     d.data.showStock     ?? true,
                    }));
                    setLowStockThreshold(d.data.lowStockThreshold ?? 5);
                }
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

    const saveThreshold = async () => {
        const value = Math.max(0, Math.floor(Number(lowStockThreshold) || 0));
        setLowStockThreshold(value);
        setSavingThreshold(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lowStockThreshold: value }),
            });
            if (res.ok) { toast.success("Хадгалагдлаа"); refresh(); }
            else toast.error("Алдаа гарлаа");
        } catch {
            toast.error("Алдаа гарлаа");
        } finally { setSavingThreshold(false); }
    };

    const productRows: { key: keyof typeof settings; label: string; desc: string }[] = [
        { key: "onlyPublished", label: "Зөвхөн нийтлэгдсэн бараа харуулах",  desc: "Идэвхгүй болон ноорог бараануудыг харагдахгүй болгоно" },
        { key: "onlyInStock",   label: "Зөвхөн нөөцтэй бараа харуулах",       desc: "Нөөц дууссан (stock = 0) бараануудыг харагдахгүй болгоно" },
        { key: "showStock",     label: "Үлдэгдлийн тоо харуулах",             desc: "Хэрэглэгчид үлдэгдлийн тоог харуулна. Унтраавал зөвхөн «Нөөцөд байна / Дууссан» гэж харагдана" },
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

                        {/* Бага үлдэгдлийн босго */}
                        <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Бага үлдэгдлийн босго</p>
                                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                                    Үлдэгдэл нь энэ тооноос бага болсон бараа «бага үлдэгдэл» гэж тооцогдож хянах самбарт сэрэмжлүүлэг харагдана
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <input
                                    type="number"
                                    min={0}
                                    value={lowStockThreshold}
                                    onChange={e => setLowStockThreshold(Number(e.target.value))}
                                    className="w-20 px-3 py-2 text-sm text-center font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                                />
                                <button
                                    onClick={saveThreshold}
                                    disabled={savingThreshold}
                                    className="px-4 py-2 text-sm font-bold rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white transition-colors"
                                >
                                    Хадгалах
                                </button>
                            </div>
                        </div>
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
