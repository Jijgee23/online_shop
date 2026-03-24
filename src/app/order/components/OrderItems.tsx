
import { Order } from "@/interface/order";
import { Package, ShoppingBag } from "lucide-react";
export default function OrderItems(order: Order) {

    const items = order.items

    if (order.items === null) return (<div>Бараагүй захиалга</div>)

    return (<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-teal-500" />
                Захиалсан бараанууд
            </h2>
            <span className="text-sm text-slate-400">#{order.orderNumber}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Энд таны OrderItem-ууд харагдана. 
                    Хэрэв та Prisma include: { items: { include: { product: true } } } хийсэн бол:
                */}
            {order.items?.map((item: any) => (
                <div key={item.id} className="p-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white">{item.product?.name || "Бараа"}</h4>
                        <p className="text-sm text-slate-500">{item.quantity} ширхэг x ₮{item.product?.price?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">₮{(item.quantity * item.product?.price).toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>);
}