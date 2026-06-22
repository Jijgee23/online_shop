import React from "react";

const INPUT_CLS = "w-full bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/30 placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-all";

interface FieldProps {
    label: string;
    children?: React.ReactNode;
    value?: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
}

export function Field({ label, children, value, onChange, placeholder, type = "text", required }: FieldProps) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                {label}
            </label>
            {children ?? (
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange?.(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className={INPUT_CLS}
                />
            )}
        </div>
    );
}

export { INPUT_CLS as fieldInputCls };
