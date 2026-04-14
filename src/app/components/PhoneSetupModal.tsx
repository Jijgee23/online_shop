"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/auth_context";

export default function PhoneSetupModal() {
    const { user, checkUser } = useAuth();
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dismissed, setDismissed] = useState(false);

    const needsPhone = !!user && !/^[789]\d{7}$/.test(user.phone ?? "");
    if (!needsPhone || dismissed) return null;

    const handleSave = async () => {
        const cleaned = phone.trim();
        if (!cleaned || cleaned.length < 8) {
            setError("8 оронтой утасны дугаар оруулна уу");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: cleaned }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Алдаа гарлаа");
                return;
            }
            await checkUser();
        } catch {
            setError("Алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-5">
                {/* Icon + title */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">Утасны дугаар нэмэх</h3>
                        <p className="text-sm text-slate-400 dark:text-zinc-500 mt-0.5">
                            Захиалга хүргэлтэд зориулан утасны дугаараа оруулна уу.
                        </p>
                    </div>
                </div>

                {/* Input */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        Утасны дугаар
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+976</span>
                        <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={8}
                            value={phone}
                            onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                            onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                            placeholder="99001234"
                            className="w-full pl-16 pr-4 py-3 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setDismissed(true)}
                        className="flex-1 py-3 rounded-2xl text-sm font-semibold text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Дараа
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || phone.length < 8}
                        className="flex-1 py-3 rounded-2xl text-sm font-bold bg-teal-500 hover:bg-teal-400 text-white transition-colors disabled:opacity-50 shadow-lg shadow-teal-500/20"
                    >
                        {loading ? "Хадгалж байна..." : "Хадгалах"}
                    </button>
                </div>
            </div>
        </div>
    );
}
