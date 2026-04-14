import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "@/app/api/auth/jwt/jwt_controller";
import { NextRequest, NextResponse } from "next/server";

async function getAuthedUserId(): Promise<number | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
        return Number(decoded.userId);
    } catch {
        return null;
    }
}

export async function GET() {
    const userId = await getAuthedUserId();
    if (!userId) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

    const devices = await prisma.device.findMany({
        where: { userId },
        include: { fcms: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { lastSeenAt: "desc" },
    });

    return NextResponse.json({ devices });
}

export async function DELETE(req: NextRequest) {
    const userId = await getAuthedUserId();
    if (!userId) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

    const { id } = await req.json();
    const device = await prisma.device.findFirst({ where: { id: Number(id), userId } });
    if (!device) return NextResponse.json({ error: "Төхөөрөмж олдсонгүй" }, { status: 404 });

    await prisma.device.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
}
