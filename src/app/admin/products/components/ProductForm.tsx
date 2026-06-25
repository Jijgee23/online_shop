"use client";

import { useAdmin } from "@/app/context/admin_context";
import { useCategory } from "@/app/context/category_context";
import ImageCropper from "@/app/components/ImageCropper";
import { useImageCrop } from "@/utils/useImageCrop";
import { ProductImage } from "@/interface/product";
import toast from "react-hot-toast";
import { imgUrl } from "@/utils/imgUrl";
import { useEffect, useState } from "react";
import DropdownSelect from "@/ui/DropdownSelect";
import { ProductBulk } from "./ProductBulk";
import DividerLine from "./DividerLine";

// ─── Types ────────────────────────────────────────────────────────────────────

type AttrType = "COLOR" | "SIZE" | "MATERIAL" | "DESIGN";
type AttrValue = { value: string; hex?: string; imageUrl?: string | null };
type Attribute = { type: AttrType; values: AttrValue[] };
type Feature = { title: string; description: string };
// Админ гараар үүсгэх хувилбар: attribute төрөл бүрд сонгосон утга + нөөц/үнэ
type VariantRow = {
    values: Partial<Record<AttrType, string>>;
    stock: string; price: string; discountPrice: string; sku: string;
    auto?: boolean; // зургийн холболтоос автоматаар үүссэн эсэх
};

// Хувилбарын утгуудыг харьцуулах тогтвортой гарын үсэг (signature)
const variantSig = (vals: Partial<Record<AttrType, string>>) =>
    (["COLOR", "SIZE", "MATERIAL", "DESIGN"] as AttrType[])
        .map(t => `${t}=${(vals[t] ?? "").trim()}`).join("|");

// API-аас ачаалсан барааны attribute/variant бүтэц (edit горимд)
type LoadedAttrValue = { id: number; value: string; hex?: string | null; imageUrl?: string | null };
type LoadedAttr = { type: AttrType; values?: LoadedAttrValue[] };
type LoadedVariant = {
    stock?: number | null;
    price?: number | string | null;
    discountPrice?: number | string | null;
    sku?: string | null;
    values?: { attributeValueId: number }[];
};

const ATTR_TYPES: { type: AttrType; label: string; icon: string }[] = [
    { type: "COLOR", label: "Өнгө", icon: "🎨" },
    { type: "SIZE", label: "Хэмжээ", icon: "📏" },
    { type: "MATERIAL", label: "Материал", icon: "🧵" },
    { type: "DESIGN", label: "Загвар", icon: "✨" },
];
const ATTR_LABEL: Record<AttrType, string> = { COLOR: "Өнгө", SIZE: "Хэмжээ", MATERIAL: "Материал", DESIGN: "Загвар" };

// Өнгө сонгоход эхэлж харагдах түгээмэл суурь өнгөнүүд
const BASE_COLORS: { name: string; hex: string }[] = [
    { name: "Хар", hex: "#000000" },
    { name: "Цагаан", hex: "#FFFFFF" },
    { name: "Саарал", hex: "#9CA3AF" },
    { name: "Улаан", hex: "#EF4444" },
    { name: "Ягаан", hex: "#EC4899" },
    { name: "Улбар шар", hex: "#F97316" },
    { name: "Шар", hex: "#FACC15" },
    { name: "Ногоон", hex: "#22C55E" },
    { name: "Цэнхэр", hex: "#3B82F6" },
    { name: "Хөх", hex: "#1E3A8A" },
    { name: "Нил ягаан", hex: "#8B5CF6" },
    { name: "Бор", hex: "#92400E" },
    { name: "Бэж", hex: "#E7D8B1" },
    { name: "Алт", hex: "#D4AF37" },
    { name: "Мөнгө", hex: "#C0C0C0" },
];

// Хэмжээ нэмэхэд default харагдах размерууд
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const SHOE_SIZES = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];

interface Props {
    mode: "create" | "edit";
    productId?: string | number;
}

// ─── Shared style constants ───────────────────────────────────────────────────

const inputCls = "w-full bg-slate-100 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600";
const labelCls = "block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2";
const addBtnCls = "flex items-center gap-2 text-xs font-bold text-teal-500 hover:text-teal-400 px-3 py-1.5 rounded-xl border border-teal-500/30 hover:border-teal-400/50 transition-all";
const removeBtnCls = "p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ number, title }: { number: number; title: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-teal-500/15 text-teal-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {number}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
    );
}



// ─── Main component ───────────────────────────────────────────────────────────

export default function ProductForm({ mode, productId }: Props) {
    const { setActivePage, setEditingProductId } = useAdmin();
    const { categories, fetchCategories } = useCategory();

    const isEdit = mode === "edit";

    const [loadingData, setLoadingData] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "", categoryId: "", price: "", stock: "",
        description: "", slug: "", sku: "", barcode: "", discountPrice: "",
        isPublished: true, featured: false, hasVariants: false,
    });

    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

    // Зураг ↔ хувилбарын утга холбоос. Түлхүүр: зургийн key (`ex:<id>` | `nw:<preview>`),
    // утга: сонгосон утгуудын `${type}:::${value}` массив.
    const [imageLinks, setImageLinks] = useState<Record<string, string[]>>({});
    const toggleImageLink = (imgKey: string, valKey: string) =>
        setImageLinks(prev => {
            const cur = prev[imgKey] ?? [];
            const next = cur.includes(valKey) ? cur.filter(x => x !== valKey) : [...cur, valKey];
            return { ...prev, [imgKey]: next };
        });

    // Админ гараар үүсгэх хувилбарууд (хослол бүрийг өөрөө сонгоно)
    const [variants, setVariants] = useState<VariantRow[]>([]);

    const addVariant = () => {
        const def: Partial<Record<AttrType, string>> = {};
        attributes.forEach(a => {
            const fv = a.values.find(v => v.value.trim());
            if (fv) def[a.type] = fv.value;
        });
        setVariants(p => [...p, { values: def, stock: "", price: formData.price || "", discountPrice: "", sku: "" }]);
    };
    const updateVariant = (i: number, field: "stock" | "price" | "discountPrice" | "sku", val: string) =>
        setVariants(p => p.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
    const setVariantValue = (i: number, type: AttrType, value: string) =>
        setVariants(p => p.map((v, idx) => idx === i ? { ...v, values: { ...v.values, [type]: value } } : v));
    const removeVariant = (i: number) => setVariants(p => p.filter((_, idx) => idx !== i));

    const { images, imagePreviews, cropQueue, getImage, onCropDone, onCropCancel, removeImage } = useImageCrop();

    // ── Load existing product data (edit mode) ───────────────────────────────
    useEffect(() => {
        fetchCategories();
        if (!isEdit || !productId) return;

        (async () => {
            try {
                setLoadingData(true);
                const res = await fetch(`/api/admin/product/${productId}`);
                const data = await res.json();
                const p = data.product;

                setFormData({
                    name: p.name ?? "",
                    categoryId: String(p.categoryId ?? ""),
                    price: String(p.price ?? ""),
                    stock: String(p.stock ?? ""),
                    description: p.description ?? "",
                    slug: p.slug ?? "",
                    sku: p.sku ?? "",
                    barcode: p.barcode ?? "",
                    discountPrice: String(p.discountPrice ?? ""),
                    isPublished: p.isPublished ?? true,
                    featured: p.featured ?? false,
                    hasVariants: p.hasVariants ?? false,
                });
                setFeatures(p.features ?? []);
                setExistingImages(p.images ?? []);

                // Attribute-уудыг буулгах
                const loadedAttrs: LoadedAttr[] = p.attributes ?? [];
                const attrs: Attribute[] = loadedAttrs.map((a) => ({
                    type: a.type,
                    values: (a.values ?? []).map((v) => ({
                        value: v.value, hex: v.hex ?? undefined, imageUrl: v.imageUrl ?? null,
                    })),
                }));
                setAttributes(attrs);

                // Variant-уудыг гараар үүсгэх мөр болгож буулгах (attributeValueId → {type,value})
                const valInfo = new Map<number, { type: AttrType; value: string }>();
                loadedAttrs.forEach((a) =>
                    (a.values ?? []).forEach((v) => valInfo.set(v.id, { type: a.type, value: v.value })));
                const loadedVariants: LoadedVariant[] = p.variants ?? [];
                const variantRows: VariantRow[] = loadedVariants.map((variant) => {
                    const values: Partial<Record<AttrType, string>> = {};
                    (variant.values ?? []).forEach((vv) => {
                        const info = valInfo.get(vv.attributeValueId);
                        if (info) values[info.type] = info.value;
                    });
                    return {
                        values,
                        stock: String(variant.stock ?? ""),
                        price: variant.price != null ? String(variant.price) : "",
                        discountPrice: variant.discountPrice != null ? String(variant.discountPrice) : "",
                        sku: variant.sku ?? "",
                    };
                });
                setVariants(variantRows);

                // Зургийн холбоосыг буулгах: existing зураг бүрийн links → `${type}:::${value}` түлхүүрүүд
                const linkInit: Record<string, string[]> = {};
                (p.images ?? []).forEach((img: { id: number; links?: { attributeValueId: number }[] }) => {
                    const keys = (img.links ?? [])
                        .map(l => valInfo.get(l.attributeValueId))
                        .filter((x): x is { type: AttrType; value: string } => !!x)
                        .map(info => `${info.type}:::${info.value}`);
                    if (keys.length) linkInit[`ex:${img.id}`] = keys;
                });
                setImageLinks(linkInit);
            } catch {
                toast.error("Барааны мэдээлэл татахад алдаа гарлаа");
            } finally {
                setLoadingData(false);
            }
        })();
    }, [productId]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Сөрөг утга оруулахаас сэргийлэх (үлдэгдэл, нөөц)
    const nonNeg = (v: string) => (v !== "" && Number(v) < 0 ? "0" : v);
    // Хулганы дугуйгаар тоон утга гүйхээс сэргийлэх
    const blockWheel = (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur();
    // Зөвхөн бутархай тоо зөвшөөрөх (сөрөг ба үсэг хориглоно). Буруу бол null буцаана.
    const decimalOnly = (v: string) => (/^\d*\.?\d*$/.test(v) ? v : null);

    // Attribute (хувилбарын төрөл) удирдлага
    const usedTypes = attributes.map(a => a.type);
    const availableTypes = ATTR_TYPES.filter(t => !usedTypes.includes(t.type));

    const addAttribute = (type: AttrType) =>
        setAttributes(p => [...p, { type, values: [] }]);
    const removeAttribute = (ai: number) =>
        setAttributes(p => p.filter((_, i) => i !== ai));
    const addValue = (ai: number) =>
        setAttributes(p => p.map((a, i) => i === ai
            ? { ...a, values: [...a.values, a.type === "COLOR" ? { value: "", hex: "#000000" } : { value: "" }] }
            : a));
    const updateValue = (ai: number, vi: number, field: keyof AttrValue, val: string) =>
        setAttributes(p => p.map((a, i) => i === ai
            ? { ...a, values: a.values.map((v, j) => j === vi ? { ...v, [field]: val } : v) }
            : a));
    // Суурь өнгийг хурдан нэмэх (давхардуулахгүй)
    const addColorPreset = (ai: number, name: string, hex: string) =>
        setAttributes(p => p.map((a, i) => {
            if (i !== ai) return a;
            if (a.values.some(v => (v.hex ?? "").toLowerCase() === hex.toLowerCase())) return a;
            return { ...a, values: [...a.values, { value: name, hex }] };
        }));
    // Размерын бүлгийг toggle хийх: бүгд нэмэгдсэн бол бүгдийг хасна, эс бөгөөс бүгдийг нэмнэ
    const toggleSizeGroup = (ai: number, values: string[]) =>
        setAttributes(p => p.map((a, i) => {
            if (i !== ai) return a;
            const allAdded = values.every(s => a.values.some(v => v.value.trim() === s));
            if (allAdded) {
                return { ...a, values: a.values.filter(v => !values.includes(v.value.trim())) };
            }
            const existing = new Set(a.values.map(v => v.value.trim()));
            const toAdd = values.filter(v => !existing.has(v)).map(value => ({ value }));
            return { ...a, values: [...a.values, ...toAdd] };
        }));
    const removeValue = (ai: number, vi: number) =>
        setAttributes(p => p.map((a, i) => i === ai
            ? { ...a, values: a.values.filter((_, j) => j !== vi) }
            : a));

    // Зурагт холбож болох бүх утга (текст бичигдсэн утгууд) — зураг бүрийн доор сонголт болгож харуулна.
    // Утгыг түүхийгээр нь (trim хийхгүй) ашиглана — attributes/variants/load бүгд адил утга хэрэглэдэг тул түлхүүр таарна.
    const linkableValues = attributes.flatMap(a =>
        a.values
            .filter(v => v.value.trim())
            .map(v => ({ type: a.type, value: v.value, hex: a.type === "COLOR" ? v.hex : undefined }))
    );

    // Зургийн холболтоос хувилбаруудыг автоматаар үүсгэнэ (холбосон утгуудын cartesian).
    // Жишээ: нэг зургийг 3 хэмжээтэй холбоход 3 хувилбар үүснэ.
    // Гараар нэмсэн хувилбарууд (auto биш) хэвээр үлдэнэ, авто-мөрийн засвар хадгалагдана.
    useEffect(() => {
        if (!formData.hasVariants) return;
        const linkedByType = new Map<AttrType, string[]>();
        for (const keys of Object.values(imageLinks)) {
            for (const k of keys) {
                const [type, value] = k.split(":::") as [AttrType, string];
                if (!value) continue;
                const attr = attributes.find(a => a.type === type);
                if (!attr || !attr.values.some(v => v.value.trim() === value)) continue;
                const arr = linkedByType.get(type) ?? [];
                if (!arr.includes(value)) { arr.push(value); linkedByType.set(type, arr); }
            }
        }
        const types = [...linkedByType.keys()];
        let combos: Partial<Record<AttrType, string>>[] = [{}];
        for (const t of types) {
            const vals = linkedByType.get(t)!;
            combos = combos.flatMap(c => vals.map(v => ({ ...c, [t]: v })));
        }
        const autoCombos = types.length ? combos : [];

        setVariants(prev => {
            const manual = prev.filter(v => !v.auto);
            const manualSigs = new Set(manual.map(v => variantSig(v.values)));
            const prevAuto = new Map(prev.filter(v => v.auto).map(v => [variantSig(v.values), v]));
            const autoRows: VariantRow[] = autoCombos
                .filter(c => !manualSigs.has(variantSig(c)))
                .map(c => {
                    const existing = prevAuto.get(variantSig(c));
                    return existing
                        ? { ...existing, values: c }
                        : { values: c, stock: "", price: formData.price || "", discountPrice: "", sku: "", auto: true };
                });
            const next = [...autoRows, ...manual];
            // Агуулга өөрчлөгдөөгүй бол хуучин reference-ийг буцааж илүүц re-render-ээс сэргийлнэ
            if (next.length === prev.length &&
                next.every((v, i) => prev[i] && variantSig(v.values) === variantSig(prev[i].values) && !!v.auto === !!prev[i].auto)) {
                return prev;
            }
            return next;
        });
    }, [imageLinks, attributes, formData.hasVariants, formData.price]);

    const addFeature = () => setFeatures(p => [...p, { title: "", description: "" }]);
    const updateFeature = (i: number, field: keyof Feature, val: string) =>
        setFeatures(p => p.map((f, idx) => idx === i ? { ...f, [field]: val } : f));
    const removeFeature = (i: number) => setFeatures(p => p.filter((_, idx) => idx !== i));

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tid = toast.loading(isEdit ? "Хадгалж байна..." : "Нийтэлж байна...");
        // Хувилбартай гэж тэмдэглэсэн бол дор хаяж нэг хувилбарын утга шаардана
        if (formData.hasVariants) {
            const hasAny = attributes.some(a => a.values.some(v => v.value.trim()));
            if (!hasAny) {
                toast.error("Хувилбартай бараанд дор хаяж нэг хувилбар (өнгө/хэмжээ/...) нэмнэ үү", { id: tid });
                return;
            }
        }
        setSaving(true);
        try {
            const useVariants = formData.hasVariants;
            // Зөвхөн утгатай мөрүүдийг, attribute-уудыг шүүнэ (файлын индекс зэрэгцүүлэхэд чухал)
            const attrPayload = useVariants
                ? attributes
                    .map(a => ({ type: a.type, values: a.values.filter(v => v.value.trim()) }))
                    .filter(a => a.values.length > 0)
                : [];

            const fd = new FormData();
            Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v)));

            // attributes JSON
            fd.append("attributes", JSON.stringify(attrPayload.map(a => ({
                type: a.type,
                values: a.values.map(v => ({
                    value: v.value,
                    hex: a.type === "COLOR" ? (v.hex ?? null) : null,
                    imageUrl: v.imageUrl ?? null,
                })),
            }))));

            // variants — админ гараар үүсгэсэн хослолууд (зөвхөн утга сонгосон төрлүүд)
            if (useVariants) {
                const variantsPayload = variants
                    .map(v => ({
                        values: attributes
                            .filter(a => v.values[a.type]?.trim())
                            .map(a => ({ type: a.type, value: v.values[a.type]! })),
                        stock: Number(v.stock || 0),
                        price: v.price ? Number(v.price) : null,
                        discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
                        sku: v.sku || null,
                    }))
                    .filter(v => v.values.length > 0);
                fd.append("variants", JSON.stringify(variantsPayload));
            } else if (isEdit) {
                // Хувилбаргүй болгосон бол хуучин attribute/variant-ийг арилгана
                fd.append("attributes", JSON.stringify([]));
            }

            fd.append("features", JSON.stringify(features));

            images.forEach(img => fd.append("images", img));
            if (isEdit) fd.append("existingImages", JSON.stringify(existingImages));

            // Зураг ↔ хувилбар холбоос (зөвхөн хувилбартай үед)
            if (useVariants) {
                const linkableKeys = new Set(linkableValues.map(lv => `${lv.type}:::${lv.value}`));
                const parseKey = (k: string) => {
                    const [type, value] = k.split(":::");
                    return { type: type as AttrType, value };
                };
                const linksPayload: { ref: { kind: "existing"; id: number } | { kind: "new"; index: number }; values: { type: AttrType; value: string }[] }[] = [];
                existingImages.forEach(img => {
                    const sel = (imageLinks[`ex:${img.id}`] ?? []).filter(k => linkableKeys.has(k));
                    if (sel.length) linksPayload.push({ ref: { kind: "existing", id: img.id }, values: sel.map(parseKey) });
                });
                imagePreviews.forEach((preview, idx) => {
                    const sel = (imageLinks[`nw:${preview}`] ?? []).filter(k => linkableKeys.has(k));
                    if (sel.length) linksPayload.push({ ref: { kind: "new", index: idx }, values: sel.map(parseKey) });
                });
                fd.append("imageLinks", JSON.stringify(linksPayload));
            }

            const url = isEdit ? `/api/admin/product/${productId}` : "/api/admin/product";
            const method = isEdit ? "PATCH" : "POST";
            const res = await fetch(url, { method, body: fd });
            const data = await res.json();

            if (!res.ok) { toast.error(data.message ?? "Алдаа гарлаа", { id: tid }); return; }

            toast.success(isEdit ? "Амжилттай шинэчлэгдлээ" : "Амжилттай нийтлэгдлээ", { id: tid });
            setEditingProductId(null);
            setActivePage("Бүтээгдэхүүнүүд");
        } catch {
            toast.error("Алдаа гарлаа", { id: tid });
        } finally {
            setSaving(false);
        }
    };

    const goBack = () => { setEditingProductId(null); setActivePage("Бүтээгдэхүүнүүд"); };

    if (loadingData) return (
        <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500" />
        </div>
    );

    return (
        <div className="max-w-screen mx-auto pb-20">

            {/* Header */}
            <header className="flex justify-between items-center mb-8 pt-2">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {isEdit ? "Бүтээгдэхүүн засах" : "Бүтээгдэхүүн нэмэх"}
                    </h2>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">
                        {isEdit ? "Бүтээгдэхүүний мэдээллийг шинэчлэх." : "Шинэ бүтээгдэхүүн нэг бүрчлэн эсвэл файлаар нэмэх."}
                    </p>
                </div>
                <button type="button" onClick={goBack}
                    className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white px-5 py-2.5 rounded-2xl font-semibold transition-colors text-sm">
                    ← Буцах
                </button>
            </header>

            {/* Bulk upload (create only) */}
            {!isEdit && (
                <>
                    <div className="mb-8 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                        <button type="button" onClick={() => setBulkOpen(!bulkOpen)}
                            className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">📊</span>
                                <div>
                                    <p className="text-slate-900 dark:text-white font-semibold text-sm">Excel-ээр олноор нэмэх</p>
                                    <p className="text-slate-400 dark:text-zinc-500 text-xs">Файл оруулж олон бүтээгдэхүүн нэгэн зэрэг нэмэх</p>
                                </div>
                            </div>
                            <svg className={`w-5 h-5 text-slate-500 dark:text-zinc-400 transition-transform duration-200 ${bulkOpen ? "rotate-180" : ""}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {bulkOpen && (
                            <div className="p-6 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                                <ProductBulk />
                            </div>
                        )}
                    </div>
                    <DividerLine label="Гараар бөглөх" />
                </>
            )}

            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">

                    {/* Section 1 — Үндсэн мэдээлэл */}
                    <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
                        <SectionTitle number={1} title="Үндсэн мэдээлэл" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                            <div>
                                <label className={labelCls}>Бүтээгдэхүүний нэр *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInput} required
                                    placeholder="Жишээ: iPhone 15 Pro" className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Ангилал *</label>
                                <DropdownSelect
                                    value={formData.categoryId}
                                    onChange={id => setFormData(prev => ({ ...prev, categoryId: String(id) }))}
                                    options={categories.map(c => ({ label: c.name, id: String(c.id) }))}
                                    placeholder="Сонгох"
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Төлөв</label>
                                <DropdownSelect
                                    value={String(formData.isPublished)}
                                    onChange={id => setFormData(prev => ({ ...prev, isPublished: id === "true" }))}
                                    options={[{ id: "true", label: "Идэвхтэй" }, { id: "false", label: "Идэвхгүй" }]}
                                    searchable={false}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>SKU</label>
                                <input type="text" name="sku" value={formData.sku} onChange={handleInput} placeholder="SKU-001" className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Баркод</label>
                                <input type="text" name="barcode" value={formData.barcode} onChange={handleInput} placeholder="6900000000000" className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Slug</label>
                                <input type="text" name="slug" value={formData.slug} onChange={handleInput} placeholder="iphone-15-pro" className={inputCls} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Онцлох бүтээгдэхүүн</label>
                                <div
                                    onClick={() => setFormData(p => ({ ...p, featured: !p.featured }))}
                                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-xl border cursor-pointer transition-all ${formData.featured ? "border-teal-500 bg-teal-500/5" : "border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/50"}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">⭐</span>
                                        <span className="text-xs text-slate-600 dark:text-slate-300">Нүүр хуудсанд харуулна</span>
                                    </div>
                                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${formData.featured ? "bg-teal-500" : "bg-slate-200 dark:bg-zinc-700"}`}>
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${formData.featured ? "translate-x-5" : "translate-x-0"}`} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Section 2 — Үнэ & Нөөц */}
                    <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
                        <SectionTitle number={2} title="Үнэ & Нөөц" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                            <div>
                                <label className={labelCls}>Үнэ (₮) *</label>
                                <input type="text" inputMode="decimal" name="price" value={formData.price} onChange={e => { const nv = decimalOnly(e.target.value); if (nv !== null) setFormData(prev => ({ ...prev, price: nv })); }} required placeholder="0" className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Хөнгөлөлтийн үнэ (₮)</label>
                                <input type="text" inputMode="decimal" name="discountPrice" value={formData.discountPrice} onChange={e => { const nv = decimalOnly(e.target.value); if (nv !== null) setFormData(prev => ({ ...prev, discountPrice: nv })); }} placeholder="0" className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Үлдэгдэл *</label>
                                <input type="number" name="stock" min="0" value={formData.stock} onChange={e => setFormData(prev => ({ ...prev, stock: nonNeg(e.target.value) }))} onWheel={blockWheel} required placeholder="0" className={inputCls} />
                            </div>
                        </div>
                    </div>s

                    {/* Section 3 — Медиа & Тайлбар */}
                    <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
                        <SectionTitle number={3} title="Медиа & Тайлбар" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="flex flex-col">
                                <label className={labelCls}>Зургууд</label>
                                <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl bg-slate-50 dark:bg-zinc-800/20 hover:border-teal-500/40 transition-all overflow-hidden flex-1 min-h-[260px]">
                                    {(existingImages.length > 0 || imagePreviews.length > 0) ? (
                                        <div className="p-4 grid grid-cols-3 gap-3">
                                            {existingImages.map((img, idx) => (
                                                <div key={`ex-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-300 dark:border-zinc-700 group">
                                                    <img src={imgUrl(img.url)} className="w-full h-full object-cover opacity-70" />
                                                    <button type="button"
                                                        onClick={() => setExistingImages(p => p.filter((_, i) => i !== idx))}
                                                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold">
                                                        Устгах
                                                    </button>
                                                </div>
                                            ))}
                                            {imagePreviews.map((src, idx) => (
                                                <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-teal-500/50 group">
                                                    <img src={src} className="w-full h-full object-cover" />
                                                    {isEdit && <div className="absolute top-1 left-1 bg-teal-500 text-[8px] px-1 rounded text-white uppercase font-bold">New</div>}
                                                    <button type="button" onClick={() => removeImage(idx)}
                                                        className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="aspect-square border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors gap-1">
                                                <span className="text-xl text-slate-400 dark:text-zinc-500">+</span>
                                                <span className="text-[10px] text-slate-400 dark:text-zinc-600">Нэмэх</span>
                                                <input type="file" multiple hidden onChange={getImage} />
                                            </label>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center py-14 cursor-pointer gap-3">
                                            <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl">📸</div>
                                            <div className="text-center">
                                                <p className="text-slate-600 dark:text-zinc-300 font-semibold text-sm">Зураг оруулах</p>
                                                <p className="text-slate-400 dark:text-zinc-600 text-xs mt-0.5">Олон зураг сонгох боломжтой</p>
                                            </div>
                                            <input type="file" accept="image/*" multiple onChange={getImage} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label className={labelCls}>Дэлгэрэнгүй тайлбар</label>
                                <textarea name="description" value={formData.description} onChange={handleInput}
                                    className={`${inputCls} resize-none flex-1 min-h-[260px]`}
                                    placeholder="Барааны талаарх дэлгэрэнгүй мэдээлэл..." />
                            </div>
                        </div>
                    </div>

                    {/* Хувилбартай эсэх (toggle) */}
                    <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
                        <div
                            onClick={() => setFormData(p => ({ ...p, hasVariants: !p.hasVariants }))}
                            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${formData.hasVariants ? "border-teal-500 bg-teal-500/5" : "border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40"}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🎚️</span>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Хувилбартай бараа</p>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500">Өнгө/хэмжээ/материал/загвар бүхий бараа — нөөц, үнийг хослолоор оруулна</p>
                                </div>
                            </div>
                            <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${formData.hasVariants ? "bg-teal-500" : "bg-slate-200 dark:bg-zinc-700"}`}>
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${formData.hasVariants ? "translate-x-5" : "translate-x-0"}`} />
                            </div>
                        </div>
                    </div>

                    {formData.hasVariants && (
                        <>
                            {/* Section 4 — Хувилбарууд */}
                            <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
                                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                                    <SectionTitle number={4} title="Хувилбарууд" />
                                    <div className="flex flex-wrap gap-2">
                                        {availableTypes.map(t => (
                                            <button key={t.type} type="button" onClick={() => addAttribute(t.type)} className={addBtnCls}>
                                                <span>{t.icon}</span> {t.label} нэмэх
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {attributes.length === 0 ? (
                                    <p className="text-slate-400 dark:text-zinc-600 text-sm text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                                        Дээрх товчоор хувилбарын төрөл (Өнгө/Хэмжээ/Материал/Загвар) нэмнэ үү
                                    </p>
                                ) : (
                                    <div className="space-y-5">
                                        {attributes.map((attr, ai) => {
                                            const isColor = attr.type === "COLOR";
                                            const isSize = attr.type === "SIZE";
                                            return (
                                                <div key={ai} className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{ATTR_LABEL[attr.type]}</p>
                                                        <div className="flex items-center gap-2">
                                                            <button type="button" onClick={() => addValue(ai)} className={addBtnCls}>
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                                                Утга нэмэх
                                                            </button>
                                                            <button type="button" onClick={() => removeAttribute(ai)} className={removeBtnCls}>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {isColor ? (
                                                        <div className="space-y-3">
                                                            {/* Суурь өнгөнүүд + нэмэлт сонголт */}
                                                            <div className="flex flex-wrap gap-2">
                                                                {BASE_COLORS.map(c => {
                                                                    const added = attr.values.some(v => (v.hex ?? "").toLowerCase() === c.hex.toLowerCase());
                                                                    return (
                                                                        <button type="button" key={c.hex} onClick={() => addColorPreset(ai, c.name, c.hex)} disabled={added}
                                                                            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${added ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-300 opacity-60 cursor-not-allowed" : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-teal-400"}`}>
                                                                            <span className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0" style={{ backgroundColor: c.hex }} />
                                                                            {c.name}
                                                                        </button>
                                                                    );
                                                                })}
                                                                <button type="button" onClick={() => addValue(ai)}
                                                                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-zinc-600 text-slate-500 dark:text-zinc-400 hover:border-teal-400 hover:text-teal-500 transition-all">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                                                    Нэмэлт сонголт
                                                                </button>
                                                            </div>
                                                            {/* Сонгосон өнгөнүүд (нэр/өнгө засах) */}
                                                            {attr.values.length === 0 ? (
                                                                <p className="text-slate-400 dark:text-zinc-600 text-xs text-center py-3">Дээрээс өнгө сонгоно уу</p>
                                                            ) : attr.values.map((v, vi) => (
                                                                <div key={vi} className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-2xl">
                                                                    <input type="color" value={v.hex ?? "#000000"} onChange={e => updateValue(ai, vi, "hex", e.target.value)}
                                                                        className="w-11 h-11 rounded-xl cursor-pointer border-2 border-slate-200 dark:border-zinc-700 p-0.5 bg-transparent flex-shrink-0" />
                                                                    <input type="text" value={v.value} onChange={e => updateValue(ai, vi, "value", e.target.value)}
                                                                        placeholder="Жишээ: Хар" className={inputCls + " py-2.5 text-sm flex-1"} />
                                                                    <button type="button" onClick={() => removeValue(ai, vi)} className={removeBtnCls}>
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : isSize ? (
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Размерын бүлэг сонгох</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {[
                                                                        { label: "Хувцасны хэмжээ", sizes: CLOTHING_SIZES },
                                                                        { label: "Гутлын размер", sizes: SHOE_SIZES },
                                                                    ].map(g => {
                                                                        const allAdded = g.sizes.every(s => attr.values.some(v => v.value.trim() === s));
                                                                        return (
                                                                            <button type="button" key={g.label} onClick={() => toggleSizeGroup(ai, g.sizes)}
                                                                                title={allAdded ? "Бүлгийг хасах" : "Бүлгийг нэмэх"}
                                                                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${allAdded ? "border-teal-500 bg-teal-500 text-white" : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-teal-400"}`}>
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={allAdded ? "M5 12h14" : "M12 4v16m8-8H4"} />
                                                                                </svg>
                                                                                {g.label}
                                                                                <span className="text-[10px] font-medium opacity-70">({g.sizes.length})</span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                    <button type="button" onClick={() => addValue(ai)}
                                                                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-zinc-600 text-slate-500 dark:text-zinc-400 hover:border-teal-400 hover:text-teal-500 transition-all">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                                                        Нэмэлт
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {attr.values.length === 0 ? (
                                                                <p className="text-slate-400 dark:text-zinc-600 text-xs text-center py-3">Дээрээс размер сонгоно уу</p>
                                                            ) : (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {attr.values.map((v, vi) => (
                                                                        <div key={vi} className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-xl pl-3 pr-1.5 py-1.5">
                                                                            <input type="text" value={v.value} onChange={e => updateValue(ai, vi, "value", e.target.value)}
                                                                                placeholder="XL"
                                                                                className="w-20 bg-transparent text-sm font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-600" />
                                                                            <button type="button" onClick={() => removeValue(ai, vi)}
                                                                                className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0">
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : attr.values.length === 0 ? (
                                                        <p className="text-slate-400 dark:text-zinc-600 text-xs text-center py-4">Утга нэмэгдээгүй байна</p>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {attr.values.map((v, vi) => (
                                                                <div key={vi} className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-xl pl-3 pr-1.5 py-1.5">
                                                                    <input type="text" value={v.value} onChange={e => updateValue(ai, vi, "value", e.target.value)}
                                                                        placeholder={attr.type === "SIZE" ? "XL" : "Утга"}
                                                                        className="w-24 bg-transparent text-sm font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-600" />
                                                                    <button type="button" onClick={() => removeValue(ai, vi)}
                                                                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Section 5 — Зураг ↔ хувилбар холболт */}
                            {linkableValues.length > 0 && (existingImages.length > 0 || imagePreviews.length > 0) && (
                                <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
                                    <SectionTitle number={5} title="Зургийн холболт" />
                                    <p className="text-slate-400 dark:text-zinc-500 text-xs mt-2 ml-10">
                                        Зураг бүрийн доороос холбогдох өнгө/загвар/материалыг сонгоно. Холбосон утгуудаас доорх хувилбарууд автоматаар үүснэ. Хэрэглэгч тухайн хувилбарыг сонгоход зөвхөн холбосон зургууд эхэлж харагдана. Холбоогүй зураг бүх хувилбарт хамаарна.
                                    </p>
                                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {[
                                            ...existingImages.map(img => ({ key: `ex:${img.id}`, src: imgUrl(img.url), isNew: false })),
                                            ...imagePreviews.map(src => ({ key: `nw:${src}`, src, isNew: true })),
                                        ].map(card => {
                                            const sel = imageLinks[card.key] ?? [];
                                            return (
                                                <div key={card.key} className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-800/30">
                                                    <div className="aspect-square relative">
                                                        <img src={card.src} className="w-full h-full object-cover" />
                                                        {card.isNew && <div className="absolute top-1 left-1 bg-teal-500 text-[8px] px-1 rounded text-white uppercase font-bold">New</div>}
                                                    </div>
                                                    <div className="p-2.5 flex flex-wrap gap-1.5">
                                                        {linkableValues.map(lv => {
                                                            const k = `${lv.type}:::${lv.value}`;
                                                            const active = sel.includes(k);
                                                            return (
                                                                <button key={k} type="button" onClick={() => toggleImageLink(card.key, k)}
                                                                    className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all ${active ? "border-teal-500 bg-teal-500/15 text-teal-600 dark:text-teal-300" : "border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:border-teal-400/50"}`}>
                                                                    {lv.hex && <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: lv.hex }} />}
                                                                    {lv.value}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Section 6 — Хувилбарууд (нөөц & үнэ) */}
                            <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <SectionTitle number={6} title="Хувилбарууд (нөөц & үнэ)" />
                                    <button type="button" onClick={addVariant}
                                        disabled={!attributes.some(a => a.values.some(v => v.value.trim()))}
                                        className={addBtnCls + " disabled:opacity-40 disabled:cursor-not-allowed"}>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                        Хувилбар нэмэх
                                    </button>
                                </div>
                                <p className="text-slate-400 dark:text-zinc-500 text-xs mt-2 ml-10">
                                    Зургийн холболтоос автоматаар үүснэ. Шаардвал гараар нэмж/засаж болно. Үнэ хоосон бол дээрх нийт үнэ хэрэглэгдэнэ.
                                </p>
                                <div className="mt-6">
                                    {variants.length === 0 ? (
                                        <p className="text-slate-400 dark:text-zinc-600 text-sm text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                                            &ldquo;Хувилбар нэмэх&rdquo; товчоор худалдах хослолоо үүсгэнэ үү.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {variants.map((v, i) => {
                                                const usedAttrs = attributes.filter(a => a.values.some(val => val.value.trim()));
                                                return (
                                                    <div key={i} className="flex flex-wrap items-end gap-3 bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-2xl">
                                                        {usedAttrs.map(a => (
                                                            <div key={a.type} className="min-w-[110px] flex-1">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{ATTR_LABEL[a.type]}</label>
                                                                <select value={v.values[a.type] ?? ""} onChange={e => setVariantValue(i, a.type, e.target.value)} className={inputCls}>
                                                                    <option value="">—</option>
                                                                    {a.values.filter(val => val.value.trim()).map((val, vi) => (
                                                                        <option key={vi} value={val.value}>{val.value}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        ))}
                                                        <div className="w-20">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Нөөц *</label>
                                                            <input type="number" min="0" value={v.stock} onChange={e => updateVariant(i, "stock", nonNeg(e.target.value))} onWheel={blockWheel} placeholder="0" className={inputCls} />
                                                        </div>
                                                        <div className="w-24">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Үнэ</label>
                                                            <input type="text" inputMode="decimal" value={v.price} onChange={e => { const nv = decimalOnly(e.target.value); if (nv !== null) updateVariant(i, "price", nv); }} placeholder={formData.price || "0"} className={inputCls} />
                                                        </div>
                                                        <div className="w-24">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Хямдрал</label>
                                                            <input type="text" inputMode="decimal" value={v.discountPrice} onChange={e => { const nv = decimalOnly(e.target.value); if (nv !== null) updateVariant(i, "discountPrice", nv); }} placeholder="—" className={inputCls} />
                                                        </div>
                                                        <div className="w-28">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">SKU</label>
                                                            <input type="text" value={v.sku} onChange={e => updateVariant(i, "sku", e.target.value)} placeholder="SKU" className={inputCls + " font-mono"} />
                                                        </div>
                                                        <button type="button" onClick={() => removeVariant(i)} className={removeBtnCls + " mb-1"}>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Section 7 — Онцлог */}
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <SectionTitle number={7} title="Онцлог шинж чанарууд" />
                            <button type="button" onClick={addFeature} className={addBtnCls}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                Онцлог нэмэх
                            </button>
                        </div>
                        {features.length === 0 ? (
                            <p className="text-slate-400 dark:text-zinc-600 text-sm text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">Онцлог нэмэгдээгүй байна</p>
                        ) : (
                            <div className="space-y-3">
                                {features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-2xl">
                                        <input type="text" value={f.description} onChange={e => updateFeature(i, "description", e.target.value)}
                                            placeholder="Жишээ: 6.7 инч OLED дэлгэц" className={inputCls + " flex-1"} />
                                        <button type="button" onClick={() => removeFeature(i)} className={removeBtnCls}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center px-8 py-5 bg-slate-100 dark:bg-zinc-950/50 border-t border-slate-200 dark:border-zinc-800">
                        <p className="text-slate-400 dark:text-zinc-600 text-xs">* тэмдэглэгдсэн талбарууд заавал бөглөх шаардлагатай</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={goBack}
                                className="px-6 py-2.5 rounded-2xl text-slate-500 dark:text-zinc-400 font-semibold hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors text-sm">
                                Цуцлах
                            </button>
                            <button type="submit" disabled={saving}
                                className="px-8 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 transition-all active:scale-95 text-sm">
                                {saving ? "Хадгалж байна..." : isEdit ? "Өөрчлөлтийг хадгалах" : "Нийтлэх"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {cropQueue.length > 0 && (
                <ImageCropper imageSrc={cropQueue[0].src} fileName={cropQueue[0].name} onDone={onCropDone} onCancel={onCropCancel} />
            )}
        </div>
    );
}
