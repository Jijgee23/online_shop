"use client";

import { useState, useEffect } from "react";
import { Category } from "@/interface/category"; // Таны өмнө үүсгэсэн interface

export default function AdminCategoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        id: Number,
        name: "",
        slug: "",
        parentId: null as number | null,
    });

    // 1. Дата татах (Read)
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

    useEffect(() => {
        fetchCategories();
    }, []);

    // Slug автоматаар үүсгэх (Нэмэлт)
    const generateSlug = (name: string) => {
        if (showAddForm && editingCategory) return name;

        const cyrillicToLatin: { [key: string]: string } = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z',
            'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'ө': 'o', 'п': 'p',
            'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ү': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
            'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };

        const latinText = name.toLowerCase().split('').map(char => {
            return cyrillicToLatin[char] !== undefined ? cyrillicToLatin[char] : char;
        }).join('');

        return latinText
            .replace(/\s+/g, "-")          // Хоосон зайг зураасаар солих
            .replace(/[^\w-]+/g, "")       // Үсэг, тоо, зурааснаас бусдыг устгах
            .replace(/-+/g, "-")           // Дараалсан олон зураасыг нэг болгох
            .trim();                       // Эхэн болон төгсгөлийн зайг цэвэрлэх
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "name") {
            setFormData(prev => ({ ...prev, name: value, slug: generateSlug(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value, slug: generateSlug(value) }));
        }
    };

    // 2. Ангилал нэмэх (Create)
    const handleAddCategory = async () => {
        console.log("adding category")
        console.log("fomrdata", !formData.name.trim)
        if (!formData.name.trim()) {
            return;
        }

        try {
            const res = await fetch("/api/admin/category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchCategories(); // Жагсаалтыг шинэчлэх
                setShowAddForm(false);
                setFormData({ id: Number, name: "", slug: "", parentId: null });
                setError("")
                return;
            }
        } catch (error) {
            console.error("Add error:", error);
        }
    };

    // 3. Ангилал засах (Update)
    const handleUpdateCategory = async () => {
        if (!editingCategory || !formData.name.trim()) return;

        try {
            const res = await fetch(`/api/admin/category`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchCategories();
                setEditingCategory(null);
                setFormData({ name: "", slug: "", parentId: null, id: Number });
                setError("")
                return;
            }
            const data = await res.json()
            setError(data.error ?? 'Амжилтүй')
        } catch (error) {
            setError('Амжилтүй')
            console.error("Update error:", error);
        }
    };

    // 4. Ангилал устгах (Delete)
    const handleDeleteCategory = async (id: number) => {
        if (!confirm("Энэ ангиллыг устгахдаа итгэлтэй байна уу?")) return;

        try {
            const res = await fetch(`/api/admin/category/${id}`, {
                method: "PATCH",
            });

            if (res.ok) {
                setCategories(prev => prev.filter(cat => cat.id !== id));
                useEffect
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-white text-center">Ачаалж байна...</div>;

    return (
        <>
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Ангилал удирдах</h2>
                    <p className="text-zinc-500 text-sm">Системийн нийт ангиллууд.</p>
                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Ангилал нэмэх
                </button>
            </header>
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-6 flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Forms (Add/Edit) */}
            {(showAddForm || editingCategory) && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 mb-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-6">
                        {editingCategory ? "Ангилал засах" : "Шинэ ангилал нэмэх"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-300 mb-2">Нэр *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-300 mb-2">Slug (URL)</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                readOnly
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingCategory(null);
                            }}
                            className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-bold"
                        >
                            Цуцлах
                        </button>
                        <button
                            onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                            className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold"
                        >
                            {editingCategory ? "Хадгалах" : "Нэмэх"}
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-950/50 text-zinc-500 text-[10px] uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Нэр</th>
                            <th className="px-8 py-5">Slug</th>
                            <th className="px-8 py-5">Огноо</th>
                            <th className="px-8 py-5 text-right">Үйлдэл</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {filteredCategories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-zinc-800/30 transition-all">
                                <td className="px-8 py-5 font-bold text-white">{cat.name}</td>
                                <td className="px-8 py-5 text-zinc-400 font-mono text-xs">{cat.slug}</td>
                                <td className="px-8 py-5 text-zinc-500 text-sm">
                                    {new Date(cat.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingCategory(cat);
                                                setFormData({ id: cat.id as any, name: cat.name, slug: cat.slug, parentId: cat.parentId });
                                            }}
                                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg"
                                        >
                                            Засах
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                        >
                                            Устгах
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}