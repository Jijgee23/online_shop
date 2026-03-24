"use client";

import { useAdmin } from "@/app/context/admin_context";
import { useCategory } from "@/app/context/category_context";
import { ProductImage } from "@/interface/product";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


export default function EditProductPage() {
    const params = useParams();
    const productId = params.id;
    const { setActivePage } = useAdmin();
    const { categories, fetchCategories } = useCategory()
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter()

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
    const [existingImages, setExistingImages] = useState<ProductImage[]>([]); // Баазад байгаа зургууд

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log("fetchind product id", productId)
                const res = await fetch(`/api/admin/product/${productId}`)
                const data = await res.json();
                const prodData = data.product
                // 2. Form-д датаг оноох
                setFormData({
                    name: prodData.name || "",
                    categoryId: prodData.categoryId || "",
                    price: String(prodData.price) || "",
                    stock: String(prodData.stock) || "",
                    description: prodData.description || "",
                    slug: prodData.slug || "",
                    sku: prodData.sku || "",
                    discountPrice: String(prodData.discountPrice || ""),
                    isPublished: prodData.isPublished,
                });

                // 3. Өмнөх зургуудыг тохируулах
                setExistingImages(prodData.images || []);
            } catch (error) {
                console.error("Дата татахад алдаа гарлаа:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories()
        if (productId) fetchData();
    }, [productId]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const loading = toast.loading('Мэдээллийг хадгалж байна')
        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, String(value)));

            // Шинээр нэмсэн зургууд
            images.forEach((image) => formDataToSend.append("images", image));
            // Хуучин зургуудаас алийг нь үлдээхийг мөн явуулж болно
            formDataToSend.append("existingImages", JSON.stringify(existingImages));

            const res = await fetch(`/api/admin/product/${productId}`, {
                method: "PATCH",
                body: formDataToSend
            });

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.message ?? 'Шинэчлэхэд алдаа гарлаа', { id: loading })
                return
            }
            toast.success(data.message ?? 'Амжилттай шинэчлэгдлээ', { id: loading })
            router.back()
            // setActivePage("Бүтээгдэхүүнүүд");
        } catch (error) {
            toast.error('Шинэчлэхэд алдаа гарлаа', { id: loading })
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="text-white text-center py-20">Ачаалж байна...</div>;

    return (
        <div className="max-w-screen mx-auto px-10 pb-20" >
            <header className="flex justify-between items-center mb-10 pt-5">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Бүтээгдэхүүн засах</h2>
                    <p className="text-zinc-500">Бүтээгдэхүүний мэдээллийг шинэчлэх.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-2xl font-bold transition-colors"
                >
                    Буцах
                </button>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Left Side */}
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center text-sm">1</span>
                                Үндсэн мэдээлэл
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-400 mb-2">Нэр *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-teal-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-400 mb-2">Ангилал</label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white outline-none"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-400 mb-2">Төлөв</label>
                                        <select
                                            name="isPublished"
                                            value={String(formData.isPublished)}
                                            onChange={handleInputChange}
                                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white"
                                        >
                                            <option value="true">Идэвхтэй</option>
                                            <option value="false">Идэвхгүй</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-400 mb-2">Үнэ (₮)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-400 mb-2">Үлдэгдэл</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center text-sm">2</span>
                                Медиа
                            </h3>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-zinc-400">Зургууд</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Өмнө нь байсан зургууд */}
                                    {existingImages.map((img, idx) => (
                                        <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-700 group">
                                            <img src={img.url} className="w-full h-full object-cover opacity-60" />
                                            <button
                                                type="button"
                                                onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                                                className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold"
                                            >
                                                Устгах
                                            </button>
                                        </div>
                                    ))}

                                    {/* Шинээр нэмж буй зургууд */}
                                    {imagePreviews.map((src, idx) => (
                                        <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-teal-500/50 group">
                                            <img src={src} className="w-full h-full object-cover" />
                                            <div className="absolute top-1 left-1 bg-teal-500 text-[8px] px-1 rounded text-white uppercase font-bold">New</div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImages(images.filter((_, i) => i !== idx));
                                                    setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
                                                }}
                                                className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold"
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
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2">Тайлбар</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-4 text-white resize-none outline-none"
                                />
                            </div>
                        </div>
                    </div>

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
                            disabled={isUpdating}
                            className={`px-10 py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-extrabold shadow-lg transition-all active:scale-95 ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {isUpdating ? "Шинэчилж байна..." : "Өөрчлөлтийг хадгалах"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}