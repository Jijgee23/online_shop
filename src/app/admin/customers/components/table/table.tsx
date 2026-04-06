import CustomerTile from "../customer_tile";
import CustomerTableHeader from "./header";
import { Customer } from '@/interface/user';

interface Props {
    customers: Customer[];
    total: number;
    page: number;
    pageSize: number;
}

export default function CustomerTable({ customers, total, page, pageSize }: Props) {
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to   = Math.min(page * pageSize, total);

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-zinc-950/50 text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
                        <CustomerTableHeader />
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                        {customers.map(user => (
                            <CustomerTile key={user.id} {...user} />
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-8 py-4 bg-slate-50 dark:bg-zinc-950/20 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-400 dark:text-zinc-500">
                {total > 0 ? `${from}–${to} / нийт ${total} хэрэглэгч` : "Хэрэглэгч байхгүй"}
            </div>
        </div>
    );
}
