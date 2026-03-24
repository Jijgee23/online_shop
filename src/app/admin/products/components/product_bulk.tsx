"use client";

import { useAdmin } from "@/app/context/admin_context";
import { useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast"; // Хэрэв toast ашигладаг бол

export function ProductBulk() {
    const { setActivePage } = useAdmin();
    const [bulkLoading, setBulkLoading] = useState(false);
    
    // Шинэ state-үүд
    const [selectedData, setSelectedData] = useState<any[] | null>(null);
    const [fileName, setFileName] = useState<string>("");

    // 1. Файлыг зөвхөн уншиж, датаг state-д хадгалах функц
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    toast.error("Excel файл хоосон байна!");
                    return;
                }

                setSelectedData(data); // Датаг түр хадгалах
                toast.success(`${data.length} мөр өгөгдөл уншигдлаа.`);
            } catch (err) {
                toast.error("Файл уншихад алдаа гарлаа.");
            }
        };
        reader.readAsBinaryString(file);
    };

    // 2. Датаг бааз руу илгээх функц (Гараар дуудах)
    const handleUploadRequest = async () => {
        if (!selectedData) return;

        setBulkLoading(true);
        try {
            const res = await fetch("/api/admin/product/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ products: selectedData }),
            });

            const result = await res.json();
            if (res.ok) {
                toast.success(`Амжилттай: ${result.count} бүтээгдэхүүн нэмэгдлээ.`);
                setActivePage("Бүтээгдэхүүнүүд");
            } else {
                toast.error(result.error || "Алдаа гарлаа");
            }
        } catch (err) {
            toast.error("Хүсэлт илгээхэд алдаа гарлаа.");
        } finally {
            setBulkLoading(false);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                name: "iPhone 15 Pro",
                price: 4200000,
                stock: 10,
                categoryId: 1,
                slug: "iphone-15-pro-blue",
                description: "128GB, Titanium Blue өнгөтэй"
            }
        ];
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
        XLSX.writeFile(workbook, "product_template.xlsx");
    };

    return (
        <>
            <header className="flex justify-between items-center mb-10">
                <div>
                    <p className="text-zinc-500">Шинээр эсвэл Excel файлаар олноор нэмэх боломжтой.</p>
                </div>
            </header>

            <div className="max-w-6xl mb-10">
                <div className={`bg-zinc-900/50 border-2 border-dashed rounded-[2rem] p-8 text-center transition-all group ${selectedData ? 'border-teal-500/50' : 'border-zinc-800'}`}>
                    <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform ${selectedData ? 'bg-teal-500 text-white animate-bounce' : 'bg-teal-500/10 text-teal-500'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>

                        <h3 className="text-white font-bold text-lg mb-1">
                            {selectedData ? "Файл бэлэн боллоо" : "Excel файлаар нэмэх"}
                        </h3>
                        <p className="text-zinc-500 text-sm mb-6">
                            {selectedData ? `Сонгогдсон: ${fileName} (${selectedData.length} мөр)` : "Олон тооны бүтээгдэхүүнийг нэгэн зэрэг оруулах бол Excel файл ашиглана уу."}
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            {/* Файл сонгох товч */}
                            <label className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 px-8 py-3 rounded-xl cursor-pointer transition-all font-bold text-sm inline-flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                {selectedData ? "Файл солих" : "Файл сонгох"}
                                <input type="file" accept=".xlsx, .xls" hidden onChange={handleFileSelect} disabled={bulkLoading} />
                            </label>

                            {/* Илгээх товч (Зөвхөн файл сонгогдсон үед харагдана) */}
                            {selectedData && (
                                <button
                                    onClick={handleUploadRequest}
                                    disabled={bulkLoading}
                                    className="bg-teal-500 hover:bg-teal-400 text-white px-10 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
                                >
                                    {bulkLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    {bulkLoading ? "Хадгалж байна..." : "Хүсэлт илгээх"}
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={downloadTemplate}
                            className="mt-8 text-zinc-500 hover:text-zinc-300 text-xs font-bold underline decoration-zinc-700 underline-offset-4 transition-colors"
                        >
                            Загвар файл татах
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] bg-zinc-800 flex-1"></div>
                <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Эсвэл нэг бүрчлэн нэмэх</span>
                <div className="h-[1px] bg-zinc-800 flex-1"></div>
            </div>
        </>
    );
}