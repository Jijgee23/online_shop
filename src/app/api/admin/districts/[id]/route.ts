import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const districtId = Number(id);
        if (!districtId) return NextResponse.json({ error: "Буруу ID" }, { status: 400 });

        const { deliverable } = await req.json();
        if (typeof deliverable !== "boolean") {
            return NextResponse.json({ error: "Буруу утга" }, { status: 400 });
        }

        const updated = await prisma.district.update({
            where: { id: districtId },
            data: { deliverable },
        });

        return NextResponse.json({ data: updated }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: e }, { status: 500 });
    }
}
