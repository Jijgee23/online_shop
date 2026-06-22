import React from "react";

interface CardProps {
    title?: string;
    desc?: string;
    children: React.ReactNode;
    className?: string;
}

export function Card({ title, desc, children, className }: CardProps) {
    return (
        <div className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden ${className ?? ""}`}>
            {title && (
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                    {desc && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{desc}</p>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
}
