"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User, ShieldCheck, KeyRound, ArrowLeft, RefreshCw, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const OTP_SECONDS = 5 * 60;

export default function AdminRegister() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Step 1
    const [email, setEmail] = useState("");

    // Step 2 – OTP + timer
    const [otp, setOtp] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Step 3
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [specialCode, setSpecialCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSpecial, setShowSpecial] = useState(false);

    const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    // ── Timer ────────────────────────────────────────────────────────────────
    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setSecondsLeft(OTP_SECONDS);
        timerRef.current = setInterval(() => {
            setSecondsLeft(s => {
                if (s <= 1) { clearInterval(timerRef.current!); return 0; }
                return s - 1;
            });
        }, 1000);
    };

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    const formatTime = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    // ── Step 1: send OTP ─────────────────────────────────────────────────────
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/getOtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type: "SIGNUP" }),
            });
            const data = await res.json();
            if (res.ok) {
                setStep(2);
                startTimer();
            } else {
                setError(data.message || "OTP илгээхэд алдаа гарлаа");
            }
        } catch {
            setError("Сервертэй холбогдоход алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    // ── Resend OTP ───────────────────────────────────────────────────────────
    const handleResend = async () => {
        setLoading(true);
        setError("");
        setOtp("");
        try {
            const res = await fetch("/api/auth/getOtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type: "SIGNUP" }),
            });
            const data = await res.json();
            if (res.ok) {
                startTimer();
            } else {
                setError(data.message || "OTP дахин илгээхэд алдаа гарлаа");
            }
        } catch {
            setError("Сервертэй холбогдоход алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: confirm OTP → step 3 ─────────────────────────────────────────
    const handleConfirmOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (timerRef.current) clearInterval(timerRef.current);
        setError("");
        setStep(3);
    };

    // ── Step 3: register ─────────────────────────────────────────────────────
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) { setError("Нууц үг таарахгүй байна"); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, speacialCode: specialCode, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Админ амжилттай бүртгэгдлээ, нэвтэрнэ үү");
                router.push("/auth/login");
            } else {
                setError(data.message || "Бүртгэл амжилтгүй боллоо");
                if (data.message?.includes("Код") || data.message?.includes("хугацаа")) setStep(2);
            }
        } catch {
            setError("Сервертэй холбогдоход алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    const stepMeta = {
        1: {
            icon: <Mail className="w-8 h-8 text-teal-600 dark:text-teal-400" />,
            title: "Имэйл оруулах",
            sub: "Баталгаажуулах код илгээх имэйл хаягаа оруулна уу",
        },
        2: {
            icon: <KeyRound className="w-8 h-8 text-teal-600 dark:text-teal-400" />,
            title: "Код баталгаажуулах",
            sub: <><span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span> хаягт код илгээлээ</>,
        },
        3: {
            icon: <ShieldCheck className="w-8 h-8 text-teal-600 dark:text-teal-400" />,
            title: "Мэдээлэл бөглөх",
            sub: "Админ бүртгэлийн мэдээллээ оруулна уу",
        },
    } as const;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
            <div className="absolute top-0 left-0 w-72 h-72 bg-teal-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 blur-[120px] rounded-full" />

            <div className="w-full max-w-md z-10">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 bg-teal-50 dark:bg-teal-900/30 rounded-2xl mb-4">
                            {stepMeta[step].icon}
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {stepMeta[step].title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                            {stepMeta[step].sub}
                        </p>
                        {/* Step dots */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                            {([1, 2, 3] as const).map(s => (
                                <div key={s} className={`h-1.5 rounded-full transition-all duration-300
                                    ${step === s ? "w-8 bg-teal-500" : step > s ? "w-4 bg-teal-300 dark:bg-teal-700" : "w-4 bg-slate-200 dark:bg-slate-700"}`}
                                />
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-600 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* ── Step 1: email ── */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Имэйл хаяг</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="email"
                                        placeholder="admin@example.mn"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading
                                    ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><Mail className="w-5 h-5" /> OTP код илгээх</>
                                }
                            </button>

                            <div className="text-center">
                                <button type="button" onClick={() => router.back()} className="text-slate-500 hover:text-teal-500 text-sm font-medium transition-colors">
                                    Буцах
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── Step 2: OTP + timer ── */}
                    {step === 2 && (
                        <form onSubmit={handleConfirmOtp} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Баталгаажуулах код</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="6 оронтой код"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white text-center tracking-[0.4em] text-lg font-bold"
                                    />
                                </div>
                            </div>

                            {/* Timer */}
                            <div className="flex justify-center">
                                {secondsLeft > 0 ? (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                                        <div className={`h-2 w-2 rounded-full animate-pulse ${secondsLeft < 60 ? "bg-red-500" : "bg-teal-500"}`} />
                                        <span className={`text-sm font-mono font-bold tabular-nums ${secondsLeft < 60 ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}>
                                            {formatTime(secondsLeft)}
                                        </span>
                                        <span className="text-xs text-slate-400">дараа хүчингүй болно</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-red-500 font-semibold">Кодын хугацаа дууслаа</span>
                                )}
                            </div>

                            <button
                                disabled={otp.length < 6 || secondsLeft === 0}
                                type="submit"
                                className="w-full bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                Үргэлжлүүлэх
                            </button>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setOtp(""); setError(""); if (timerRef.current) clearInterval(timerRef.current); }}
                                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Буцах
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={loading || secondsLeft > 0}
                                    className="flex items-center gap-1.5 text-sm text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-40 disabled:no-underline transition-colors"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                    Дахин илгээх
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── Step 3: registration form ── */}
                    {step === 3 && (
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Нэр</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Админы нэр"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Нууц үг</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
                                    />
                                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Нууц үг давтах</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className={`w-full pl-12 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border rounded-2xl focus:ring-2 outline-none transition-all dark:text-white
                                            ${passwordMismatch ? "border-red-400 dark:border-red-500 focus:ring-red-400/30" : "border-slate-200 dark:border-slate-700 focus:ring-teal-500"}`}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordMismatch && <p className="text-xs text-red-500 ml-1">Нууц үг таарахгүй байна</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Системийн тусгай код</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type={showSpecial ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={specialCode}
                                        onChange={e => setSpecialCode(e.target.value)}
                                        className="w-full pl-12 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
                                    />
                                    <button type="button" onClick={() => setShowSpecial(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                        {showSpecial ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                disabled={loading || passwordMismatch}
                                type="submit"
                                className="w-full bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading
                                    ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><UserPlus className="w-5 h-5" /> Админ үүсгэх</>
                                }
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
