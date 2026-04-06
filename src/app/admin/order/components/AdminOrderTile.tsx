import React from "react";
import { Order, OrderStatus } from "@/interface/order";
import { useRouter } from "next/navigation";
export default function AdminOrderTile(order: Order) {
    const router = useRouter()

    const handleTap = () => {
        router.push(`/admin/order/${order.id}`)
    }
    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/admin/order/${order.id}`)
    }
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/admin/order/${order.id}`)
    }
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/admin/order/${order.id}`)
    }
    return (
        <tr
            key={order.id} onClick={handleTap} className="hover:bg-slate-100 dark:hover:bg-zinc-800/30 transition-all group">
            <td className="px-8 py-5">
                <p className="font-mono text-slate-500 dark:text-zinc-400 text-sm">{order.orderNumber}</p>
            </td>
            <td className="px-8 py-5">
                <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{order.user?.name}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">{order.user!.email}</p>
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
            <td className="px-8 py-5">
                {(() => {
                    // Функцийг нэг удаа дуудаж утгыг нь авна
                    const status = getOrderStatusInfo(order.status);
                    return (
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${status.color}`}>
                            {status.name}
                        </span>
                    );
                })()}
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
                    <Tip label="Засварлах">
                        <button onClick={handleEdit} className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    </Tip>
                    <Tip label="Цуцлах">
                        <button onClick={handleDelete} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 dark:text-zinc-500 hover:text-red-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
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