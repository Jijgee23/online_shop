"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

interface Notification {
    id: number;
    title: string;
    body: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    data?: { orderId?: number; orderNumber?: string } | null;
}

const TYPE_ICON: Record<string, string> = {
    ORDER: "📦",
    PROMO: "🎁",
    INFO: "ℹ️",
    SYSTEM: "⚙️",
};

const TYPE_LABEL: Record<string, string> = {
    ORDER: "Захиалга",
    PROMO: "Урамшуулал",
    INFO: "Мэдээлэл",
    SYSTEM: "Систем",
};

const TYPE_COLOR: Record<string, string> = {
    ORDER: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    PROMO: "bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400",
    INFO: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
    SYSTEM: "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400",
};

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
        { key: "all", label: "Бүгд" },
        { key: "unread", label: `Уншаагүй${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
        { key: "ORDER", label: "Захиалга" },
        { key: "INFO", label: "Мэдээлэл" },
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
                            {/* Type badge */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${TYPE_COLOR[n.type] ?? TYPE_COLOR.INFO}`}>
                                {TYPE_ICON[n.type] ?? "🔔"}
                            </div>

                            {/* Content */}
                            <div
                                className="flex-1 min-w-0 cursor-default"
                                onClick={() => !n.isRead && markRead(n.id)}
                            >
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-sm font-semibold ${n.isRead ? "text-slate-600 dark:text-zinc-300" : "text-slate-900 dark:text-white"}`}>
                                        {n.title}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[n.type] ?? TYPE_COLOR.INFO}`}>
                                        {TYPE_LABEL[n.type] ?? n.type}
                                    </span>
                                    {!n.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                                    )}
                                    <span className="ml-auto text-xs text-slate-400 dark:text-zinc-600 whitespace-nowrap">
                                        {new Date(n.createdAt).toLocaleString("mn-MN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{n.body}</p>
                                {n.data?.orderNumber && (
                                    <p className="text-xs text-teal-600 dark:text-teal-400 font-mono mt-1">#{n.data.orderNumber}</p>
                                )}
                            </div>

                            {/* Delete */}
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
