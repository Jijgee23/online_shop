"use client";

import { useAdmin } from "@/app/context/admin_context";
import { useEffect, useState } from "react";
import { ProductBulk } from "../components/product_bulk";
import { useCategory } from "@/app/context/category_context";

export default function NewProductPage() {
  const { categories, fetchCategories } = useCategory()
  const { setActivePage } = useAdmin();

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: "",
    stock: "",
    description: "",
    slug: "",
    sku: "",
    discountPrice: "",
    isPublished: true,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // ... (handleInputChange, handleImageChange, fetchCategories функцууд хэвээрээ)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImages(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, String(value)));
      images.forEach((image) => formDataToSend.append("images", image));

      const res = await fetch("/api/admin/product", { method: "POST", body: formDataToSend });
      if (!res.ok) throw new Error("Алдаа гарлаа");

      alert("Амжилттай!");
      setActivePage("Бүтээгдэхүүнүүд");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* 1. Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Бүтээгдэхүүн нэмэх</h2>
          <p className="text-zinc-500">Шинэ бүтээгдэхүүн нэг бүрчлэн эсвэл файлаар нэмэх.</p>
        </div>
        <button
          type="button"
          onClick={() => setActivePage("Бүтээгдэхүүнүүд")}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-lg"
        >
          Буцах
        </button>
      </header>

      {/* 2. Excel Bulk Upload Section - Дээд хэсэгт байрлуулснаар илүү эвтэйхэн */}
      <section className="mb-12">
        <ProductBulk />
      </section>

      {/* 3. Divider - Сонголтуудыг зааглах шугам */}
      <div className="relative mb-12">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center uppercase">
          <span className="bg-black px-6 text-zinc-500 text-xs font-bold tracking-[0.2em]">Эсвэл гараар бөглөх</span>
        </div>
      </div>

      {/* 4. Үндсэн Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left Column: Мэдээллүүд */}
            <div className="space-y-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center text-sm">1</span>
                Үндсэн мэдээлэл
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-400 mb-2 ml-1">Бүтээгдэхүүний нэр *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                    placeholder="Жишээ: iPhone 15 Pro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2 ml-1">Ангилал *</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500/50 outline-none appearance-none"
                    >
                      <option value="">Сонгох</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2 ml-1">Төлөв</label>
                    <select
                      name="isPublished"
                      value={String(formData.isPublished)}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500/50 outline-none"
                    >
                      <option value="true">Идэвхтэй</option>
                      <option value="false">Идэвхгүй</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2 ml-1">Үнэ (₮) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2 ml-1">Үлдэгдэл *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500/50 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Медиа ба Тайлбар */}
            <div className="space-y-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center text-sm">2</span>
                Медиа ба Тайлбар
              </h3>

              {/* Image Upload Box */}
              <div className="border-2 border-dashed border-zinc-700 rounded-[2rem] p-6 bg-zinc-800/20 hover:border-teal-500/50 transition-all">
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-700 group">
                        <img src={src} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImages(images.filter((_, i) => i !== idx));
                            setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
                          }}
                          className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          Устгах
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors">
                      <span className="text-2xl text-zinc-500">+</span>
                      <input type="file" multiple hidden onChange={handleImageChange} />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center py-10 cursor-pointer">
                    <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-zinc-400 text-2xl">📸</div>
                    <p className="text-zinc-400 font-bold">Зураг оруулах</p>
                    <p className="text-zinc-600 text-xs mt-1">Олон зураг сонгох боломжтой</p>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2 ml-1">Дэлгэрэнгүй тайлбар</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500/50 outline-none resize-none"
                  placeholder="Барааны талаарх мэдээлэл..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setActivePage("Бүтээгдэхүүнүүд")}
              className="px-8 py-4 rounded-2xl text-zinc-400 font-bold hover:bg-zinc-800 transition-colors"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              className="px-10 py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-extrabold shadow-lg shadow-teal-500/20 transition-all active:scale-95"
            >
              Бүтээгдэхүүнийг нийтлэх
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}