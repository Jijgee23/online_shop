import InvoiceStatusBadge from "./InvoiceStatusBadge";

interface Props {
    inv: any;
    onClick: () => void;
}

export default function InvoiceTile({ inv, onClick }: Props) {
    return (
        <tr
            onClick={onClick}
            className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
        >
            <td className="px-6 py-4">
                <p className="font-mono text-xs text-teal-400 truncate max-w-36" title={inv.invoiceId}>
                    {inv.invoiceId}
                </p>
            </td>
            <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-zinc-400">
                {inv.senderInvoiceNo}
            </td>
            <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                ₮{Number(inv.amount).toLocaleString()}
            </td>
            <td className="px-6 py-4">
                {inv.order ? (
                    <div>
                        <p className="font-mono text-xs font-bold text-teal-500">{inv.order.orderNumber}</p>
                        <p className="text-xs text-slate-400">{inv.order.user?.name ?? ""}</p>
                    </div>
                ) : (
                    <span className="text-slate-400 dark:text-zinc-600 text-xs">—</span>
                )}
            </td>
            <td className="px-6 py-4">
                <InvoiceStatusBadge inv={inv} />
            </td>
            <td className="px-6 py-4 text-xs text-slate-400 dark:text-zinc-500">
                {inv.expiryDate ? new Date(inv.expiryDate).toLocaleString("mn-MN") : "—"}
            </td>
            <td className="px-6 py-4 text-xs text-slate-400 dark:text-zinc-500">
                {inv.createdAt ? new Date(inv.createdAt).toLocaleString("mn-MN") : "—"}
            </td>
            <td className="px-6 py-4">
                <span className="text-xs text-teal-500 font-medium hover:underline">Харах</span>
            </td>
        </tr>
    );
}
