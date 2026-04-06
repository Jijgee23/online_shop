import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "../auth/jwt/jwt_controller";

async function getUserId(): Promise<number | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return null;
    const decoded = verifyAccessToken(token);
    return decoded ? decoded.userId : null;
}

// GET: list notifications for current user
export async function GET() {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: "Нэвтрэх шаардлагатай" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
}

// PATCH: mark one or all as read
export async function PATCH(req: NextRequest) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: "Нэвтрэх шаардлагатай" }, { status: 401 });

    try {
        const { id, all } = await req.json();
        const now = new Date();

        if (all) {
            await prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true, readAt: now },
            });
        } else if (id) {
            await prisma.notification.updateMany({
                where: { id: Number(id), userId },
                data: { isRead: true, readAt: now },
            });
        }

        return NextResponse.json({ message: "Шинэчлэгдлээ" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
    }
}

// DELETE: delete a notification
export async function DELETE(req: NextRequest) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: "Нэвтрэх шаардлагатай" }, { status: 401 });

    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ message: "id шаардлагатай" }, { status: 400 });

        await prisma.notification.deleteMany({ where: { id: Number(id), userId } });
        return NextResponse.json({ message: "Устгагдлаа" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
    }
}
