import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { normalizeHours } from "@/lib/branchHours";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const b = await req.json();
        const data: Prisma.BranchUpdateInput = {};
        if (b.name      !== undefined) data.name      = b.name;
        if (b.phone     !== undefined) data.phone     = b.phone || null;
        if (b.city      !== undefined) data.city      = b.city;
        if (b.district  !== undefined) data.district  = b.district || null;
        if (b.khoroo    !== undefined) data.khoroo    = b.khoroo || null;
        if (b.address   !== undefined) data.address   = b.address || null;
        if (b.latitude  !== undefined) data.latitude  = b.latitude ?? null;
        if (b.longitude !== undefined) data.longitude = b.longitude ?? null;
        if (b.isActive  !== undefined) data.isActive  = b.isActive;
        if (b.hours     !== undefined) data.hours     = (normalizeHours(b.hours) as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull;

        const updated = await prisma.branch.update({ where: { id: Number(id) }, data });
        return NextResponse.json({ data: updated }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        await prisma.branch.delete({ where: { id: Number(id) } });
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
