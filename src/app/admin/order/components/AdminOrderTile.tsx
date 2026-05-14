import React, { useRef, useState } from "react";
import { Order, OrderStatus } from "@/interface/order";
import { useRouter } from "next/navigation";

interface AdminOrderTileProps extends Order {
    onStatusChange?: (id: number, status: OrderStatus) => void;
    selected: boolean;
    onToggle: (id: number) => void;
}

export default function AdminOrderTile({ onStatusChange, selected, onToggle, ...order }: AdminOrderTileProps) {
    const router = useRouter()
    const handleTap = () => {
        router.push(`/admin/order/${order.id}`)
    }
    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/admin/order/${order.id}`)
    }
    return (
        <tr
            key={order.id} onClick={handleTap} className="hover:bg-slate-100 dark:hover:bg-zinc-800/30 transition-all group">
            <td className="pl-6 pr-2 py-5" onClick={e => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggle(order.id)}
                    className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                />
            </td>
            <td className="px-8 py-5">
                <p className="font-mono text-slate-500 dark:text-zinc-400 text-sm">{order.orderNumber}</p>
            </td>
            <td className="px-8 py-5">
                <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{order.user?.name}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">{order.user?.email}</p>
                </div>
            </td>
            <td className="px-8 py-5 text-sm text-slate-600 dark:text-zinc-300">
                {new Date(order.createdAt).toLocaleDateString('mn-MN')}
            </td>
            <td className="px-8 py-5 text-center">
                <span className="bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-300">
                    {order.items?.length}
                </span>
            </td>
            <td className="min-w-50 px-8 py-5" onClick={e => e.stopPropagation()}>
                <StatusSelector
                    status={order.status}
                    onChange={status => onStatusChange?.(order.id, status)}
                />
            </td>
            <td className="px-8 py-5 text-right">
                <p className="font-bold text-slate-900 dark:text-white">₮{order.totalPrice.toLocaleString()}</p>
            </td>
            <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-2">
                    <Tip label="Дэлгэрэнгүй харах">
                        <button onClick={handleView} className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </Tip>
                </div>
            </td>
        </tr>
    )
}

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="relative group/tip">
            {children}
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50">
                {label}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-200 dark:border-t-zinc-700" />
            </div>
        </div>
    );
}

export const getStatusColor = (status: string) => {
    switch (status) {
        case "Хүлээгдэж буй": return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
        case "Баталгаажсан": return "bg-blue-500/10 border-blue-500/20 text-blue-400";
        case "Бэлтгэгдэж байна": return "bg-orange-500/10 border-orange-500/20 text-orange-500";
        case "Хүргэгдсэн": return "bg-green-500/10 border-green-500/20 text-green-500";
        case "Цуцлагдсан": return "bg-red-500/10 border-red-500/20 text-red-500";
        default: return "bg-zinc-500/10 border-zinc-500/20 text-zinc-500";
    }
};

interface StatusInfo {
    name: string;
    color: string;
}

export const getOrderStatusInfo = (status: OrderStatus | string): StatusInfo => {
    const statusMap: Record<string, StatusInfo> = {
        [OrderStatus.PENDING]: {
            name: "Хүлээгдэж буй",
            color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
        },
        [OrderStatus.PAID]: {
            name: "Баталгаажсан",
            color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        },
        [OrderStatus.SHIPPED]: {
            name: "Хүргэлтэнд гарсан",
            color: "bg-orange-500/10 border-orange-500/20 text-orange-500",
        },
        [OrderStatus.DELIVERED]: {
            name: "Хүргэгдсэн",
            color: "bg-green-500/10 border-green-500/20 text-green-500",
        },
        [OrderStatus.CANCELLED]: {
            name: "Цуцлагдсан",
            color: "bg-red-500/10 border-red-500/20 text-red-500",
        },
    };

    // Хэрэв тодорхойгүй статус орж ирвэл default утга буцаана
    return statusMap[status] || {
        name: "Тодорхойгүй",
        color: "bg-zinc-500/10 border-zinc-500/20 text-zinc-500",
    };
};

export const STATUS_LIST = [
    OrderStatus.PENDING,
    OrderStatus.PAID,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
];

function StatusSelector({ status, onChange }: { status: OrderStatus; onChange: (s: OrderStatus) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const info = getOrderStatusInfo(status);

    React.useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div ref={ref} className="relative inline-block">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border transition-all hover:opacity-80 ${info.color}`}
            >
                {info.name}
                <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 top-full mt-1.5 left-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden min-w-40">
                    {STATUS_LIST.map(s => {
                        const si = getOrderStatusInfo(s);
                        return (
                            <button
                                key={s}
                                type="button"
                                onClick={() => { onChange(s); setOpen(false); }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800 ${s === status ? "opacity-50 cursor-default" : ""}`}
                            >
                                <span className={`px-2 py-0.5 rounded-full border ${si.color}`}>{si.name}</span>
                                {s === status && (
                                    <svg className="w-3 h-3 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}