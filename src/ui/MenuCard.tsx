"use client";

import { ChevronRight } from "lucide-react";

const COLOR_MAP: Record<string, string> = {
    blue: "bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400",
    teal: "bg-teal-50   dark:bg-teal-900/20   text-teal-600   dark:text-teal-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    red: "bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400",
    amber: "bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400",
    zinc: "bg-zinc-100  dark:bg-zinc-800      text-zinc-600   dark:text-zinc-400",
};

interface MenuCardProps {
    icon: React.ReactNode;
    title: string;
    desc?: string;
    color?: keyof typeof COLOR_MAP;
    onClick: () => void;
}

export default function MenuCard({ icon, title, desc, color = "blue", onClick }: MenuCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center justify-between w-full p-5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-md dark:hover:shadow-zinc-900/50 transition-all group text-left"
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl flex-shrink-0 ${COLOR_MAP[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
                    {desc && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{desc}</p>}
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-zinc-600 group-hover:translate-x-1 group-hover:text-teal-500 transition-all flex-shrink-0" />
        </button>
    );
}
