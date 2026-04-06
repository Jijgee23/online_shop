"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { CardSection, Field, SaveBtn, Toggle, inputCls } from "../shared";

interface District { id: number; name: string; deliverable: boolean; }

export default function DeliveryTab() {
    const [districts, setDistricts] = useState<District[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [fees, setFees] = useState({ deliveryFee: "5000", freeThreshold: "100000" });

    useEffect(() => {
        fetch("/api/districts?all=true")
            .then(r => r.json())
            .then(d => setDistricts(d.data ?? []));

        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(d => {
                if (d.data) setFees({
                    deliveryFee:   String(d.data.fee          ?? 5000),
                    freeThreshold: String(d.data.feeThreshold ?? 100000),
                });
            })
            .finally(() => setLoading(false));
    }, []);

    const toggle = async (d: District) => {
        setToggling(d.id);
        try {
            const res = await fetch(`/api/admin/districts/${d.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deliverable: !d.deliverable }),
            });
            if (!res.ok) throw new Error();
            setDistricts(p => p.map(x => x.id === d.id ? { ...x, deliverable: !x.deliverable } : x));
            toast.success(`${d.name} — ${!d.deliverable ? "Идэвхжлээ" : "Хаагдлаа"}`);
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setToggling(null); }
    };

    const saveFees = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fee:          Number(fees.deliveryFee),
                    feeThreshold: Number(fees.freeThreshold),
                }),
            });
            if (res.ok) toast.success("Хадгалагдлаа");
            else toast.error("Алдаа гарлаа");
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setSaving(false); }
    };

    const deliverableCount = districts.filter(d => d.deliverable).length;

    return (
        <>
            <CardSection title="Хүргэлтийн үнэ" desc="Хүргэлтийн хөлс болон үнэгүй хүргэлтийн босго">
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Хүргэлтийн хөлс (₮)">
                        <input type="number" value={fees.deliveryFee}
                            onChange={e => setFees(p => ({ ...p, deliveryFee: e.target.value }))}
                            placeholder="5000" className={inputCls} />
                    </Field>
                    <Field label="Үнэгүй хүргэлтийн босго (₮)">
                        <input type="number" value={fees.freeThreshold}
                            onChange={e => setFees(p => ({ ...p, freeThreshold: e.target.value }))}
                            placeholder="100000" className={inputCls} />
                    </Field>
                </div>
                <div className="flex justify-end mt-4">
                    <SaveBtn onClick={saveFees} saving={saving} />
                </div>
            </CardSection>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Хүргэлтийн бүс</h3>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Хүргэлт хийх дүүргүүдийг идэвхжүүлэх</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-teal-500">{deliverableCount}</p>
                        <p className="text-xs text-slate-400">/ {districts.length} идэвхтэй</p>
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between px-6 py-4 animate-pulse">
                                <div className="flex gap-3 items-center">
                                    <div className="w-8 h-8 bg-slate-100 dark:bg-zinc-800 rounded-xl" />
                                    <div className="w-28 h-4 bg-slate-100 dark:bg-zinc-800 rounded-lg" />
                                </div>
                                <div className="w-12 h-6 bg-slate-100 dark:bg-zinc-800 rounded-full" />
                            </div>
                        ))
                        : districts.map(d => (
                            <div key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${d.deliverable ? "bg-teal-50 dark:bg-teal-500/10 text-teal-500" : "bg-slate-100 dark:bg-zinc-800 text-slate-400"}`}>
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{d.name}</p>
                                        <p className={`text-xs mt-0.5 ${d.deliverable ? "text-teal-500" : "text-slate-400 dark:text-zinc-600"}`}>
                                            {d.deliverable ? "Хүргэлт хийж байна" : "Хүргэлт хийхгүй"}
                                        </p>
                                    </div>
                                </div>
                                <Toggle checked={d.deliverable} onChange={() => toggle(d)} disabled={toggling === d.id} />
                            </div>
                        ))
                    }
                </div>

                <div className="px-6 py-3 bg-slate-50 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800">
                    <p className="text-xs text-slate-400 dark:text-zinc-600">Идэвхгүй дүүрэгт шинэ хаяг бүртгүүлэх боломжгүй болно.</p>
                </div>
            </div>
        </>
    );
}
