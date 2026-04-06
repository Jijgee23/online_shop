"use client";
import { useProducts } from "@/app/context/product_context";
import { Product } from "@/interface/product"
import { getProductStatusColor, getProductStatusName } from '@/utils/utils'
import { useRouter } from "next/navigation";



export default function ProductTile(product: Product) {

    const getStockColor = (stock: number) => {
        if (stock === 0) return "text-red-500";
        if (stock < 10) return "text-yellow-500";
        return "text-green-500";
    };

    const router = useRouter()

    const handleTap = () => {
        if (isDeleted) return;
        router.push(`/admin/products/${product.id}`)
    }
    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/product/${product.id}`)
    }
    const { deleteProduct, restoreProduct } = useProducts()
    const handleDisable = async (e: React.MouseEvent) => {
        e.stopPropagation()
        deleteProduct(product.id)
    }
    const handleRestore = async (e: React.MouseEvent) => {
        e.stopPropagation()
        restoreProduct(product.id)
    }

    const isDeleted  = !!product.deletedAt;
    const isInactive = !isDeleted && product.state !== "ACTIVE";

    const imageUrl = product.images?.[0]?.url || "/uploads/placeholder.png";

    return (
        <tr
            onClick={handleTap}
            className={`transition-all group ${
                isDeleted
                    ? "opacity-50 bg-red-500/5 cursor-default"
                    : "hover:bg-slate-100 dark:hover:bg-zinc-800/30 cursor-pointer"
            }`}
        >
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                        <img src={imageUrl} alt={product.name} className={`w-full h-full object-cover ${isDeleted ? "grayscale" : ""}`} />
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
                            className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    )}
                    {!isDeleted && (
                        <button
                            onClick={handleTap}
                            title="Засварлах"
                            className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    )}
                    {isDeleted || isInactive ? (
                        <button
                            onClick={handleRestore}
                            title="Сэргээх"
                            className="p-2 hover:bg-teal-500/20 rounded-lg transition-colors text-slate-400 dark:text-zinc-500 hover:text-teal-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
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
                </div>
            </td>
        </tr>
    )
}
