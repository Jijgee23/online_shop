import InvoiceTile from "./InvoiceTile";

interface Props {
    invoices: any[];
    loading: boolean;
    onSelect: (invoiceId: string) => void;
}

export default function InvoiceTable({ invoices, loading, onSelect }: Props) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow">
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
                </div>
            ) : invoices.length === 0 ? (
                <div className="p-16 text-center">
                    <div className="text-4xl mb-3">🧾</div>
                    <p className="font-semibold text-slate-400 dark:text-zinc-500">Invoice олдсонгүй</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                <th className="text-left px-6 py-4">Invoice ID</th>
                                <th className="text-left px-6 py-4">Sender No</th>
                                <th className="text-right px-6 py-4">Дүн</th>
                                <th className="text-left px-6 py-4">Захиалга</th>
                                <th className="text-left px-6 py-4">Төлөв</th>
                                <th className="text-left px-6 py-4">Дуусах хугацаа</th>
                                <th className="text-left px-6 py-4">Үүссэн</th>
                                <th className="px-6 py-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {invoices.map(inv => (
                                <InvoiceTile
                                    key={inv.id}
                                    inv={inv}
                                    onClick={() => onSelect(inv.invoiceId)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
