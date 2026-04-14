import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma";
import { sendPushToUsers } from "@/lib/firebase/sendPush";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { userIds, title, body } = await req.json();

    if (!title?.trim() || !body?.trim()) {
        return NextResponse.json({ error: "Гарчиг болон мессеж шаардлагатай" }, { status: 400 });
    }

    try {
        // Resolve target user IDs
        let targetIds: number[];

        if (userIds === "all") {
            const users = await prisma.user.findMany({
                where: { role: UserRole.CUSTOMER, deletedAt: null },
                select: { id: true },
            });
            targetIds = users.map((u) => u.id);
        } else if (Array.isArray(userIds) && userIds.length > 0) {
            targetIds = userIds.map(Number);
        } else {
            return NextResponse.json({ error: "Хэрэглэгч сонгоно уу" }, { status: 400 });
        }

        if (targetIds.length === 0) {
            return NextResponse.json({ error: "Хүлээн авах хэрэглэгч олдсонгүй" }, { status: 404 });
        }

        // Save notification records
        await prisma.notification.createMany({
            data: targetIds.map((userId) => ({
                userId,
                type: "PROMO",
                title: title.trim(),
                body: body.trim(),
            })),
        });

        // Send push
        await sendPushToUsers(targetIds, { title: title.trim(), body: body.trim() });

        return NextResponse.json({ success: true, sent: targetIds.length });
    } catch (e) {
        console.error("Send notification error:", e);
        return NextResponse.json({ error: "Мэдэгдэл илгээхэд алдаа гарлаа" }, { status: 500 });
    }
}
