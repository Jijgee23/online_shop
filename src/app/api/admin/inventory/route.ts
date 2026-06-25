import { NextRequest, NextResponse } from "next/server";
import { getInventory } from "@/services/inventory.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const p = req.nextUrl.searchParams;
        const search       = p.get("search") || undefined;
        const categoryId   = p.get("categoryId") ? Number(p.get("categoryId")) : undefined;
        const lowStockOnly = p.get("lowStockOnly") === "true";

        const data = await getInventory({ search, categoryId, lowStockOnly });
        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        console.error("Inventory report error:", e);
        return NextResponse.json({ error: "Үлдэгдлийн тайлан гаргахад алдаа гарлаа" }, { status: 500 });
    }
}
