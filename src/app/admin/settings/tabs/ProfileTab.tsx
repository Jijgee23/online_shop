"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/auth_context";
import { CardSection, Field, SaveBtn, inputCls } from "../shared";

export default function ProfileTab() {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [showPass, setShowPass] = useState(false);
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
