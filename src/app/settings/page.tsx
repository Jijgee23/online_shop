"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";
import Header from "@/app/components/Header";
import toast from "react-hot-toast";
import { ArrowLeft, Lock, Eye, EyeOff, User as UserIcon, Phone } from "lucide-react";
import { Input } from "../../ui/Input";

const inputCls = "w-full bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/40 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600";
const labelCls = "block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5";

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-1 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                {desc && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{desc}</p>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function UserSettingsContent() {
    const { user, checkUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
    const [profile, setProfile] = useState({ name: "", email: "", phone: "" });

    const hasPassword = !!user?.password;
    const isGoogleConnected = !!user?.googleId;

    useEffect(() => {
        if (user) setProfile({ name: user.name, email: user.email, phone: user.phone });
    }, [user]);

    useEffect(() => {
        const success = searchParams.get("success");
        const error = searchParams.get("error");
        if (success === "google_connected") {
            toast.success("Google бүртгэл амжилттай холбогдлоо");
            checkUser();
        }
        if (error === "google_already_used") toast.error("Энэ Google бүртгэл өөр хэрэглэгчтэй холбоотой байна");
        if (error === "google_failed") toast.error("Google холболт амжилтгүй боллоо");
    }, []);

    const saveProfile = async () => {
        if (!profile.name.trim()) { toast.error("Нэр хоосон байна"); return; }
        setSavingProfile(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: profile.name.trim(), email: profile.email.trim(), phone: profile.phone.trim() }),
            });
            if (res.ok) { toast.success("Профайл шинэчлэгдлээ"); await checkUser(); }
            else { const d = await res.json(); toast.error(d.error ?? "Алдаа гарлаа"); }
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setSavingProfile(false); }
    };

    const savePassword = async () => {
        if (passwords.next !== passwords.confirm) { toast.error("Нууц үг таарахгүй байна"); return; }
        if (passwords.next.length < 6) { toast.error("Хамгийн багадаа 6 тэмдэгт байх ёстой"); return; }
        setSavingPassword(true);
        try {
            const body: any = { newPassword: passwords.next };
            if (hasPassword) body.currentPassword = passwords.current;
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                toast.success(hasPassword ? "Нууц үг солигдлоо" : "Нууц үг амжилттай үүслээ");
                setPasswords({ current: "", next: "", confirm: "" });
                await checkUser();
            } else { const d = await res.json(); toast.error(d.error ?? "Алдаа гарлаа"); }
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setSavingPassword(false); }
    };

    const disconnectGoogle = async () => {
        if (!confirm("Google холболтыг салгахдаа итгэлтэй байна уу?")) return;
        setDisconnecting(true);
        try {
            const res = await fetch("/api/auth/google/disconnect", { method: "POST" });
            const d = await res.json();
            if (res.ok) { toast.success("Google холболт салгагдлаа"); await checkUser(); }
            else toast.error(d.error ?? "Алдаа гарлаа");
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setDisconnecting(false); }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <button onClick={() => router.push("/auth/login")}
                    className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold">
                    Нэвтрэх
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <Header />
            <main className="max-w-2xl mx-auto px-4 pt-24 ">

                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Тохиргоо</h1>
                    <button onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Буцах
                    </button>
                </div>

                {/* ── Profile ── */}
                <Card title="Профайл" desc="Нэр, и-мэйл, утасны дугаараа засах">
                    <div className="space-y-4">
                        <div>
                            <label className={labelCls}>Нэр</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Нэрээ оруулна уу"
                                    className={`${inputCls} pl-10`}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>И-мэйл</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                                    placeholder="И-мэйл хаяг"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Утасны дугаар</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="99xxxxxx"
                                        className={`${inputCls} pl-10`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-5">
                        <button onClick={saveProfile} disabled={savingProfile}
                            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/20">
                            <UserIcon className="w-4 h-4" />
                            {savingProfile ? "Хадгалж байна..." : "Хадгалах"}
                        </button>
                    </div>
                </Card>

                <div className="h-8"></div>

                {/* ── Password ── */}
                <Card
                    title={hasPassword ? "Нууц үг солих" : "Нууц үг үүсгэх"}
                    desc={hasPassword ? "Одоогийн нууц үгээ оруулна уу" : "Бүртгэлдээ нууц үг тохируулснаар и-мэйлээр нэвтрэх боломжтой болно"}
                >
                    {!hasPassword && (
                        <div className="mb-4 flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3">
                            <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            Одоогоор нууц үггүй байна. Доорх маягтыг бөглөж нууц үг үүсгэнэ үү.
                        </div>
                    )}
                    <div className="space-y-4">
                        {hasPassword && (
                            <div>
                                <label className={labelCls}>Одоогийн нууц үг</label>
                                <div className="relative">
                                    <Input
                                        type={showCurrent ? "text" : "password"}
                                        value={passwords.current}
                                        onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                                        className={`${inputCls} pr-11`}
                                    />
                                    <button type="button" onClick={() => setShowCurrent(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>{hasPassword ? "Шинэ нууц үг" : "Нууц үг"}</label>
                                <div className="relative">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        value={passwords.next}
                                        onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                                        placeholder="••••••"
                                        className={`${inputCls} pr-11`}
                                    />
                                    <button type="button" onClick={() => setShowNew(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Нууц үг давтах</label>
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                                    placeholder="••••••"
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-5">
                        <button onClick={savePassword} disabled={savingPassword}
                            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/20">
                            <Lock className="w-4 h-4" />
                            {savingPassword ? "Хадгалж байна..." : hasPassword ? "Нууц үг солих" : "Нууц үг үүсгэх"}
                        </button>
                    </div>
                </Card>

                <div className="h-8"></div>

                {/* ── Google account ── */}
                <Card title="Google бүртгэл" desc="Google бүртгэлтэй холбох эсвэл салгах">
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
                            <a href="/api/auth/google/connect"
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
                </Card>

            </main>
        </div>
    );
}

export default function UserSettingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-teal-500" /></div>}>
            <UserSettingsContent />
        </Suspense>
    );
}
