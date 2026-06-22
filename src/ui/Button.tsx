import { Save } from "lucide-react";
import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "icon";
type Size = "sm" | "md" | "lg";

const VARIANT_CLS: Record<Variant, string> = {
    primary:   "bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20",
    secondary: "border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800",
    danger:    "hover:bg-red-500/20 text-slate-400 dark:text-zinc-500 hover:text-red-500",
    ghost:     "text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-white",
    icon:      "p-2 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white",
};

const SIZE_CLS: Record<Size, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-sm",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    saving?: boolean;
    icon?: React.ReactNode;
}

export function Button({ variant = "primary", size = "md", saving, disabled, icon, className, children, ...props }: ButtonProps) {
    const isIcon = variant === "icon";
    return (
        <button
            disabled={disabled || saving}
            className={`inline-flex items-center gap-2 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${isIcon ? VARIANT_CLS.icon : `${VARIANT_CLS[variant]} ${SIZE_CLS[size]}`} ${className ?? ""}`}
            {...props}
        >
            {icon}
            {saving ? "Хадгалж байна..." : children}
        </button>
    );
}

export function SaveBtn({ onClick, saving, label }: { onClick: () => void; saving: boolean; label?: string }) {
    return (
        <Button onClick={onClick} saving={saving} icon={<Save className="w-4 h-4" />} variant="primary" size="md">
            {label ?? "Хадгалах"}
        </Button>
    );
}
