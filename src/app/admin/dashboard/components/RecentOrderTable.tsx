import { RecentOrder } from "@/interface/dashboard";
import RecentOrderComp from "./RecentOrder";
import { PageKey } from "@/app/context/admin_context";



export default function RecentOrderTable({ recent, setActivePage }: { recent: RecentOrder[], setActivePage: (page: PageKey) => void }) {

    return (
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">Сүүлийн захиалгууд</h3>
                <button onClick={() => setActivePage("Захиалгууд")} className="text-xs text-teal-400 font-bold hover:underline">
                    Бүгдийг харах →
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-zinc-950/50 text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-6 py-4">Дугаар</th>
                            <th className="px-6 py-4">Хэрэглэгч</th>
                            <th className="px-6 py-4">Төлөв</th>
                            <th className="px-6 py-4 text-right">Дүн</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                        {recent.length > 0 ? (
                            recent.map(order => <RecentOrderComp key={order.id} {...order} />)
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 dark:text-zinc-600 text-sm">
                                    Захиалга олдсонгүй
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}