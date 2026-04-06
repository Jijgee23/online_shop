import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ACCESS_TOKEN_SECRET } from "../jwt/jwt_controller";
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

export async function PATCH(req: NextRequest) {
    const userId = await getAuthedUserId();
    if (!userId) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });

        // ── Password change ───────────────────────────────────────────────────
        if (newPassword !== undefined) {
            if (user.password) {
                if (!currentPassword) return NextResponse.json({ error: "Одоогийн нууц үгийг оруулна уу" }, { status: 400 });
                const valid = await bcrypt.compare(currentPassword, user.password);
                if (!valid) return NextResponse.json({ error: "Одоогийн нууц үг буруу байна" }, { status: 400 });
            }
            const hashed = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
            return NextResponse.json({ success: true });
        }

        // ── Profile update ────────────────────────────────────────────────────
        const data: any = {};
        if (name  !== undefined) data.name  = name;
        if (email !== undefined) {
            const taken = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
            if (taken) return NextResponse.json({ error: "Энэ и-мэйл хаяг аль хэдийн бүртгэлтэй байна" }, { status: 400 });
            data.email = email;
        }

        const updated = await prisma.user.update({ where: { id: userId }, data });
        return NextResponse.json({ user: updated });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}
