import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { normalizeHours } from "@/lib/branchHours";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const branches = await prisma.branch.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json({ data: branches }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const b = await req.json();
        if (!b?.name?.trim()) return NextResponse.json({ error: "Салбарын нэр шаардлагатай" }, { status: 400 });
        const created = await prisma.branch.create({
            data: {
                name: b.name.trim(),
                phone: b.phone || null,
                city: b.city || "Улаанбаатар",
                district: b.district || null,
                khoroo: b.khoroo || null,
                address: b.address || null,
                latitude: b.latitude ?? null,
                longitude: b.longitude ?? null,
                isActive: b.isActive ?? true,
                hours: (normalizeHours(b.hours) ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
            },
        });
        return NextResponse.json({ data: created }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
