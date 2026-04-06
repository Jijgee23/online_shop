import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const all = req.nextUrl.searchParams.get("all") === "true";
        const districts = await prisma.district.findMany({
            where: all ? undefined : { deliverable: true },
            orderBy: { name: "asc" },
        });
        return NextResponse.json({ data: districts }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: e }, { status: 500 });
    }
}
