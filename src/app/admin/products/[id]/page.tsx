"use client";

import { useAdmin } from "@/app/context/admin_context";
import { useCategory } from "@/app/context/category_context";
import { ProductImage } from "@/interface/product";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ImageCropper from "@/app/components/ImageCropper";
import { useImageCrop } from "@/utils/useImageCrop";
import DropdownSelect from "@/ui/DropdownSelect";


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
        featured: false,
        features: [] as { title: string; description: string }[],
        colors: [] as { name: string; hex: string }[],
        productSizes: [] as { sizeName: string; value: string }[],
    });

    const { images, imagePreviews, setImagePreviews, cropQueue, getImage, onCropDone, onCropCancel, removeImage } = useImageCrop();
    const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
    const addSize = () => {
        setFormData({
            ...formData,
            productSizes: [...formData.productSizes, { sizeName: "", value: "" }]
        });
    };

    // Хэмжээг засах
    const updateSize = (index: number, field: "sizeName" | "value", val: string) => {
        const newSizes = [...formData.productSizes];
        newSizes[index][field] = val;
        setFormData({ ...formData, productSizes: newSizes });
    };

    // Хэмжээг устгах
    const removeSize = (index: number) => {
        setFormData({
            ...formData,
            productSizes: formData.productSizes.filter((_, i) => i !== index)
        });
    };
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
                    featured: prodData.featured ?? false,
                    features: prodData.features || [],
                    colors: prodData.colors || [],
                    productSizes: prodData.productSizes || [],
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


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const loading = toast.loading('Мэдээллийг хадгалж байна')
        try {
            const formDataToSend = new FormData();

            // 1. Үндсэн мэдээллүүдийг нэмэх
            // formData дотор байгаа string/number утгуудыг нэмнэ
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== "colors" && key !== "features" && key !== "productSizes") {
                    formDataToSend.append(key, String(value));
                }
            });

            // 2. Олон түвшний (Array/Object) өгөгдлийг JSON стринг болгож нэмэх
            // ЭНЭ ХЭСЭГ ХАМГИЙН ЧУХАЛ:
            formDataToSend.append("colors", JSON.stringify(formData.colors));
            formDataToSend.append("features", JSON.stringify(formData.features));
            formDataToSend.append("productSizes", JSON.stringify(formData.productSizes));

            // 3. Бусад (Зураг гэх мэт)
            images.forEach((image) => formDataToSend.append("images", image));
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

    if (loading) return <div className="text-slate-900 dark:text-white text-center py-20">Ачаалж байна...</div>;

    return (
        <div className="max-w-screen mx-auto px-10 pb-20" >
            <header className="flex justify-between items-center mb-10 pt-5">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Бүтээгдэхүүн засах</h2>
                    <p className="text-slate-400 dark:text-zinc-500">Бүтээгдэхүүний мэдээллийг шинэчлэх.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white px-6 py-3 rounded-2xl font-bold transition-colors"
                >
                    Буцах
                </button>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Left Side */}
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center text-sm">1</span>
                                Үндсэн мэдээлэл
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 dark:text-zinc-400 mb-2">Нэр *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-slate-100 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 dark:text-zinc-400 mb-2">Ангилал</label>
                                        <DropdownSelect
                                            value={String(formData.categoryId)}
                                            onChange={id => setFormData(prev => ({ ...prev, categoryId: String(id) }))}
                                            options={categories.map(cat => ({ id: String(cat.id), label: cat.name }))}
                                            placeholder="Сонгох"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 dark:text-zinc-400 mb-2">Төлөв</label>
                                        <DropdownSelect
                                            value={String(formData.isPublished)}
                                            onChange={id => setFormData(prev => ({ ...prev, isPublished: id === "true" }))}
                                            options={[
                                                { id: "true", label: "Идэвхтэй" },
                                                { id: "false", label: "Идэвхгүй" },
                                            ]}
                                            searchable={false}
                                        />
                                    </div>
                                </div>

                                <div
                                    onClick={() => setFormData(p => ({ ...p, featured: !p.featured }))}
                                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 dark:text-zinc-400 mb-2">Үнэ (₮)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-100 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 dark:text-zinc-400 mb-2">Үлдэгдэл</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-100 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center text-sm">2</span>
                                Медиа
                            </h3>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-500 dark:text-zinc-400">Зургууд</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Өмнө нь байсан зургууд */}
                                    {existingImages.map((img, idx) => (
                                        <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-300 dark:border-zinc-700 group">
                                            <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${img.url}`} className="w-full h-full object-cover opacity-60" />
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
                                                onClick={() => removeImage(idx)}
                                                className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold"
                                            >
                                                Устгах
                                            </button>
                                        </div>
                                    ))}

                                    <label className="aspect-square border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                        <span className="text-2xl text-slate-400 dark:text-zinc-500">+</span>
                                        <input type="file" multiple hidden onChange={getImage} />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 dark:text-zinc-400 mb-2">Тайлбар</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full bg-slate-100 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white resize-none outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-zinc-800">
                            <h3 className="text-slate-900 dark:text-white font-bold flex justify-between items-center">
                                Онцлог шинжүүд
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, features: [...formData.features, { title: "", description: "" }] })}
                                    className="text-xs bg-teal-500/10 text-teal-500 px-3 py-1 rounded-lg hover:bg-teal-500/20"
                                >+ Нэмэх</button>
                            </h3>
                            {formData.features.map((f, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        placeholder="Гарчиг"
                                        value={f.title}
                                        onChange={(e) => {
                                            const newFeatures = [...formData.features];
                                            newFeatures[i].title = e.target.value;
                                            setFormData({ ...formData, features: newFeatures });
                                        }}
                                        className="flex-1 bg-slate-100 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white text-sm"
                                    />
                                    <input
                                        placeholder="Тайлбар"
                                        value={f.description}
                                        onChange={(e) => {
                                            const newFeatures = [...formData.features];
                                            newFeatures[i].description = e.target.value;
                                            setFormData({ ...formData, features: newFeatures });
                                        }}
                                        className="flex-[2] bg-slate-100 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) })}
                                        className="text-red-500 p-2"
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 pt-6">
                            <h3 className="text-slate-900 dark:text-white font-bold flex justify-between items-center">
                                Өнгөнүүд
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, colors: [...formData.colors, { name: "", hex: "#000000" }] })}
                                    className="text-xs bg-teal-500/10 text-teal-500 px-3 py-1 rounded-lg hover:bg-teal-500/20"
                                >+ Өнгө нэмэх</button>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {formData.colors.map((c, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/30 p-2 rounded-xl border border-slate-200 dark:border-zinc-800">
                                        <input
                                            type="color"
                                            value={c.hex}
                                            onChange={(e) => {
                                                const newColors = [...formData.colors];
                                                newColors[i].hex = e.target.value;
                                                setFormData({ ...formData, colors: newColors });
                                            }}
                                            className="w-8 h-8 rounded-lg overflow-hidden border-none bg-transparent cursor-pointer"
                                        />
                                        <input
                                            placeholder="Өнгөний нэр"
                                            value={c.name}
                                            onChange={(e) => {
                                                const newColors = [...formData.colors];
                                                newColors[i].name = e.target.value;
                                                setFormData({ ...formData, colors: newColors });
                                            }}
                                            className="flex-1 bg-transparent text-slate-900 dark:text-white text-sm outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, colors: formData.colors.filter((_, idx) => idx !== i) })}
                                            className="text-slate-400 dark:text-zinc-500 hover:text-red-500 transition-colors"
                                        >✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-zinc-800">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center text-sm">3</span>
                                    Хэмжээний сонголтууд
                                </h3>
                                <button
                                    type="button"
                                    onClick={addSize}
                                    className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                >
                                    <span className="text-teal-500">+</span> Нэмэх
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.productSizes.map((size, index) => (
                                    <div
                                        key={index}
                                        className="group relative flex items-center gap-3 p-4 bg-slate-100 dark:bg-zinc-800/30 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
                                    >
                                        <div className="flex-1 space-y-3">
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase ml-1 mb-1 block">Төрөл</label>
                                                    <input
                                                        placeholder="Жишээ: EU, Size"
                                                        value={size.sizeName}
                                                        onChange={(e) => updateSize(index, "sizeName", e.target.value)}
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-teal-500"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase ml-1 mb-1 block">Утга</label>
                                                    <input
                                                        placeholder="Жишээ: 42, XL"
                                                        value={size.value}
                                                        onChange={(e) => updateSize(index, "value", e.target.value)}
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-teal-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeSize(index)}
                                            className="p-2 text-slate-400 dark:text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Устгах"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                {formData.productSizes.length === 0 && (
                                    <div className="col-span-full py-10 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600">
                                        <p className="text-sm">Одоогоор хэмжээ нэмээгүй байна.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-slate-200 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={() => setActivePage("Бүтээгдэхүүнүүд")}
                            className="px-8 py-4 rounded-2xl text-slate-500 dark:text-zinc-400 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
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

            {cropQueue.length > 0 && (
                <ImageCropper
                    imageSrc={cropQueue[0].src}
                    fileName={cropQueue[0].name}
                    onDone={onCropDone}
                    onCancel={onCropCancel}
                />
            )}
        </div>
    );
}