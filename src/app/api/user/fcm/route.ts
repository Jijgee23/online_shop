import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "../../auth/jwt/jwt_controller";

async function getUserId(): Promise<number | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return null;
    const decoded = verifyAccessToken(token);
    return decoded ? decoded.userId : null;
}

export async function POST(req: NextRequest) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: "Нэвтрэх шаардлагатай" }, { status: 401 });

    try {
        const { token } = await req.json();
        if(!token) console.log("Token алга байна");
        if (!token) return NextResponse.json({ message: "Token шаардлагатай" }, { status: 400 });

        const existing = await prisma.fCM.findFirst({ where: { userId, token } });
        if (existing) {
            await prisma.fCM.update({ where: { id: existing.id }, data: { deletedAt: null } });
        } else {
            await prisma.fCM.create({ data: { userId, token } });
        }

        return NextResponse.json({ message: "Бүртгэгдлээ" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: "Нэвтрэх шаардлагатай" }, { status: 401 });

    try {
        const { token } = await req.json();
        if (!token) return NextResponse.json({ message: "Token шаардлагатай" }, { status: 400 });

        const existing = await prisma.fCM.findFirst({ where: { userId, token } });
        if (existing) {
            await prisma.fCM.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
        }

        return NextResponse.json({ message: "Устгагдлаа" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
    }
}
