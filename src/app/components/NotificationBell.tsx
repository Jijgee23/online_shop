"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/auth_context";

interface Notification {
    id: number;
    title: string;
    body: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

const TYPE_ICON: Record<string, string> = {
    ORDER: "📦",
    PROMO: "🎁",
    INFO: "ℹ️",
    SYSTEM: "⚙️",
};

export default function NotificationBell() {
    const { isAuthenticated } = useAuth();
    const [unread, setUnread] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data.notifications ?? []);
            setUnread(data.unreadCount ?? 0);
        } catch {}
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60_000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const markAllRead = async () => {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
        });
        setUnread(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const markRead = async (id: number) => {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnread(prev => Math.max(0, prev - 1));
    };

    if (!isAuthenticated) return null;

    const preview = notifications.slice(0, 5);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Мэдэгдэл"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-slate-800 dark:text-white text-sm">Мэдэгдэл</span>
                        {unread > 0 && (
                            <button onClick={markAllRead} className="text-xs text-teal-500 hover:text-teal-400 font-medium transition-colors">
                                Бүгдийг уншсан
                            </button>
                        )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                        {preview.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-600">
                                Мэдэгдэл байхгүй байна
                            </div>
                        ) : preview.map(n => (
                            <div
                                key={n.id}
                                onClick={() => !n.isRead && markRead(n.id)}
                                className={`flex items-start gap-3 px-4 py-3 cursor-default transition-colors
                                    ${n.isRead ? "" : "bg-teal-50 dark:bg-teal-900/10 cursor-pointer hover:bg-teal-100/60 dark:hover:bg-teal-900/20"}`}
                            >
                                <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? "🔔"}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-snug truncate ${n.isRead ? "text-slate-600 dark:text-slate-400" : "font-semibold text-slate-800 dark:text-white"}`}>
                                        {n.title}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{n.body}</p>
                                </div>
                                {!n.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href="/notifications"
                            onClick={() => setOpen(false)}
                            className="block w-full text-center text-xs font-semibold text-teal-500 hover:text-teal-400 transition-colors py-0.5"
                        >
                            Бүгдийг харах →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
