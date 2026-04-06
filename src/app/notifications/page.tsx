"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth_context";
import Header from "@/app/components/Header";
import { useRouter } from "next/navigation";

interface Notification {
    id: number;
    title: string;
    body: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    data?: Record<string, unknown> | null;
}

const TYPE_ICON: Record<string, string> = {
    ORDER: "📦",
    PROMO: "🎁",
    INFO: "ℹ️",
    SYSTEM: "⚙️",
};

const TYPE_COLOR: Record<string, string> = {
    ORDER: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    PROMO: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    INFO: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
    SYSTEM: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
};

export default function NotificationsPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [fetching, setFetching] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

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

    useEffect(() => {
        if (!loading && !isAuthenticated) { router.push("/auth/login"); return; }
        if (isAuthenticated) fetchNotifications();
    }, [isAuthenticated, loading]);

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

    const deleteNotification = async (id: number) => {
        await fetch("/api/notifications", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const displayed = filter === "unread" ? notifications.filter(n => !n.isRead) : notifications;
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
            <Header />
            <div className="max-w-2xl mx-auto px-4 py-10">

                {/* Page header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Мэдэгдэл</h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-slate-400 mt-0.5">{unreadCount} уншаагүй мэдэгдэл байна</p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-sm text-teal-500 hover:text-teal-400 font-semibold transition-colors"
                        >
                            Бүгдийг уншсан болгох
                        </button>
                    )}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-6 w-fit">
                    {(["all", "unread"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                filter === f
                                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            {f === "all" ? "Бүгд" : `Уншаагүй ${unreadCount > 0 ? `(${unreadCount})` : ""}`}
                        </button>
                    ))}
                </div>

                {/* List */}
                {fetching ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 animate-pulse h-20" />
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
                        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-sm">{filter === "unread" ? "Уншаагүй мэдэгдэл байхгүй" : "Мэдэгдэл байхгүй байна"}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {displayed.map(n => (
                            <div
                                key={n.id}
                                className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all
                                    ${n.isRead
                                        ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                        : "bg-teal-50 dark:bg-teal-900/10 border-teal-100 dark:border-teal-800/40"
                                    }`}
                            >
                                {/* Type icon */}
                                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${TYPE_COLOR[n.type] ?? TYPE_COLOR.INFO}`}>
                                    {TYPE_ICON[n.type] ?? "🔔"}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0" onClick={() => !n.isRead && markRead(n.id)}>
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm leading-snug ${n.isRead ? "text-slate-600 dark:text-slate-300" : "font-semibold text-slate-800 dark:text-white"}`}>
                                            {n.title}
                                        </p>
                                        <span className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-600 whitespace-nowrap">
                                            {new Date(n.createdAt).toLocaleDateString("mn-MN")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.body}</p>
                                </div>

                                {/* Unread dot */}
                                {!n.isRead && (
                                    <span className="absolute right-4 top-4 w-2 h-2 rounded-full bg-teal-500" />
                                )}

                                {/* Delete button — visible on hover */}
                                <button
                                    onClick={() => deleteNotification(n.id)}
                                    className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
