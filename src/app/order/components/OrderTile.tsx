"use client";

import { Order, OrderStatus } from "@/interface/order";
import { ChevronRight, Clock, CheckCircle2, Truck, Package, Ban, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const STATUS_CONFIG: Record<string, {
    label: string;
    icon: React.ElementType;
    cls: string;
    bar: string;
    progress: number;
}> = {
    PENDING:   { label: "Хүлээгдэж буй",     icon: Clock,         cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",  bar: "bg-amber-400",  progress: 10  },
    PAID:      { label: "Баталгаажсан",       icon: ShieldCheck,   cls: "bg-teal-100  text-teal-700  dark:bg-teal-900/30  dark:text-teal-300",   bar: "bg-teal-400",   progress: 38  },
    SHIPPED:   { label: "Хүргэлтэнд гарсан", icon: Truck,         cls: "bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-300",   bar: "bg-blue-400",   progress: 68  },
    DELIVERED: { label: "Хүргэгдсэн",        icon: CheckCircle2,  cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",  bar: "bg-green-400",  progress: 100 },
    CANCELLED: { label: "Цуцлагдсан",        icon: Ban,           cls: "bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-300",    bar: "bg-red-400",    progress: 100 },
};

export default function OrderTile(order: Order) {
    const router  = useRouter();
    const cfg     = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
    const Icon    = cfg.icon;
    const date    = new Date(order.createdAt);
    const dateStr = `${date.getFullYear()}/${String(date.getMonth()+1).padStart(2,"0")}/${String(date.getDate()).padStart(2,"0")}`;

    const thumb = order.items?.[0]?.product?.images?.[0]?.url;
    const extra = (order.items?.length ?? 1) - 1;

    return (
        <div
            onClick={() => router.push(`/order/${order.id}`)}
            className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-200 overflow-hidden"
        >
            {/* Progress track */}
            <div className="h-1 bg-slate-100 dark:bg-slate-800">
                <div
                    className={`h-full ${cfg.bar} transition-all duration-500 ${order.status === "CANCELLED" ? "opacity-40" : ""}`}
                    style={{ width: `${cfg.progress}%` }}
                />
            </div>

            <div className="p-5 flex items-center gap-4">
                {/* Thumbnail stack */}
                <div className="relative flex-shrink-0 w-14 h-14">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden ring-2 ring-white dark:ring-slate-900">
                        {thumb
                            ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                    </div>
                    {extra > 0 && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                            +{extra}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm font-mono tracking-wide">
                            {String(order.orderNumber)}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.cls}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{dateStr} · {order.totalCount} бараа</p>
                    <p className="font-extrabold text-slate-900 dark:text-white mt-1">₮{Number(order.totalPrice).toLocaleString()}</p>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-teal-500 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
            </div>
        </div>
    );
}
