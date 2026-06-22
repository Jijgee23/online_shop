"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { CardSection, Field, SaveBtn } from "../shared";

const MAX_BANNERS = 5;

export default function BannerTab() {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const bannerRef = useRef<HTMLInputElement>(null);
    const [banners, setBanners] = useState<string[]>([]);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(d => {
                if (d.data) setBanners(Array.isArray(d.data.banners) ? d.data.banners : []);
            })
            .finally(() => setLoading(false));
    }, []);

    const onPickBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (bannerRef.current) bannerRef.current.value = "";
        if (!files.length) return;

        const free = MAX_BANNERS - banners.length;
        if (free <= 0) { toast.error(`Хамгийн ихдээ ${MAX_BANNERS} баннер`); return; }
        const picked = files.slice(0, free);
        if (files.length > free) toast.error(`Зөвхөн ${free} баннер нэмэгдэнэ (дээд тал ${MAX_BANNERS})`);

        setUploadingBanner(true);
        try {
            const urls: string[] = [];
            for (const file of picked) {
                if (!file.type.startsWith("image/")) continue;
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                const d = await res.json();
                if (res.ok && d.url) urls.push(d.url);
                else toast.error(d.error ?? "Ачаалахад алдаа гарлаа");
            }
            if (urls.length) {
                setBanners(p => [...p, ...urls].slice(0, MAX_BANNERS));
                toast.success("Баннер ачаалагдлаа. Хадгалахаа бүү мартаарай");
            }
        } catch { toast.error("Ачаалахад алдаа гарлаа"); }
        finally { setUploadingBanner(false); }
    };

    const removeBanner = (idx: number) =>
        setBanners(p => p.filter((_, i) => i !== idx));

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ banners }),
            });
            if (res.ok) toast.success("Хадгалагдлаа");
            else toast.error("Алдаа гарлаа");
        } catch { toast.error("Алдаа гарлаа"); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="space-y-5 animate-pulse">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
                <div className="h-4 w-32 bg-slate-100 dark:bg-zinc-800 rounded-lg" />
                <div className="h-28 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
            </div>
        </div>
    );

    return (
        <>
            <CardSection title="Баннер" desc="Нүүр хуудасны дээд талд харагдах баннер зургууд">
                <Field label={`Баннер (${banners.length}/${MAX_BANNERS})`}>
                    <div className="space-y-3">
                        {banners.length > 0 && (
                            <div className="space-y-2">
                                {banners.map((url, idx) => (
                                    <div key={url + idx} className="relative w-full aspect-[3/1] rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 overflow-hidden group">
                                        <Image src={url} alt={`Баннер ${idx + 1}`} fill className="object-cover" />
                                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/50 text-white text-xs font-semibold">{idx + 1}</span>
                                        <button type="button" onClick={() => removeBanner(idx)}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-red-500 transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {banners.length < MAX_BANNERS && (
                            <button type="button" onClick={() => bannerRef.current?.click()} disabled={uploadingBanner}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-sm font-semibold transition-colors disabled:opacity-60">
                                {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                                Баннер нэмэх
                            </button>
                        )}
                        <p className="text-xs text-slate-400 dark:text-zinc-500">Нүүр хуудасны дээд талд харагдана. 2-оос дээш бол автоматаар ээлжлэн солигдоно. Өргөн зураг (3:1 харьцаа) тохиромжтой</p>
                        <input ref={bannerRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickBanner} />
                    </div>
                </Field>
            </CardSection>

            <div className="flex justify-end"><SaveBtn onClick={save} saving={saving} /></div>
        </>
    );
}
