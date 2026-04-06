


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAccessToken } from "../auth/jwt/jwt_controller";

// 1. POST: Шинэ токен бүртгэх (эсвэл сэргээх)
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded) {
            return NextResponse.json({ error: "Хүчингүй токен" }, { status: 401 });
        }

        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token шаардлагатай" }, { status: 400 });
        }

        // Өмнө нь энэ токен бүртгэгдсэн эсэхийг шалгах
        const existingFCM = await prisma.fCM.findFirst({
            where: {
                token: token,
                userId: decoded.userId
            }
        });

        if (existingFCM) {
            // Хэрэв өмнө нь Soft Delete хийгдсэн (deletedAt != null) бол буцааж идэвхжүүлэх
            if (existingFCM.deletedAt) {
                await prisma.fCM.update({
                    where: { id: existingFCM.id },
                    data: { deletedAt: null }
                });
                return NextResponse.json({ message: "Токен дахин идэвхжлээ" }, { status: 200 });
            }
            return NextResponse.json({ message: "Токен аль хэдийн бүртгэгдсэн байна" }, { status: 200 });
        }

        // Шинээр токен үүсгэх
        const newFCM = await prisma.fCM.create({
            data: {
                token: token,
                userId: decoded.userId
            }
        });

        return NextResponse.json({ data: newFCM, message: "Амжилттай бүртгэгдлээ" }, { status: 201 });

    } catch (error) {
        console.error("FCM Registration Error:", error);
        return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
    }
}

// 2. DELETE (Soft Delete): Системээс гарах үед токеныг идэвхгүй болгох
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token шаардлагатай" }, { status: 400 });
        }

        // deletedAt дээр хугацаа тавьж Soft Delete хийнэ
        await prisma.fCM.updateMany({
            where: { token: token },
            data: { deletedAt: new Date() }
        });

        return NextResponse.json({ message: "Токен амжилттай идэвхгүй боллоо" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
    }
}