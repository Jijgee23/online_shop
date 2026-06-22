import { Badge } from "@/ui/Badge";

type BadgeCls = "teal" | "red" | "amber";

const STATUS_MAP: Record<string, { color: BadgeCls; label: string }> = {
    confirmed: { color: "teal",  label: "Баталгаажсан" },
    expired:   { color: "red",   label: "Хугацаа дууссан" },
    pending:   { color: "amber", label: "Хүлээгдэж байна" },
};

export function getInvoiceStatus(inv: any): { cls: string; label: string } {
    if (inv.orderId) return { cls: "bg-teal-500/10 text-teal-400 border border-teal-500/20",   label: "Баталгаажсан" };
    const expired = inv.expiryDate && new Date(inv.expiryDate) < new Date();
    if (expired)    return { cls: "bg-red-500/10 text-red-400 border border-red-500/20",        label: "Хугацаа дууссан" };
    return                 { cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20", label: "Хүлээгдэж байна" };
}

export default function InvoiceStatusBadge({ inv }: { inv: any }) {
    const key = inv.orderId ? "confirmed" : (inv.expiryDate && new Date(inv.expiryDate) < new Date()) ? "expired" : "pending";
    const { color, label } = STATUS_MAP[key];
    return <Badge color={color}>{label}</Badge>;
}
