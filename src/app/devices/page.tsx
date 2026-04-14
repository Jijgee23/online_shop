"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";
import Header from "@/app/components/Header";
import { ArrowLeft, Monitor, Smartphone, Globe, Trash2, Wifi } from "lucide-react";
import toast from "react-hot-toast";

function platformIcon(platform: string | null) {
    if (platform === "android" || platform === "ios") return <Smartphone className="w-5 h-5" />;
    if (platform === "web") return <Monitor className="w-5 h-5" />;
    return <Globe className="w-5 h-5" />;
}

function platformLabel(platform: string | null) {
    if (platform === "android") return "Android";
    if (platform === "ios") return "iOS";
    if (platform === "web") return "Веб";
    return "Тодорхойгүй";
}

function platformColor(platform: string | null) {
    if (platform === "android") return "bg-green-500/10 text-green-400";
    if (platform === "ios") return "bg-blue-500/10 text-blue-400";
    if (platform === "web") return "bg-teal-500/10 text-teal-400";
    return "bg-slate-500/10 text-slate-400";
}

export default function DevicesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<number | null>(null);

    useEffect(() => {
        if (!user) { router.push("/auth/login"); return; }
        fetch("/api/devices")
            .then(r => r.json())
            .then(d => setDevices(d.devices ?? []))
            .finally(() => setLoading(false));
    }, [user, router]);

    const handleRemove = async (id: number) => {
        setRemoving(id);
        try {
            const res = await fetch("/api/devices", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error();
            setDevices(prev => prev.filter(d => d.id !== id));
            toast.success("Төхөөрөмж устгагдлаа");
        } catch {
            toast.error("Алдаа гарлаа");
        } finally {
            setRemoving(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <Header />
            <main className="max-w-2xl mx-auto px-6 pt-24">

                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Миний төхөөрөмжүүд</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Бүртгэлтэй төхөөрөмжүүд</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
                    </div>
                ) : devices.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-16 text-center">
                        <Monitor className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <p className="font-semibold text-slate-400 dark:text-slate-500">Төхөөрөмж бүртгэлгүй байна</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {devices.map(device => (
                            <div
                                key={device.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${platformColor(device.platform)}`}>
                                            {platformIcon(device.platform)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {device.deviceName || "Нэргүй төхөөрөмж"}
                                            </p>
                                            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${platformColor(device.platform)}`}>
                                                {platformLabel(device.platform)}
                                            </span>

                                            {device.lastSeenAt && (
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                                                    Сүүлд: {new Date(device.lastSeenAt).toLocaleString("mn-MN")}
                                                </p>
                                            )}

                                            {device.ipAddresses?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {device.ipAddresses.map((ip: string) => (
                                                        <span key={ip} className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg font-mono">
                                                            <Wifi className="w-2.5 h-2.5" />
                                                            {ip}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRemove(device.id)}
                                        disabled={removing === device.id}
                                        className="p-2 rounded-xl text-slate-300 dark:text-slate-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition disabled:opacity-50"
                                    >
                                        {removing === device.id
                                            ? <div className="w-4 h-4 border-t-2 border-red-400 rounded-full animate-spin" />
                                            : <Trash2 className="w-4 h-4" />
                                        }
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
