import React from "react";

type BadgeColor = "teal" | "red" | "amber" | "blue" | "green" | "slate";

const COLOR_MAP: Record<BadgeColor, string> = {
    teal:  "bg-teal-500/10 border-teal-500/20 text-teal-400",
    red:   "bg-red-500/10 border-red-500/20 text-red-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    blue:  "bg-blue-500/10 border-blue-500/20 text-blue-400",
    green: "bg-green-500/10 border-green-500/20 text-green-500",
    slate: "bg-slate-100 dark:bg-zinc-800 border-transparent text-slate-600 dark:text-zinc-300",
};

interface BadgeProps {
    color?: BadgeColor;
    cls?: string;
    children: React.ReactNode;
    className?: string;
}

export function Badge({ color, cls, children, className }: BadgeProps) {
    const colorCls = color ? COLOR_MAP[color] : (cls ?? COLOR_MAP.slate);
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${colorCls} ${className ?? ""}`}>
            {children}
        </span>
    );
}
