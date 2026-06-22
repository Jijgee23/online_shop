import { prisma } from "@/lib/prisma";

// Server талд дэлгүүрийн нэрийг авах (имэйл, SMS, metadata зэрэгт).
// Тохиргоо байхгүй / хоосон бол ерөнхий "Дэлгүүр"-ийг буцаана.
export async function getStoreName(): Promise<string> {
    try {
        const s = await prisma.storeSettings.findUnique({ where: { id: 1 } });
        return s?.storeName?.trim() || "Дэлгүүр";
    } catch {
        return "Дэлгүүр";
    }
}
