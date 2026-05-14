"use client";
import { useProducts } from "@/app/context/product_context";
import { Product } from "@/interface/product"
import { getProductStatusColor, getProductStatusName } from '@/utils/utils'
import { useRouter } from "next/navigation";
import { Trash2, LucideArchiveRestore, Eye, SquarePen, AlertTriangle } from "lucide-react";
import { useState } from "react";


type Props = Product & { selected: boolean; onToggle: (id: number) => void }

export default function ProductTile({ selected, onToggle, ...product }: Props) {

    const getStockColor = (stock: number) => {
        if (stock === 0) return "text-red-500";
        if (stock < 10) return "text-yellow-500";
        return "text-green-500";
    };

    const iconStyle = "p-2 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white";

    const router = useRouter()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const handleTap = () => {
        if (isDeleted) return;
        router.push(`/admin/products/${product.id}`)
    }
    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/product/${product.id}`)
    }
    const { deleteProduct, restoreProduct, permantentDelete } = useProducts()
    const handleDisable = async (e: React.MouseEvent) => {
        e.stopPropagation()
        deleteProduct(product.id)
    }
    const handleRestore = async (e: React.MouseEvent) => {
        e.stopPropagation()
        restoreProduct(product.id)
    }
    const handlePermanentDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        setShowDeleteDialog(true)
    }

    const confirmPermanentDelete = () => {
        setShowDeleteDialog(false)
        permantentDelete(product.id)
    }

    const isDeleted = !!product.deletedAt;
    const isInactive = !isDeleted && product.state !== "ACTIVE";

    const realUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${product.images?.[0]?.url ||
        "/uploads/placeholder.png"}`;

    return (
        <>
        {showDeleteDialog && (
            <tr>
                <td colSpan={7} className="p-0">
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDeleteDialog(false)}
                    >
                        <div
                            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-7 h-7 text-red-500" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Бүр мөсөн устгах уу?</h2>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">
                                    Та энэ барааг бүр мөсөн устгах гэж байна. Үүнийг буцаах боломжгүй.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteDialog(false)}
                                    className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Болих
                                </button>
                                <button
                                    onClick={confirmPermanentDelete}
                                    className="flex-1 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors"
                                >
                                    Устгах
                                </button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        )}
        <tr
            onClick={handleTap}
            className={`transition-all group ${isDeleted
                ? "opacity-50 bg-red-500/5 cursor-default"
                : "hover:bg-slate-100 dark:hover:bg-zinc-800/30 cursor-pointer"
                }`}
        >
            <td className="pl-6 pr-2 py-5" onClick={e => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggle(product.id)}
                    className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                />
            </td>
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                        <img src={realUrl} alt={product.name} className={`w-full h-full object-cover ${isDeleted ? "grayscale" : ""}`} />
                    </div>
                    <div>
                        <p className={`font-bold text-sm ${isDeleted ? "line-through text-slate-400 dark:text-zinc-500" : "text-slate-900 dark:text-white"}`}>
                            {product.name}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500">ID: #PRD-{product.id + 1000}</p>
                        {product.featured && (
                            <span className="text-[10px] font-bold text-teal-500">⭐ Онцлох</span>
                        )}
                        {isDeleted && (
                            <p className="text-[10px] text-red-400 font-bold mt-0.5">
                                Устгасан: {new Date(product.deletedAt!).toLocaleDateString("mn-MN")}
                            </p>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-8 py-5">
                <span className="bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-300">
                    {product.category?.name ?? "—"}
                </span>
            </td>
            <td className="px-8 py-5 text-right">
                <p className={`font-bold ${isDeleted ? "text-slate-400 dark:text-zinc-600" : "text-slate-900 dark:text-white"}`}>
                    ₮{product.price.toLocaleString()}
                </p>
            </td>
            <td className="px-8 py-5 text-center">
                <span className={`font-bold ${isDeleted ? "text-slate-400 dark:text-zinc-600" : getStockColor(product.stock)}`}>
                    {product.stock}
                </span>
            </td>
            <td className="px-8 py-5">
                {isDeleted ? (
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full border border-red-800 text-red-400 bg-red-500/10">
                        Устгагдсан
                    </span>
                ) : (
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getProductStatusColor(product.state)}`}>
                        {getProductStatusName(product.state)}
                    </span>
                )}
            </td>
            <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-2">
                    {!isDeleted && (
                        <button
                            onClick={handleView}
                            title="Харах"
                           className={iconStyle}>
                          <Eye className="w-4 h-4"  onClick={handleView}/>
                        </button>
                    )}
                    {!isDeleted && (
                        <button
                            onClick={handleTap}
                            title="Засварлах"
                            className={iconStyle}>
                            <SquarePen className="w-4 h-4"/>
                        </button>
                    )}
                    {isDeleted || isInactive ? (
                        <button
                            onClick={handleRestore}
                            title="Сэргээх"
                            className={iconStyle}>
                            <LucideArchiveRestore className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleDisable}
                            title="Идэвхгүй болгох"
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 dark:text-zinc-500 hover:text-red-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>

                        </button>
                    )}
    
                    <button
                        onClick={handlePermanentDelete}
                        title="Бүр мөсөн устгах"
                         className={iconStyle}>
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
        </>
    )
}
