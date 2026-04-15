export function getInvoiceStatus(inv: any): { cls: string; label: string } {
    if (inv.orderId) return { cls: "bg-teal-500/10 text-teal-400 border border-teal-500/20",   label: "Баталгаажсан" };
    const expired = inv.expiryDate && new Date(inv.expiryDate) < new Date();
    if (expired)    return { cls: "bg-red-500/10 text-red-400 border border-red-500/20",        label: "Хугацаа дууссан" };
    return                 { cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20", label: "Хүлээгдэж байна" };
}

export default function InvoiceStatusBadge({ inv }: { inv: any }) {
    const { cls, label } = getInvoiceStatus(inv);
    return (
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${cls}`}>
            {label}
        </span>
    );
}
