"use client";

import { useAdmin } from "@/app/context/admin_context";
import { useEffect, useState } from "react";
import { useCategory } from "@/app/context/category_context";
import ImageCropper from "@/app/components/ImageCropper";
import { useImageCrop } from "@/utils/useImageCrop";
import toast from "react-hot-toast";
import { ProductBulk } from "../components/Product_bulk";

type Color   = { hex: string; name: string };
type Size    = { sizeName: string; value: string };
type Feature = { title: string; description: string };

export default function NewProductPage() {
  const { categories, fetchCategories } = useCategory();
  const { setActivePage } = useAdmin();
  const [bulkOpen, setBulkOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "", categoryId: "", price: "", stock: "",
    description: "", slug: "", sku: "", discountPrice: "", isPublished: true, featured: false,
  });

  const [colors,   setColors]   = useState<Color[]>([]);
  const [sizes,    setSizes]    = useState<Size[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);

  const { images, imagePreviews, cropQueue, getImage, onCropDone, onCropCancel, removeImage } = useImageCrop();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── Colors ──────────────────────────────────────────────────────────────
  const addColor = () => setColors(p => [...p, { hex: "#000000", name: "" }]);
  const updateColor = (i: number, field: keyof Color, val: string) =>
    setColors(p => p.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  const removeColor = (i: number) => setColors(p => p.filter((_, idx) => idx !== i));

  // ── Sizes ────────────────────────────────────────────────────────────────
  const addSize = () => setSizes(p => [...p, { sizeName: "", value: "" }]);
  const updateSize = (i: number, field: keyof Size, val: string) =>
    setSizes(p => p.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const removeSize = (i: number) => setSizes(p => p.filter((_, idx) => idx !== i));

  // ── Features ─────────────────────────────────────────────────────────────
  const addFeature = () => setFeatures(p => [...p, { title: "", description: "" }]);
  const updateFeature = (i: number, field: keyof Feature, val: string) =>
    setFeatures(p => p.map((f, idx) => idx === i ? { ...f, [field]: val } : f));
  const removeFeature = (i: number) => setFeatures(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading("Нийтэлж байна...");
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => fd.append(key, String(value)));
      images.forEach((image) => fd.append("images", image));
      fd.append("colors",   JSON.stringify(colors));
      fd.append("sizes",    JSON.stringify(sizes));
      fd.append("features", JSON.stringify(features));

      const res = await fetch("/api/admin/product", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Алдаа гарлаа");

      toast.success("Амжилттай нийтлэгдлээ", { id: t });
      setActivePage("Бүтээгдэхүүнүүд");
    } catch {
      toast.error("Алдаа гарлаа", { id: t });
    }
  };

  const inputCls = "w-full bg-slate-100 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600";
  const labelCls = "block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2";
  const addBtnCls = "flex items-center gap-2 text-xs font-bold text-teal-500 hover:text-teal-400 px-3 py-1.5 rounded-xl border border-teal-500/30 hover:border-teal-400/50 transition-all";
  const removeBtnCls = "p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0";

  return (
    <div className="max-w-screen mx-auto pb-20">

      {/* Header */}
      <header className="flex justify-between items-center mb-8 pt-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Бүтээгдэхүүн нэмэх</h2>
          <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">Шинэ бүтээгдэхүүн нэг бүрчлэн эсвэл файлаар нэмэх.</p>
        </div>
        <button type="button" onClick={() => setActivePage("Бүтээгдэхүүнүүд")}
          className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white px-5 py-2.5 rounded-2xl font-semibold transition-colors text-sm">
          ← Буцах
        </button>
      </header>

      {/* Bulk Upload */}
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

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-zinc-800" /></div>
        <div className="relative flex justify-center">
          <span className="bg-slate-50 dark:bg-black px-4 text-slate-400 dark:text-zinc-600 text-xs font-bold uppercase tracking-widest">Гараар бөглөх</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">

          {/* Section 1 — Үндсэн мэдээлэл */}
          <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
            <SectionTitle number={1} title="Үндсэн мэдээлэл" />
            <div className="space-y-5 mt-6">
              <div>
                <label className={labelCls}>Бүтээгдэхүүний нэр *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  placeholder="Жишээ: iPhone 15 Pro" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelCls}>Ангилал *</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className={inputCls}>
                    <option value="">Сонгох</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Төлөв</label>
                  <select name="isPublished" value={String(formData.isPublished)} onChange={handleInputChange} className={inputCls}>
                    <option value="true">Идэвхтэй</option>
                    <option value="false">Идэвхгүй</option>
                  </select>
                </div>
                <div
                  onClick={() => setFormData(p => ({ ...p, featured: !p.featured }))}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all col-span-2 ${
                    formData.featured
                      ? "border-teal-500 bg-teal-500/5"
                      : "border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⭐</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Онцлох бүтээгдэхүүн</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">Нүүр хуудасны carousel-д харуулна</p>
                    </div>
                  </div>
                  <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${formData.featured ? "bg-teal-500" : "bg-slate-200 dark:bg-zinc-700"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${formData.featured ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="SKU-001" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Slug</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="iphone-15-pro" className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Үнэ & Нөөц */}
          <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
            <SectionTitle number={2} title="Үнэ & Нөөц" />
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <label className={labelCls}>Үнэ (₮) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Хөнгөлөлтийн үнэ (₮)</label>
                <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Үлдэгдэл *</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required placeholder="0" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Section 3 — Медиа & Тайлбар */}
          <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
            <SectionTitle number={3} title="Медиа & Тайлбар" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className={labelCls}>Зургууд</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl bg-slate-50 dark:bg-zinc-800/20 hover:border-teal-500/40 transition-all overflow-hidden">
                  {imagePreviews.length > 0 ? (
                    <div className="p-4 grid grid-cols-3 gap-3">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-300 dark:border-zinc-700 group">
                          <img src={src} className="w-full h-full object-cover" />
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
              <div>
                <label className={labelCls}>Дэлгэрэнгүй тайлбар</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange}
                  rows={9} className={`${inputCls} resize-none h-full min-h-[220px]`}
                  placeholder="Барааны талаарх дэлгэрэнгүй мэдээлэл..." />
              </div>
            </div>
          </div>

          {/* Section 4 — Өнгө */}
          <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <SectionTitle number={4} title="Өнгө" />
              <button type="button" onClick={addColor} className={addBtnCls}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                Өнгө нэмэх
              </button>
            </div>
            {colors.length === 0 ? (
              <p className="text-slate-400 dark:text-zinc-600 text-sm text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                Өнгө нэмэгдээгүй байна
              </p>
            ) : (
              <div className="space-y-3">
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-2xl">
                    <div className="relative flex-shrink-0">
                      <input type="color" value={c.hex} onChange={e => updateColor(i, "hex", e.target.value)}
                        className="w-11 h-11 rounded-xl cursor-pointer border-2 border-slate-200 dark:border-zinc-700 p-0.5 bg-transparent" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Hex код</label>
                        <input type="text" value={c.hex} onChange={e => updateColor(i, "hex", e.target.value)}
                          placeholder="#000000" className={inputCls + " py-2.5 text-sm font-mono"} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Нэр</label>
                        <input type="text" value={c.name} onChange={e => updateColor(i, "name", e.target.value)}
                          placeholder="Жишээ: Хар" className={inputCls + " py-2.5 text-sm"} />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeColor(i)} className={removeBtnCls}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5 — Хэмжээ */}
          <div className="p-8 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <SectionTitle number={5} title="Хэмжээ" />
              <button type="button" onClick={addSize} className={addBtnCls}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                Хэмжээ нэмэх
              </button>
            </div>
            {sizes.length === 0 ? (
              <p className="text-slate-400 dark:text-zinc-600 text-sm text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                Хэмжээ нэмэгдээгүй байна
              </p>
            ) : (
              <div className="space-y-3">
                {sizes.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-2xl">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Хэмжээний нэр</label>
                        <input type="text" value={s.sizeName} onChange={e => updateSize(i, "sizeName", e.target.value)}
                          placeholder="Жишээ: XL" className={inputCls + " py-2.5 text-sm"} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Утга</label>
                        <input type="text" value={s.value} onChange={e => updateSize(i, "value", e.target.value)}
                          placeholder="Жишээ: Extra Large" className={inputCls + " py-2.5 text-sm"} />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeSize(i)} className={removeBtnCls}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6 — Онцлог */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <SectionTitle number={6} title="Онцлог шинж чанарууд" />
              <button type="button" onClick={addFeature} className={addBtnCls}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                Онцлог нэмэх
              </button>
            </div>
            {features.length === 0 ? (
              <p className="text-slate-400 dark:text-zinc-600 text-sm text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                Онцлог нэмэгдээгүй байна
              </p>
            ) : (
              <div className="space-y-3">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-2xl">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Гарчиг</label>
                        <input type="text" value={f.title} onChange={e => updateFeature(i, "title", e.target.value)}
                          placeholder="Жишээ: Дэлгэц" className={inputCls + " py-2.5 text-sm"} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Тайлбар</label>
                        <input type="text" value={f.description} onChange={e => updateFeature(i, "description", e.target.value)}
                          placeholder="Жишээ: 6.7 инч OLED" className={inputCls + " py-2.5 text-sm"} />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFeature(i)} className={removeBtnCls + " mt-7"}>
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
              <button type="button" onClick={() => setActivePage("Бүтээгдэхүүнүүд")}
                className="px-6 py-2.5 rounded-2xl text-slate-500 dark:text-zinc-400 font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-sm">
                Цуцлах
              </button>
              <button type="submit"
                className="px-8 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 transition-all active:scale-95 text-sm">
                Нийтлэх
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
