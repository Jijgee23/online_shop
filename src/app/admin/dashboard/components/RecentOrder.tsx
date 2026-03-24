import { RecentOrder } from "@/interface/dashboard";
import { getOrderStatusInfo } from "../../order/components/AdminOrderTile";
import { useRouter } from "next/navigation";


export default function RecentOrderComp(order: RecentOrder) {

    const statusInfo = getOrderStatusInfo(order.status);
    const router = useRouter()

    const handleTap = () => {
        router.push(`/order/${order.id}`)
    }

    return (<tr key={order.id} onClick={handleTap} className="hover:bg-zinc-800/30 transition-colors cursor-pointer group">
        <td className="px-8 py-5 font-mono text-zinc-400 text-xs">#{order.orderNumber}</td>
        <td className="px-8 py-5">
            <div className="flex flex-col">
                <span className="font-bold text-white">{order.user.name}</span>
                <span className="text-[10px] text-zinc-500">{order.user.email}</span>
            </div>
        </td>
        <td className="px-8 py-5">
            <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${statusInfo.color}`}>
                {statusInfo.name}
            </span>
        </td>
        <td className="px-8 py-5 text-right font-bold text-white">
            ₮{order.totalPrice.toLocaleString()}
        </td>
    </tr>)
}