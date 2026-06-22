import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Нийтийн талд харагдах идэвхтэй салбарууд
export async function GET() {
    try {
        const branches = await prisma.branch.findMany({
            where: { deletedAt: null, isActive: true },
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json({ data: branches }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
