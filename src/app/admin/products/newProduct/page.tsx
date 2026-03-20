"use client";

import { useAdmin } from "@/app/context/admin_context";
import Products from "@/pages/products/page";
import { Category } from "@prisma/client";
import { useEffect, useState } from "react";


export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { setActivePage } = useAdmin()
  const [error, setError] = useState("")
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
  const [loading, setLoading] = useState(true);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); // FileList-ийг Array болгох

    if (files.length > 0) {
      // Шинэ файлуудыг хуучин дээр нь нэмэх (Optional: өмнөх зурагнуудыг хадгалах бол)
      setImages(prev => [...prev, ...files]);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    console.log("fetching cats")
    try {
      setLoading(true);
      const res = await fetch("/api/admin/category");
      const data = await res.json();

      // Хэрэв дата массив биш бол хоосон массив оноож алдаанаас сэргийлнэ
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data && Array.isArray(data.categories)) {
        setCategories(data.categories); // Хэрэв { categories: [] } гэж ирдэг бол
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setCategories([]); // Алдаа гарвал хоосон массив болгоно
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("isPublished", String(formData.isPublished));

      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const res = await fetch("/api/admin/product", {
        method: "POST",
        body: formDataToSend,
      });

      // const data = await res.json();

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert("Бүтээгдэхүүн амжилттай нэмэгдлээ!");

      setFormData({
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

      setImages([]);
      setImagePreviews([]);

    } catch (error) {
      console.error(error);
      alert("Алдаа гарлаа" + error);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Шинэ бүтээгдэхүүн нэмэх</h2>
          <p className="text-zinc-500">Бүтээгдэхүүний мэдээллийг оруулна уу.</p>
        </div>
        <button
          type="button"
          onClick={() => setActivePage("Бүтээгдэхүүнүүд")}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-2xl font-bold transition-colors"
        >
          Буцах
        </button>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-6xl">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-bold text-zinc-300 mb-2">
                  Бүтээгдэхүүний нэр *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="Жишээ: iPhone 15 Pro"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-zinc-300 mb-2">
                  Ангилал *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                >
                  <option value="">Ангилал сонгоно уу</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-bold text-zinc-300 mb-2">
                  Үнэ (₮) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1000"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="2500000"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-bold text-zinc-300 mb-2">
                  Үлдэгдэл *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="10"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-zinc-300 mb-2">
                  Төлөв *
                </label>
                <select
                  name="isPublished"
                  value={String(formData.isPublished)}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                >
                  <option value="true">Идэвхтэй</option>
                  {/* <option value="Түр зогссон">Түр зогссон</option> */}
                  <option value="false">Идэвхгүй</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-zinc-300 mb-2">
                  Зураг * (Олон зураг сонгож болно)
                </label>

                <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-teal-500 transition-colors bg-zinc-900/50">
                  {/* Сонгосон зураг байгаа бол жагсаалтаар харуулах */}
                  {imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {imagePreviews.map((src, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={src}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover rounded-lg border border-zinc-700"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              // Тухайн зургийг индексээр нь устгах
                              setImages(prev => prev.filter((_, i) => i !== index));
                              setImagePreviews(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {/* Нэмж зураг оруулах товч (grid дотор) */}
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-lg hover:border-teal-500 cursor-pointer transition-all aspect-square"
                      >
                        <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-zinc-500 mt-1">Нэмэх</span>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      <svg className="w-12 h-12 text-zinc-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div>
                        <p className="text-zinc-400">Зураг сонгох эсвэл чирж оруулах</p>
                        <p className="text-zinc-500 text-[10px]">PNG, JPG, WEBP (MAX. 5MB)</p>
                      </div>
                      <label
                        htmlFor="image-upload"
                        className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors font-bold text-sm"
                      >
                        Зураг сонгох
                      </label>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    multiple // Энэ нь олон файл сонгохыг зөвшөөрнө
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-zinc-300 mb-2">
                  Тайлбар
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                  placeholder="Бүтээгдэхүүний дэлгэрэнгүй тайлбар..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
            >
              Бүтээгдэхүүн нэмэх
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
