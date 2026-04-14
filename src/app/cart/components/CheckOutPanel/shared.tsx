import React from "react";
import { AddressInput } from "@/app/context/address_context";

// ─── Constants ────────────────────────────────────────────────────────────────

export const PAYMENT_METHODS = [
    { id: "QPAY", settingsKey: "payQpay", label: "QPay", desc: "QR кодоор төлөх", icon: "📱" },
];

export const STEPS = ["summary", "address", "pay", "done"] as const;
export type Step = typeof STEPS[number];

export const STEP_LABELS: Record<Step, string> = {
    summary: "Хэсэг", address: "Хаяг", pay: "Төлөх", done: "Дууслаа",
};

export const EMPTY_ADDR: AddressInput = { city: "Улаанбаатар", districtId: 0, khoroo: "", detail: "", phone: "" };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CheckoutPanelProps {
    cart: any;
    step: Step; setStep: (s: Step) => void;
    selectedAddressId: number | null; setSelectedAddressId: (id: number | null) => void;
    myAddresses: any[];
    note: string; setNote: (n: string) => void;
    showAddressForm: boolean; setShowAddressForm: (v: boolean) => void;
    savingAddress: boolean;
    districts: { id: number; name: string }[];
    newAddr: AddressInput; setNewAddr: React.Dispatch<React.SetStateAction<AddressInput>>;
    handleSaveNewAddress: (e: React.FormEvent) => void;
    onQPayDone: (orderNumber: string) => void;
    orderNumber: string;
    resetCheckout: () => void;
    onStartCheckout: () => void;
}

// ─── UI primitives ────────────────────────────────────────────────────────────

export function StepHeader({ title, onBack }: { title: string; onBack: () => void }) {
    return (
        <div className="flex items-center gap-2 mb-5">
            <button onClick={onBack} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
    );
}

export function RadioCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} className={`w-full text-left p-3 sm:p-4 rounded-2xl border transition-all
            ${selected ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20" : "border-slate-200 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-700"}`}>
            <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${selected ? "border-teal-500" : "border-slate-300 dark:border-zinc-600"}`}>
                    {selected && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                </div>
                <div className="flex-1">{children}</div>
            </div>
        </button>
    );
}

export function Btn({ onClick, disabled, children, color, className }: {
    onClick?: () => void; disabled?: boolean; children: React.ReactNode; color?: string; className?: string;
}) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold text-white text-sm sm:text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                ${color ?? "bg-teal-500 hover:bg-teal-400 shadow-lg shadow-teal-500/20"} ${className ?? ""}`}>
            {children}
        </button>
    );
}

export function Row({ label, value, valueClass = "font-semibold text-slate-900 dark:text-white" }: {
    label: string; value: string; valueClass?: string;
}) {
    return (
        <div className="flex justify-between text-sm text-slate-500 dark:text-zinc-400">
            <span>{label}</span><span className={valueClass}>{value}</span>
        </div>
    );
}

export function AddrInput({ label, value, onChange, placeholder, type = "text", required }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/30 placeholder:text-slate-400 dark:placeholder:text-zinc-600" />
        </div>
    );
}
