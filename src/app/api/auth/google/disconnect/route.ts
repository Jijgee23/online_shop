import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../../jwt/jwt_controller";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
        const user = await prisma.user.findUnique({ where: { id: Number(decoded.userId) } });

        if (!user) return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });

        // Prevent disconnect if user has no password (would be locked out)
        if (!user.password) {
            return NextResponse.json(
                { error: "Нууц үг тохируулаагүй тул Google холболтыг салгах боломжгүй. Эхлээд нууц үг тохируулна уу." },
                { status: 400 }
            );
        }

        await prisma.user.update({
            where: { id: user.id },
            data:  { googleId: null },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}
