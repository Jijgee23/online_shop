"use client";

import { useState, useEffect, useRef } from "react";
import { Category } from "@/interface/category";
import { useCategory } from "@/app/context/category_context";
import { generateSlug } from "@/utils/utils";
import toast from "react-hot-toast";
import CategoryTree from "@/app/components/CategoryTree";
import Image from "next/image";
import CropModal from "./components/CropModal";

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminCategoryPage() {
    const { categories, fetchCategories, loading } = useCategory();
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", parentId: null as number | null });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [cropSrc, setCropSrc] = useState<string | null>(null);   // raw src for crop modal
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchCategories(); }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "name") {
            setFormData(prev => ({ ...prev, name: value, slug: generateSlug(value) }));
        } else if (name === "parentId") {
            setFormData(prev => ({ ...prev, parentId: value ? Number(value) : null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCropSrc(URL.createObjectURL(file));   // open crop modal
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCropConfirm = (croppedFile: File) => {
        if (cropSrc) URL.revokeObjectURL(cropSrc);
        setCropSrc(null);
        setImageFile(croppedFile);
        setImagePreview(URL.createObjectURL(croppedFile));
        setRemoveImage(false);
    };

    const handleCropCancel = () => {
        if (cropSrc) URL.revokeObjectURL(cropSrc);
        setCropSrc(null);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(true);
    };

    const resetForm = () => {
        setFormData({ name: "", slug: "", parentId: null });
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(false);
        setCropSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShowForm(false);
        setEditingCategory(null);
    };

    const buildFormData = (extra: Record<string, string | number | null>) => {
        const fd = new FormData();
        Object.entries(extra).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, String(v)); });
        fd.append("name", formData.name);
        fd.append("slug", formData.slug);
        if (formData.parentId !== null) fd.append("parentId", String(formData.parentId));
        if (imageFile) fd.append("image", imageFile);
        if (removeImage) fd.append("removeImage", "true");
        return fd;
    };

    const handleAdd = async () => {
        if (!formData.name.trim()) return;
        const t = toast.loading("Нэмж байна...");
        try {
            const res = await fetch("/api/admin/category", { method: "POST", body: buildFormData({}) });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message ?? "Алдаа гарлаа", { id: t }); return; }
            toast.success("Амжилттай нэмэгдлээ", { id: t });
            fetchCategories();
            resetForm();
        } catch { toast.error("Алдаа гарлаа", { id: t }); }
    };

    const handleUpdate = async () => {
        if (!editingCategory || !formData.name.trim()) return;
        const t = toast.loading("Хадгалж байна...");
        try {
            const res = await fetch("/api/admin/category", { method: "PATCH", body: buildFormData({ id: editingCategory.id }) });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message ?? "Алдаа гарлаа", { id: t }); return; }
            toast.success("Амжилттай шинэчлэгдлээ", { id: t });
            fetchCategories();
            resetForm();
        } catch { toast.error("Алдаа гарлаа", { id: t }); }
    };

    const handleToggleFeatured = async (cat: Category) => {
        const t = toast.loading(cat.featured ? "Онцлохоос хасаж байна..." : "Онцлох болгож байна...");
        try {
            const res = await fetch(`/api/admin/category/${cat.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ featured: !cat.featured }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message ?? "Алдаа гарлаа", { id: t }); return; }
            toast.success(cat.featured ? "Онцлохоос хасагдлаа" : "Онцлох болгогдлоо", { id: t });
            fetchCategories();
        } catch { toast.error("Алдаа гарлаа", { id: t }); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Энэ ангиллыг устгахдаа итгэлтэй байна уу?")) return;
        const t = toast.loading("Устгаж байна...");
        try {
            const res = await fetch(`/api/admin/category/${id}`, { method: "DELETE" });
            if (!res.ok) { toast.error("Устгахад алдаа гарлаа", { id: t }); return; }
            toast.success("Устгагдлаа", { id: t });
            fetchCategories();
        } catch { toast.error("Алдаа гарлаа", { id: t }); }
    };

    const openEdit = (cat: Category) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, slug: cat.slug, parentId: cat.parentId });
        setImageFile(null);
        setImagePreview(cat.image ?? null);
        setRemoveImage(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShowForm(true);
    };

    const parentOptions = categories.filter(c => c.parentId === null && c.id !== editingCategory?.id);
    const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const inputCls = "w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60 outline-none transition-all";
    const labelCls = "block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2";
    const displayImage = imagePreview && !removeImage ? imagePreview : null;

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
        </div>
    );

    return (
        <>
            {/* Crop modal */}
            {cropSrc && (
                <CropModal src={cropSrc} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
            )}

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Ангилал удирдах</h2>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">
                        Нийт <span className="text-slate-800 dark:text-white font-semibold">{categories.length}</span> ангилал —{" "}
                        <span className="text-slate-500 dark:text-zinc-400">
                            {categories.filter(c => c.parentId === null).length} үндсэн,{" "}
                            {categories.filter(c => c.parentId !== null).length} дэд
                        </span>
                    </p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-5 py-2.5 rounded-2xl font-bold transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Ангилал нэмэх
                </button>
            </header>

            {/* Add / Edit Form */}
            {showForm && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 mb-8 shadow-sm dark:shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {editingCategory ? "Ангилал засах" : "Шинэ ангилал нэмэх"}
                        </h3>
                        <button onClick={resetForm} className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                        <div>
                            <label className={labelCls}>Нэр *</label>
                            <input type="text" name="name" value={formData.name}
                                onChange={handleInputChange} placeholder="Ангилалын нэр" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Slug (автомат)</label>
                            <input type="text" name="slug" value={formData.slug} readOnly
                                className="w-full bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-400 dark:text-zinc-500 outline-none font-mono text-sm cursor-not-allowed" />
                        </div>
                        <div>
                            <label className={labelCls}>Эцэг ангилал</label>
                            <select name="parentId" value={formData.parentId ?? ""} onChange={handleInputChange} className={inputCls}>
                                <option value="">— Үндсэн ангилал —</option>
                                {parentOptions.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Image upload */}
                    <div>
                        <label className={labelCls}>Зураг (заавал биш)</label>
                        <div className="flex items-start gap-4">
                            {/* 3:4 preview */}
                            <div className={`relative w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2
                                ${displayImage ? "border-teal-500/40" : "border-dashed border-slate-200 dark:border-zinc-700"}`}
                                style={{ aspectRatio: "3/4" }}>
                                {displayImage ? (
                                    <Image src={displayImage} alt="preview" fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-slate-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-sm font-medium transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Зураг сонгох
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                                {displayImage && (
                                    <button type="button" onClick={handleRemoveImage}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-medium transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Зураг устгах
                                    </button>
                                )}
                                <p className="text-xs text-slate-400 dark:text-zinc-600">PNG, JPG, WEBP — дээд тал нь 5MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={resetForm} className="px-5 py-2.5 rounded-xl text-slate-500 dark:text-zinc-400 font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition-colors text-sm">
                            Цуцлах
                        </button>
                        <button onClick={editingCategory ? handleUpdate : handleAdd}
                            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-bold transition-colors text-sm">
                            {editingCategory ? "Хадгалах" : "Нэмэх"}
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Ангилал хайх..." value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/40 transition-all text-sm" />
            </div>

            {/* Category Tree */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm dark:shadow-none">
                <CategoryTree
                    categories={filtered}
                    onEdit={openEdit}
                    onDelete={cat => handleDelete(cat.id)}
                    onToggleFeatured={handleToggleFeatured}
                    onAddChild={cat => {
                        resetForm();
                        setFormData(prev => ({ ...prev, parentId: cat.id }));
                        setShowForm(true);
                    }}
                />
            </div>
        </>
    );
}
