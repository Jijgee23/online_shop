"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface AdminNotificationBellProps {
    onNavigate: () => void;
}

export default function AdminNotificationBell({ onNavigate }: AdminNotificationBellProps) {
    const [unread, setUnread] = useState(0);

    const fetchUnread = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (!res.ok) return;
            const data = await res.json();
            setUnread(data.unreadCount ?? 0);
        } catch {}
    };

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 30_000);
        window.addEventListener("fcm-message", fetchUnread);
        return () => {
            clearInterval(interval);
            window.removeEventListener("fcm-message", fetchUnread);
        };
    }, []);

    return (
        <button
            onClick={onNavigate}
            className="relative p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Мэдэгдэл"
        >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unread > 99 ? "99+" : unread}
                </span>
            )}
        </button>
    );
}
