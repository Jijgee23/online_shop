import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../auth/jwt/jwt_controller";



// 1. GET: Хэрэглэгчийн хүсэлтийн жагсаалтыг авах
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
        }

        const decoded = verifyAccessToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Хүчингүй токен" }, { status: 401 });
        }

        const wishlist = await prisma.wishlist.findMany({
            where: { userId: decoded.userId },
            include: {
                product: {
                    include: { images: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ data: wishlist }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
    }
}

// 2. POST: Жагсаалтад бараа нэмэх
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
        }

        const decoded = verifyAccessToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Хүчингүй токен" }, { status: 401 });
        }

        const { productId } = await req.json();

        if (!productId) {
            return NextResponse.json({ error: "Барааны ID шаардлагатай" }, { status: 400 });
        }

        // Бараа өмнө нь нэмэгдсэн эсэхийг шалгах эсвэл шууд Upsert хийх
        const wishlistItem = await prisma.wishlist.upsert({
            where: {
                userId_productId: {
                    userId: decoded.userId,
                    productId: Number(productId)
                }
            },
            update: {}, // Хэрэв байгаа бол юу ч өөрчлөхгүй
            create: {
                userId: decoded.userId,
                productId: Number(productId)
            }
        });

        return NextResponse.json({ data: wishlistItem, message: "Амжилттай нэмэгдлээ" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
    }
}

// 3. DELETE: Жагсаалтаас бараа хасах
export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
        }

        const decoded = verifyAccessToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Хүчингүй токен" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json({ error: "Барааны ID шаардлагатай" }, { status: 400 });
        }

        await prisma.wishlist.delete({
            where: {
                userId_productId: {
                    userId: decoded.userId,
                    productId: Number(productId)
                }
            }
        });

        return NextResponse.json({ message: "Амжилттай устгагдлаа" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
    }
}