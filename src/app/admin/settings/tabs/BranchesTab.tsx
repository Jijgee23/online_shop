"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { MapPin, Plus, Pencil, Trash2, Map as MapIcon, Clock, Copy } from "lucide-react";
import { useConfirm } from "@/app/context/confirm_context";
import { CardSection, Field, Toggle, inputCls } from "../shared";
import { BranchHours, DAY_NAMES, defaultHours, normalizeHours, summarizeHours } from "@/lib/branchHours";
import TimePicker from "@/ui/TimePicker";

const MapPicker = dynamic(() => import("@/app/components/MapPicker"), { ssr: false });

interface Branch {
    id: number;
    name: string;
    phone: string | null;
    city: string;
    district: string | null;
    khoroo: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    isActive: boolean;
    hours: unknown;
}

const emptyForm = {
    name: "", phone: "", city: "Улаанбаатар", district: "", khoroo: "", address: "",
    latitude: null as number | null, longitude: null as number | null, isActive: true,
    hours: defaultHours() as BranchHours,
};

export default function BranchesTab() {
    const { confirm } = useConfirm();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [form, setForm] = useState({ ...emptyForm });
    const [showBranches, setShowBranches] = useState(true);
    const [togglingShow, setTogglingShow] = useState(false);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/branches");
            const d = await res.json();
            if (res.ok) setBranches(d.data ?? []);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchBranches(); }, []);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(d => { if (d.data) setShowBranches(d.data.showBranches ?? true); })
            .catch(() => { });
    }, []);

    const toggleShowBranches = async () => {
        const next = !showBranches;
        setShowBranches(next);
        setTogglingShow(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ showBranches: next }),
            });
            if (res.ok) toast.success("Хадгалагдлаа");
            else { setShowBranches(!next); toast.error("Алдаа гарлаа"); }
        } catch {
            setShowBranches(!next);
            toast.error("Алдаа гарлаа");
        } finally { setTogglingShow(false); }
    };

    const openNew = () => { setForm({ ...emptyForm, hours: defaultHours() }); setEditingId(null); setShowForm(true); };
    const openEdit = (b: Branch) => {
        setForm({
            name: b.name, phone: b.phone ?? "", city: b.city, district: b.district ?? "",
            khoroo: b.khoroo ?? "", address: b.address ?? "",
            latitude: b.latitude, longitude: b.longitude, isActive: b.isActive,
            hours: normalizeHours(b.hours) ?? defaultHours(),
        });
        setEditingId(b.id);
        setShowForm(true);
    };

    const setDay = (i: number, patch: Partial<BranchHours[number]>) =>
        setForm(p => ({ ...p, hours: p.hours.map((d, idx) => (idx === i ? { ...d, ...patch } : d)) }));

    const copyToAll = (i: number) =>
        setForm(p => {
            const src = p.hours[i];
            return { ...p, hours: p.hours.map(d => ({ ...d, from: src.from, to: src.to })) };
        });

    const save = async () => {
        if (!form.name.trim()) { toast.error("Салбарын нэр оруулна уу"); return; }
        setSaving(true);
        const t = toast.loading("Хадгалж байна...");
        try {
            const url = editingId ? `/api/admin/branches/${editingId}` : "/api/admin/branches";
            const method = editingId ? "PATCH" : "POST";
            const res = await fetch(url, {
                method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
            });
            if (!res.ok) { const d = await res.json(); toast.error(d.error ?? "Алдаа гарлаа", { id: t }); return; }
            toast.success(editingId ? "Шинэчлэгдлээ" : "Салбар нэмэгдлээ", { id: t });
            setShowForm(false);
            await fetchBranches();
        } catch {
            toast.error("Алдаа гарлаа", { id: t });
        } finally { setSaving(false); }
    };

    const remove = async (id: number) => {
        const ok = await confirm("Энэ салбарыг устгах уу?");
        if (!ok) return;
        const res = await fetch(`/api/admin/branches/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("Устгагдлаа"); await fetchBranches(); }
        else toast.error("Устгахад алдаа гарлаа");
    };

    return (
        <>
            <CardSection title="Салбар харуулах" desc="Хэрэглэгчдэд салбарын хуудас (жагсаалт / газрын зураг) болон цэсний линкийг харуулах эсэх">
                <div
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${showBranches ? "border-teal-500 bg-teal-500/5" : "border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40"}`}
                >
                    <span className="text-sm font-medium text-slate-700 dark:text-zinc-200">Салбаруудыг нийтэд харуулах</span>
                    <Toggle checked={showBranches} onChange={toggleShowBranches} disabled={togglingShow} />
                </div>
            </CardSection>

            <CardSection title="Салбарууд" desc="Дэлгүүрийн салбар, байршлуудыг бүртгэх">
                <div className="flex justify-end mb-4">
                    <button onClick={openNew}
                        className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-2xl font-bold text-sm transition-colors">
                        <Plus className="w-4 h-4" /> Шинэ салбар
                    </button>
                </div>

                {loading ? (
                    <p className="text-sm text-slate-400 text-center py-8">Уншиж байна...</p>
                ) : branches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-10 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                        <MapPin className="w-8 h-8 text-slate-300 dark:text-zinc-600 mb-2" />
                        <p className="text-sm text-slate-400 dark:text-zinc-500">Салбар бүртгэгдээгүй байна</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {branches.map(b => (
                            <div key={b.id} className="flex items-start gap-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
                                <span className="mt-0.5 w-9 h-9 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{b.name}</p>
                                        {!b.isActive && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400">Идэвхгүй</span>}
                                        {b.latitude != null && b.longitude != null && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-500"><MapIcon className="w-3 h-3" /> Байршилтай</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                        {[b.city, b.district, b.khoroo].filter(Boolean).join(", ")}{b.address ? ` · ${b.address}` : ""}
                                    </p>
                                    {b.phone && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{b.phone}</p>}
                                    {summarizeHours(normalizeHours(b.hours)).length > 0 && (
                                        <p className="flex items-start gap-1.5 text-xs text-slate-400 dark:text-zinc-500 mt-1">
                                            <Clock className="w-3.5 h-3.5 mt-px flex-shrink-0" />
                                            <span>{summarizeHours(normalizeHours(b.hours)).join(" · ")}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => openEdit(b)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-teal-500 transition">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => remove(b.id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardSection>

            {showForm && (
                <CardSection title={editingId ? "Салбар засах" : "Шинэ салбар"} desc="Салбарын мэдээлэл ба байршил">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Салбарын нэр *">
                                <input value={form.name} onChange={set("name")} placeholder="Жишээ: Төв салбар" className={inputCls} />
                            </Field>
                            <Field label="Утас">
                                <input value={form.phone} onChange={set("phone")} placeholder="99001122" className={inputCls} />
                            </Field>
                            <Field label="Хот / Аймаг">
                                <input value={form.city} onChange={set("city")} placeholder="Улаанбаатар" className={inputCls} />
                            </Field>
                            <Field label="Дүүрэг / Сум">
                                <input value={form.district} onChange={set("district")} placeholder="Сүхбаатар" className={inputCls} />
                            </Field>
                            <Field label="Хороо / Баг">
                                <input value={form.khoroo} onChange={set("khoroo")} placeholder="1-р хороо" className={inputCls} />
                            </Field>
                            <Field label="Дэлгэрэнгүй хаяг">
                                <input value={form.address} onChange={set("address")} placeholder="Гудамж, байр, тоот..." className={inputCls} />
                            </Field>
                        </div>

                        {/* Map picker */}
                        <button type="button" onClick={() => setShowMap(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 hover:border-teal-500/50 rounded-2xl text-sm transition-colors group">
                            <MapIcon className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                            {form.latitude != null && form.longitude != null ? (
                                <span className="flex-1 text-left text-teal-500 font-semibold text-xs">
                                    {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                                </span>
                            ) : (
                                <span className="flex-1 text-left text-slate-400 dark:text-zinc-500">Газрын зургаас байршил сонгох</span>
                            )}
                            {form.latitude != null && form.longitude != null && (
                                <span className="text-[10px] font-bold text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-full">✓ Тохируулсан</span>
                            )}
                        </button>

                        {/* Ажлын цагийн хуваарь */}
                        <div>
                            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2">
                                <Clock className="w-4 h-4 text-teal-500" /> Ажлын цагийн хуваарь
                            </p>
                            <div className="space-y-2">
                                {form.hours.map((d, i) => (
                                    <div key={i}
                                        className={`flex items-center gap-2 sm:gap-3 p-2.5 rounded-2xl border transition-all ${d.open ? "border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40" : "border-slate-100 dark:border-zinc-800 bg-transparent"}`}>
                                        <button type="button" onClick={() => setDay(i, { open: !d.open })}
                                            className="flex items-center gap-2 w-28 flex-shrink-0 text-left">
                                            <span className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${d.open ? "bg-teal-500" : "bg-slate-200 dark:bg-zinc-700"}`}>
                                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${d.open ? "translate-x-4" : "translate-x-0"}`} />
                                            </span>
                                            <span className={`text-sm font-medium ${d.open ? "text-slate-700 dark:text-zinc-200" : "text-slate-400 dark:text-zinc-600"}`}>{DAY_NAMES[i]}</span>
                                        </button>
                                        {d.open ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <TimePicker value={d.from} onChange={v => setDay(i, { from: v })} />
                                                <span className="text-slate-400 text-sm">–</span>
                                                <TimePicker value={d.to} onChange={v => setDay(i, { to: v })} />
                                                <button type="button" onClick={() => copyToAll(i)} title="Бүх өдөрт хуулах"
                                                    className="ml-auto p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-teal-500 transition">
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400 dark:text-zinc-600">Амарна</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active toggle */}
                        <div
                            onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${form.isActive ? "border-teal-500 bg-teal-500/5" : "border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40"}`}
                        >
                            <span className="text-sm font-medium text-slate-700 dark:text-zinc-200">Идэвхтэй (нийтэд харагдана)</span>
                            <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.isActive ? "bg-teal-500" : "bg-slate-200 dark:bg-zinc-700"}`}>
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-1">
                            <button onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 rounded-2xl text-slate-500 dark:text-zinc-400 font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-sm">
                                Цуцлах
                            </button>
                            <button onClick={save} disabled={saving}
                                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white font-bold rounded-2xl transition-all text-sm">
                                {saving ? "Хадгалж байна..." : "Хадгалах"}
                            </button>
                        </div>
                    </div>
                </CardSection>
            )}

            {showMap && (
                <MapPicker
                    lat={form.latitude ?? undefined}
                    lng={form.longitude ?? undefined}
                    onConfirm={(lat, lng) => { setForm(p => ({ ...p, latitude: lat, longitude: lng })); setShowMap(false); }}
                    onClose={() => setShowMap(false)}
                />
            )}
        </>
    );
}
