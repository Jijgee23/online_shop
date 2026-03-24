
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
        router.push(`/admin/products/${product.id}`)
    }
    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/product/${product.id}`)
    }
    const { deleteProduct } = useProducts()
    const handleDisable = async (e: React.MouseEvent) => {
        e.stopPropagation()
        deleteProduct(product.id)
    }

    const imageUrl = product.images?.[0]?.url || "/uploads/placeholder.png";

    return (
        <tr key={product.id} onClick={handleTap} className="hover:bg-zinc-800/30 transition-all group">
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">{product.name}</p>
                        <p className="text-xs text-zinc-500">ID: #PRD-{product.id + 1000}</p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-5">
                <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-zinc-300">
                    {product.category!.name}
                </span>
            </td>
            <td className="px-8 py-5 text-right">
                <p className="font-bold text-white">₮{product.price.toLocaleString()}</p>
            </td>
            <td className="px-8 py-5 text-center">
                <span className={`font-bold ${getStockColor(product.stock)}`}>
                    {product.stock}
                </span>
            </td>
            <td className="px-8 py-5">
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getProductStatusColor(product.state)}`}>
                    {getProductStatusName(product.state)}
                </span>
            </td>
            <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleView}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleDisable}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-zinc-500 hover:text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>

    )
}