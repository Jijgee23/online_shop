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

export async function POST(req: NextRequest) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: "Нэвтрэх шаардлагатай" }, { status: 401 });

    try {
        const { productId, rating, comment } = await req.json();
        if (!productId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ message: "Дутуу мэдээлэл" }, { status: 400 });
        }

        const review = await prisma.review.upsert({
            where: { userId_productId: { userId, productId: Number(productId) } },
            create: { userId, productId: Number(productId), rating: Number(rating), comment: comment?.trim() || null },
            update: { rating: Number(rating), comment: comment?.trim() || null },
            include: { user: { select: { id: true, name: true } } },
        });

        return NextResponse.json(review);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: "Нэвтрэх шаардлагатай" }, { status: 401 });

    try {
        const { productId } = await req.json();
        if (!productId) return NextResponse.json({ message: "productId шаардлагатай" }, { status: 400 });

        const review = await prisma.review.findUnique({
            where: { userId_productId: { userId, productId: Number(productId) } },
        });
        if (!review) return NextResponse.json({ message: "Сэтгэгдэл олдсонгүй" }, { status: 404 });

        await prisma.review.delete({ where: { id: review.id } });
        return NextResponse.json({ message: "Устгагдлаа" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
    }
}
