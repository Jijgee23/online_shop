"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";
import AccountShell from "@/app/components/AccountShell";
import toast from "react-hot-toast";

const inputCls = "w-full bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/40 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600";
const labelCls = "block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-2";

function ProfileEditContent() {
    const { user, checkUser } = useAuth();
    const searchParams = useSearchParams();
    const hasPassword = !!user?.hasPassword;
    const isGoogleConnected = !!user?.googleId;

    const [disconnecting, setDisconnecting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ lastName: "", firstName: "", phone: "", email: "" });
    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const [savingPw, setSavingPw] = useState(false);
    const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
    const setPwField = (k: keyof typeof pw) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setPw(p => ({ ...p, [k]: e.target.value }));

    const savePassword = async () => {
        if (hasPassword && !pw.current.trim()) { toast.error("Одоогийн нууц үгийг оруулна уу"); return; }
        if (pw.next.length < 6) { toast.error("Нууц үг доод тал нь 6 тэмдэгт байх ёстой"); return; }
        if (pw.next !== pw.confirm) { toast.error("Нууц үг таарахгүй байна"); return; }
        setSavingPw(true);
        const t = toast.loading("Хадгалж байна...");
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: pw.current || undefined, newPassword: pw.next }),
            });
            if (!res.ok) { const d = await res.json(); toast.error(d.error ?? "Алдаа гарлаа", { id: t }); return; }
            await checkUser();
            setPw({ current: "", next: "", confirm: "" });
            toast.success(hasPassword ? "Нууц үг шинэчлэгдлээ" : "Нууц үг үүслээ", { id: t });
        } catch {
            toast.error("Алдаа гарлаа", { id: t });
        } finally {
            setSavingPw(false);
        }
    };

    useEffect(() => {
        const success = searchParams.get("success");
        const error = searchParams.get("error");
        if (success === "google_connected") { toast.success("Google бүртгэл амжилттай холбогдлоо"); checkUser(); }
        if (error === "google_already_used") toast.error("Энэ Google бүртгэл өөр хэрэглэгчтэй холбоотой байна");
        if (error === "google_failed") toast.error("Google холболт амжилтгүй боллоо");
    }, []);

    const disconnectGoogle = async () => {
        if (!confirm("Google холболтыг салгахдаа итгэлтэй байна уу?")) return;
        setDisconnecting(true);
        try {
            const res = await fetch("/api/auth/google/disconnect", { method: "POST" });
            const d = await res.json();
            if (res.ok) { toast.success("Google холболт салгагдлаа"); await checkUser(); }
            else toast.error(d.error ?? "Алдаа гарлаа");
        } catch {
            toast.error("Алдаа гарлаа");
        } finally {
            setDisconnecting(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        const parts = (user.name ?? "").trim().split(/\s+/);
        setForm({
            lastName: parts[0] ?? "",
            firstName: parts.slice(1).join(" "),
            phone: user.phone ?? "",
            email: user.email ?? "",
        });
    }, [user]);

    const save = async () => {
        if (!form.lastName.trim() && !form.firstName.trim()) { toast.error("Нэр оруулна уу"); return; }
        setSaving(true);
        const t = toast.loading("Хадгалж байна...");
        try {
            const name = [form.lastName.trim(), form.firstName.trim()].filter(Boolean).join(" ");
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone: form.phone || undefined, email: form.email || undefined }),
            });
            if (!res.ok) { const d = await res.json(); toast.error(d.error ?? "Алдаа гарлаа", { id: t }); return; }
            await checkUser();
            toast.success("Профайл шинэчлэгдлээ", { id: t });
        } catch {
            toast.error("Алдаа гарлаа", { id: t });
        } finally {
            setSaving(false);
        }
    };

    return (
        <AccountShell title="Миний профайл">
            <section className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-5">Хувийн мэдээлэл</h2>
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelCls}>Овог <span className="text-red-500">*</span></label>
                            <input value={form.lastName} onChange={set("lastName")} placeholder="Овог" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Нэр <span className="text-red-500">*</span></label>
                            <input value={form.firstName} onChange={set("firstName")} placeholder="Нэр" className={inputCls} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelCls}>Утасны дугаар</label>
                            <input value={form.phone} onChange={set("phone")} placeholder="99001122" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Имэйл хаяг</label>
                            <input type="email" value={form.email} onChange={set("email")} placeholder="name@example.com" className={inputCls} />
                        </div>
                    </div>
                    <div className="flex justify-end pt-1">
                        <button onClick={save} disabled={saving}
                            className="px-8 py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/20 text-sm">
                            {saving ? "Хадгалж байна..." : "Хадгалах"}
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 mt-5">
                <h2 className="font-bold text-slate-900 dark:text-white mb-1">
                    {hasPassword ? "Нууц үг солих" : "Нууц үг үүсгэх"}
                </h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mb-5">
                    {hasPassword
                        ? "Аюулгүй байдлыг хангахын тулд тогтмол шинэчилнэ үү"
                        : "Та нууц үг ашиглан нэвтрэх боломжтой болно"}
                </p>
                <div className="space-y-5">
                    {hasPassword && (
                        <div>
                            <label className={labelCls}>Одоогийн нууц үг</label>
                            <input type="password" value={pw.current} onChange={setPwField("current")} placeholder="••••••••" className={inputCls} />
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelCls}>Шинэ нууц үг</label>
                            <input type="password" value={pw.next} onChange={setPwField("next")} placeholder="••••••••" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Шинэ нууц үг давтах</label>
                            <input type="password" value={pw.confirm} onChange={setPwField("confirm")} placeholder="••••••••" className={inputCls} />
                        </div>
                    </div>
                    <div className="flex justify-end pt-1">
                        <button onClick={savePassword} disabled={savingPw}
                            className="px-8 py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/20 text-sm">
                            {savingPw ? "Хадгалж байна..." : hasPassword ? "Нууц үг солих" : "Нууц үг үүсгэх"}
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 mt-5">
                <h2 className="font-bold text-slate-900 dark:text-white mb-1">Google бүртгэл</h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mb-5">Google бүртгэлтэй холбох эсвэл салгах</p>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${isGoogleConnected ? "bg-blue-50 dark:bg-blue-500/10" : "bg-slate-100 dark:bg-zinc-800"}`}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill={isGoogleConnected ? "#4285F4" : "#9ca3af"} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill={isGoogleConnected ? "#34A853" : "#9ca3af"} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill={isGoogleConnected ? "#FBBC05" : "#9ca3af"} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill={isGoogleConnected ? "#EA4335" : "#9ca3af"} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Google</p>
                            <p className={`text-xs mt-0.5 ${isGoogleConnected ? "text-teal-500" : "text-slate-400 dark:text-zinc-500"}`}>
                                {isGoogleConnected ? "Холбогдсон байна" : "Холбогдоогүй байна"}
                            </p>
                        </div>
                    </div>

                    {isGoogleConnected ? (
                        <button
                            onClick={disconnectGoogle}
                            disabled={disconnecting || !hasPassword}
                            title={!hasPassword ? "Нууц үг тохируулсны дараа салгах боломжтой" : ""}
                            className="px-4 py-2 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-800/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {disconnecting ? "Салгаж байна..." : "Салгах"}
                        </button>
                    ) : (
                        <a href="/api/auth/google/connect?from=/profile/edit"
                            className="px-4 py-2 text-sm font-semibold rounded-xl bg-teal-500 hover:bg-teal-400 text-white transition-colors">
                            Холбох
                        </a>
                    )}
                </div>

                {isGoogleConnected && !hasPassword && (
                    <p className="mt-4 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3">
                        Энэ бүртгэл зөвхөн Google-ээр нэвтэрдэг. Салгахын тулд эхлээд нууц үг тохируулна уу.
                    </p>
                )}
            </section>
        </AccountShell>
    );
}

export default function ProfileEditPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-teal-500" /></div>}>
            <ProfileEditContent />
        </Suspense>
    );
}
