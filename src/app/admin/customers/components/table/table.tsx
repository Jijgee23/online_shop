import CustomerTile from "../customer_tile";
import CustomerTableHeader from "./header";
import { Customer } from '@/interface/user';

export default function CustomerTable({ customers }: { customers: Customer[] }) {

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-zinc-950/50 text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
                        <CustomerTableHeader />
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {customers.map((user) => (
                            <CustomerTile key={user.id} {...user} />
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-6 bg-zinc-950/20 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
                <span>Нийт {customers.length} хэрэглэгчээс 1-5 харуулж байна</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-zinc-800 rounded hover:bg-zinc-800 disabled:opacity-30 transition">Өмнөх</button>
                    <button className="px-3 py-1 border border-zinc-800 rounded hover:bg-zinc-800 transition">Дараах</button>
                </div>
            </div>
        </div>
    )
}