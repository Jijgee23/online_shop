"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";
import Header from "@/app/components/Header";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";

const inputCls = "w-full bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/40 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600";
const labelCls = "block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5";

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                {desc && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{desc}</p>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

export default function ProfileEditPage() {
    const { user, checkUser } = useAuth();
    const router = useRouter();

    const [savingProfile, setSavingProfile] = useState(false);
    const [profile, setProfile] = useState({ name: "", email: "" });

    useEffect(() => {
        if (user) setProfile({ name: user.name ?? "", email: user.email ?? "" });
    }, [user]);

    const saveProfile = async () => {
        if (!profile.name.trim()) { toast.error("Нэр хоосон байж болохгүй"); return; }
        setSavingProfile(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: profile.name, email: profile.email }),
            });
            if (res.ok) { toast.success("Профайл шинэчлэгдлээ"); await checkUser(); }
            else { const d = await res.json(); toast.error(d.error ?? "Алдаа гарлаа"); }
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setSavingProfile(false); }
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
            <main className="max-w-2xl mx-auto px-4 pt-24">

                <button onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Буцах
                </button>

                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Профайл засах</h1>

                <Card title="Үндсэн мэдээлэл" desc="Нэр болон и-мэйл хаяг">
                    <div className="space-y-4">
                        <div>
                            <label className={labelCls}>Нэр</label>
                            <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                placeholder="Таны нэр" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>И-мэйл</label>
                            <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                                placeholder="name@example.com" className={inputCls} />
                        </div>
                    </div>
                    <div className="flex justify-end mt-5">
                        <button onClick={saveProfile} disabled={savingProfile}
                            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/20">
                            <Save className="w-4 h-4" />
                            {savingProfile ? "Хадгалж байна..." : "Хадгалах"}
                        </button>
                    </div>
                </Card>

            </main>
        </div>
    );
}
