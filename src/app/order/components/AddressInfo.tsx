import { Address, Order } from "@/interface/order"
import { LocationEdit, House, PhoneCallIcon } from "lucide-react";
export default function AddressInfo(order: Order) {
    const address = order.address
    if (address === null) {
        return <div></div>
    }
    return (
        < div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm" >
            {/* Header */}
            < div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center" >
                <h2 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <LocationEdit className="w-5 h-5 text-teal-500" />
                    Хүргэлтийн мэдээлэл
                </h2>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    #{order.orderNumber}
                </span>
            </div >

            {/* Address Details */}
            < div className="p-6 space-y-6" >
                <div className="flex items-start gap-5">
                    <div className="w-12 h-12 bg-teal-50 dark:bg-teal-500/10 rounded-2xl flex-shrink-0 flex items-center justify-center">
                        <House className="w-6 h-6 text-teal-600 dark:text-teal-500" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Хүргэх хаяг</p>
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                            {address?.city}, {address?.district} дүүрэг
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                            {address?.khoroo}-р хороо, {address?.detail}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex-shrink-0 flex items-center justify-center">
                        <PhoneCallIcon className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Холбоо барих дугаар</p>
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                            {address?.phone}
                        </h4>
                        <p className="text-sm text-slate-500">Захиалга хүргэх үед энэ дугаар руу залгана.</p>
                    </div>
                </div>
            </div >

            {/* Footer Detail (Optional) */}
            < div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 text-center" >
                <p className="text-xs text-slate-400 italic font-medium">
                    Захиалга үүсгэсэн огноо: {new Date(order.createdAt).toLocaleDateString()}
                </p>
            </div >
        </div >
    )
}