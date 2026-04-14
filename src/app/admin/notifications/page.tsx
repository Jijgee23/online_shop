"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Trash2, Send, X, ChevronDown, Users } from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
    id: number;
    title: string;
    body: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    data?: { orderId?: number; orderNumber?: string } | null;
}

interface Customer {
    id: number;
    name: string;
    email: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, string> = { ORDER: "📦", PROMO: "🎁", INFO: "ℹ️", SYSTEM: "⚙️" };
const TYPE_LABEL: Record<string, string> = { ORDER: "Захиалга", PROMO: "Урамшуулал", INFO: "Мэдээлэл", SYSTEM: "Систем" };
const TYPE_COLOR: Record<string, string> = {
    ORDER:  "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    PROMO:  "bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400",
    INFO:   "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
    SYSTEM: "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400",
};

// ─── Customer picker ──────────────────────────────────────────────────────────

function CustomerPicker({
    selected,
    onChange,
}: {
    selected: number[] | "all";
    onChange: (v: number[] | "all") => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        const t = setTimeout(async () => {
            const res = await fetch(`/api/admin/customer?search=${encodeURIComponent(search)}&pageSize=30`);
            const data = await res.json();
            setCustomers(data.data ?? []);
            setLoading(false);
        }, 300);
        return () => clearTimeout(t);
    }, [open, search]);

    const toggle = (id: number) => {
        if (selected === "all") { onChange([id]); return; }
        onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    };

    const label = selected === "all"
        ? "Бүх хэрэглэгч"
        : selected.length === 0
            ? "Хэрэглэгч сонгох..."
            : `${selected.length} хэрэглэгч сонгогдсон`;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm text-slate-700 dark:text-zinc-200 hover:border-teal-400 transition-colors"
            >
                <div className="flex items-center gap-2 min-w-0">
                    <Users className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span className="truncate">{label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden">
                    {/* All users option */}
                    <button
                        type="button"
                        onClick={() => { onChange("all"); setOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold border-b border-slate-100 dark:border-zinc-800 transition-colors
                            ${selected === "all" ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400" : "hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"}`}
                    >
                        <Users className="w-4 h-4" />
                        Бүх хэрэглэгч
                        {selected === "all" && <span className="ml-auto w-2 h-2 rounded-full bg-teal-500" />}
                    </button>

                    {/* Search */}
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800">
                        <input
                            autoFocus
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Хайх..."
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none"
                        />
                    </div>

                    {/* List */}
                    <div className="max-h-52 overflow-y-auto">
                        {loading ? (
                            <div className="py-6 flex justify-center">
                                <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
                            </div>
                        ) : customers.length === 0 ? (
                            <p className="text-center text-sm text-slate-400 py-6">Олдсонгүй</p>
                        ) : customers.map(c => {
                            const checked = selected !== "all" && selected.includes(c.id);
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => toggle(c.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                                        ${checked ? "bg-teal-50 dark:bg-teal-900/20" : "hover:bg-slate-50 dark:hover:bg-zinc-800"}`}
                                >
                                    <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors
                                        ${checked ? "bg-teal-500 border-teal-500" : "border-slate-300 dark:border-zinc-600"}`}>
                                        {checked && (
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="font-semibold text-slate-800 dark:text-white truncate">{c.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{c.email}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    {selected !== "all" && selected.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-xs text-slate-500">{selected.length} сонгогдсон</span>
                            <button type="button" onClick={() => onChange([])} className="text-xs text-red-500 hover:underline">Цэвэрлэх</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Send panel ───────────────────────────────────────────────────────────────

function SendPanel() {
    const [target, setTarget] = useState<number[] | "all">([]);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);

    const canSend = (target === "all" || target.length > 0) && title.trim() && body.trim();

    const send = async () => {
        if (!canSend) return;
        setSending(true);
        try {
            const res = await fetch("/api/admin/notifications/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userIds: target, title: title.trim(), body: body.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`${data.sent} хэрэглэгчид мэдэгдэл илгээлээ`);
                setTitle("");
                setBody("");
                setTarget([]);
            } else {
                toast.error(data.error ?? "Алдаа гарлаа");
            }
        } catch {
            toast.error("Алдаа гарлаа");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6 mb-8">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
                    <Send className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Мэдэгдэл илгээх</h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">Хэрэглэгч сонгоод мессеж бичнэ үү</p>
                </div>
            </div>

            <div className="space-y-3">
                {/* Customer picker */}
                <CustomerPicker selected={target} onChange={setTarget} />

                {/* Title */}
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Гарчиг"
                    maxLength={80}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                />

                {/* Body */}
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Мессеж бичнэ үү..."
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                />

                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{body.length}/300</span>
                    <button
                        onClick={send}
                        disabled={!canSend || sending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors"
                    >
                        {sending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        {sending ? "Илгээж байна..." : "Илгээх"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [fetching, setFetching] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread" | "ORDER" | "INFO" | "SYSTEM">("all");

    const fetchNotifications = async () => {
        setFetching(true);
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications ?? []);
            }
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const markRead = async (id: number) => {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllRead = async () => {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
        });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const deleteOne = async (id: number) => {
        await fetch("/api/notifications", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const displayed = notifications.filter(n => {
        if (filter === "unread") return !n.isRead;
        if (filter === "all") return true;
        return n.type === filter;
    });

    const FILTERS: { key: typeof filter; label: string }[] = [
        { key: "all",    label: "Бүгд" },
        { key: "unread", label: `Уншаагүй${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
        { key: "ORDER",  label: "Захиалга" },
        { key: "INFO",   label: "Мэдээлэл" },
        { key: "SYSTEM", label: "Систем" },
    ];

    return (
        <>
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Мэдэгдэл</h2>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">
                        Нийт <span className="text-slate-800 dark:text-white font-semibold">{notifications.length}</span> мэдэгдэл
                        {unreadCount > 0 && (
                            <> — <span className="text-teal-500 font-semibold">{unreadCount} уншаагүй</span></>
                        )}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Бүгдийг уншсан болгох
                    </button>
                )}
            </header>

            {/* Send panel */}
            <SendPanel />

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                            filter === f.key
                                ? "bg-teal-500 text-white shadow-sm shadow-teal-500/30"
                                : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-teal-500/40"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {fetching ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 animate-pulse h-20 border border-slate-100 dark:border-zinc-800" />
                    ))}
                </div>
            ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-zinc-600">
                    <Bell className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">Мэдэгдэл байхгүй байна</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {displayed.map(n => (
                        <div
                            key={n.id}
                            className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all
                                ${n.isRead
                                    ? "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
                                    : "bg-teal-50/60 dark:bg-teal-900/10 border-teal-100 dark:border-teal-800/30"
                                }`}
                        >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${TYPE_COLOR[n.type] ?? TYPE_COLOR.INFO}`}>
                                {TYPE_ICON[n.type] ?? "🔔"}
                            </div>
                            <div className="flex-1 min-w-0 cursor-default" onClick={() => !n.isRead && markRead(n.id)}>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-sm font-semibold ${n.isRead ? "text-slate-600 dark:text-zinc-300" : "text-slate-900 dark:text-white"}`}>
                                        {n.title}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[n.type] ?? TYPE_COLOR.INFO}`}>
                                        {TYPE_LABEL[n.type] ?? n.type}
                                    </span>
                                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />}
                                    <span className="ml-auto text-xs text-slate-400 dark:text-zinc-600 whitespace-nowrap">
                                        {new Date(n.createdAt).toLocaleString("mn-MN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{n.body}</p>
                                {n.data?.orderNumber && (
                                    <p className="text-xs text-teal-600 dark:text-teal-400 font-mono mt-1">#{n.data.orderNumber}</p>
                                )}
                            </div>
                            <button
                                onClick={() => deleteOne(n.id)}
                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-300 dark:text-zinc-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
