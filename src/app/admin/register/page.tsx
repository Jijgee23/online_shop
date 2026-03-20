
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User, ShieldCheck, } from "lucide-react";

export default function AdminRegister() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/admin/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push("/admin"); // Амжилттай бол хянах самбар руу
            } else {
                const errData = await res.json();
                setError(errData.message || "Бүртгэл амжилтгүй боллоо");
            }
        } catch (err) {
            setError("Сервертэй холбогдоход алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-teal-500/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md z-10">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 bg-teal-50 dark:bg-teal-900/30 rounded-2xl mb-4">
                            <ShieldCheck className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Админ бүртгэх</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Шинэ админ хэрэглэгч үүсгэх хэсэг</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-600"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Нэр</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    name="name"
                                    type="text"
                                    placeholder="Админы нэр"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Имэйл хаяг</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="admin@example.mn"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Нууц үг</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Системийн тусгай код</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    name="speacialCode"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                        </div>
                        {/* Submit Button */}
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Админ үүсгэх
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer link */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => router.back()}
                            className="text-slate-500 hover:text-teal-500 text-sm font-medium transition-colors inline-flex items-center gap-1"
                        >
                            Буцах
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}