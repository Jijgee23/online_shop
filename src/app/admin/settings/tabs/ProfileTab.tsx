"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Link2, Link2Off } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";
import { CardSection, Field, SaveBtn, inputCls } from "../shared";

export default function ProfileTab() {
    const { user, checkUser } = useAuth();
    const searchParams = useSearchParams();
    const [saving, setSaving] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    // Handle OAuth redirect results
    useEffect(() => {
        const success = searchParams.get("success");
        const error = searchParams.get("error");
        if (success === "google_connected") { toast.success("Google холбогдлоо"); checkUser(); }
        if (error === "google_already_used") toast.error("Энэ Google бүртгэл өөр хэрэглэгчтэй холбоотой байна");
    }, []);
    const [form, setForm] = useState({
        name:            user?.name  ?? "",
        email:           user?.email ?? "",
        currentPassword: "",
        newPassword:     "",
        confirmPassword: "",
    });

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const saveProfile = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name, email: form.email }),
            });
            if (res.ok) toast.success("Профайл шинэчлэгдлээ");
            else toast.error("Алдаа гарлаа");
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setSaving(false); }
    };

    const disconnectGoogle = async () => {
        setGoogleLoading(true);
        try {
            const res = await fetch("/api/auth/google/disconnect", { method: "POST" });
            const d = await res.json();
            if (res.ok) { toast.success("Google холболт салгагдлаа"); checkUser(); }
            else toast.error(d.error ?? "Алдаа гарлаа");
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setGoogleLoading(false); }
    };

    const changePassword = async () => {
        if (form.newPassword !== form.confirmPassword) { toast.error("Нууц үг таарахгүй байна"); return; }
        if (form.newPassword.length < 6) { toast.error("Хамгийн багадаа 6 тэмдэгт байх ёстой"); return; }
        setSaving(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
            });
            if (res.ok) {
                toast.success("Нууц үг солигдлоо");
                setForm(p => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
            } else {
                const d = await res.json();
                toast.error(d.error ?? "Алдаа гарлаа");
            }
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setSaving(false); }
    };

    return (
        <>
            <CardSection title="Үндсэн мэдээлэл" desc="Нэр болон и-мэйл хаяг">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white">{user?.name}</p>
                        <p className="text-sm text-slate-400 dark:text-zinc-500">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-500 px-2 py-0.5 rounded-full">{user?.role}</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Нэр"><input value={form.name} onChange={set("name")} className={inputCls} /></Field>
                    <Field label="И-мэйл"><input type="email" value={form.email} onChange={set("email")} className={inputCls} /></Field>
                </div>
                <div className="flex justify-end mt-4"><SaveBtn onClick={saveProfile} saving={saving} /></div>
            </CardSection>

            {/* Google account */}
            <CardSection title="Google бүртгэл" desc="Google акаунтаа холбох эсвэл салгах">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">Google</p>
                            {user?.googleId
                                ? <p className="text-xs text-teal-500 font-medium flex items-center gap-1"><Link2 className="w-3 h-3" /> Холбогдсон</p>
                                : <p className="text-xs text-slate-400">Холбогдоогүй</p>
                            }
                        </div>
                    </div>

                    {user?.googleId ? (
                        <button
                            onClick={disconnectGoogle}
                            disabled={googleLoading || !user.password}
                            title={!user.password ? "Нууц үг тохируулаагүй тул салгах боломжгүй" : undefined}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {googleLoading
                                ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                                : <Link2Off className="w-4 h-4" />
                            }
                            Салгах
                        </button>
                    ) : (
                        <a
                            href="/api/auth/google/connect"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-colors"
                        >
                            <Link2 className="w-4 h-4" />
                            Холбох
                        </a>
                    )}
                </div>
                {user?.googleId && !user.password && (
                    <p className="mt-3 text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                        Нууц үг тохируулаагүй тул Google холболтыг салгах боломжгүй. Эхлээд нууц үг тохируулна уу.
                    </p>
                )}
            </CardSection>

            <CardSection title="Нууц үг солих" desc="Одоогийн нууц үгийг оруулна уу">
                <div className="space-y-4">
                    <Field label="Одоогийн нууц үг">
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                value={form.currentPassword}
                                onChange={set("currentPassword")}
                                className={`${inputCls} pr-12`}
                            />
                            <button type="button" onClick={() => setShowPass(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Шинэ нууц үг">
                            <input type="password" value={form.newPassword} onChange={set("newPassword")} className={inputCls} />
                        </Field>
                        <Field label="Нууц үг давтах">
                            <input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} className={inputCls} />
                        </Field>
                    </div>
                </div>
                <div className="flex justify-end mt-4"><SaveBtn onClick={changePassword} saving={saving} /></div>
            </CardSection>
        </>
    );
}
