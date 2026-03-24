import { Order } from "@/interface/order"
import { Calendar, ChevronRight, Clock, Package, Tag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"


export default function OrderTile(order: Order) {

    const router = useRouter()
    return (
        <div
            onClick={() => router.push(`order/${order.id}`)}
            key={order.id}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-teal-500/50 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
            {/* Order Basic Info */}
            <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                    <Package className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                        Захиалга #{order.orderNumber}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-teal-600 dark:text-teal-400">
                            <Tag className="w-4 h-4" />
                            ₮{order.totalPrice?.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Status & Action */}
            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                <div className="flex flex-col items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 
                      ${order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        {order.status === 'DELIVERED' ? 'Хүргэгдсэн' : 'Боловсруулагдаж байна'}
                    </span>
                </div>

                <Link href={`/order/${order.id}`}>
                    <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-teal-500 rounded-full transition-colors">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </Link>
            </div>
        </div>
    )
}