import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_SECRET } from "../auth/jwt/jwt_controller";
import jwt from "jsonwebtoken";
import { recalculateCart } from "./controller";
import { Cart } from "@prisma/client";

export async function GET(req: NextRequest) {

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
        }

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;

        const c = await prisma.cart.findUnique({
            where: { userId: decoded.userId },
            include: { items: true, _count: true }
        })

        if (c) {

            const updatedCart = await recalculateCart(decoded.userId) as Cart;

            const result = await prisma.cart.findUnique({
                where: { id: updatedCart.id, userId: updatedCart.userId },
                include: {
                    items: {
                        include: { product: { include: { images: true } } },
                        orderBy: { createdAt: 'asc'}
                    },
                }
            })

            return NextResponse.json(

                { data: result },
                { status: 200 });
        }

    } catch (error) {
        return NextResponse.json(
            { error: error },
            { status: 404 })
    }
}

export async function POST(req: NextRequest) {

    try {

        const { userId } = await req.json();
        const userCart = await prisma.cart.create({
            data: { userId: userId },
        })

        if (userCart) {
            return NextResponse.json(
                { success: true },
                { status: 200 });
        }

    } catch (error) {
        return NextResponse.json(
            { error: error },
            { status: 404 })
    }
}

export async function PATCH(req: NextRequest) {

    try {
        const body = await req.json()

        console.log(body)

        const { productId, productQty, cartId } = body;

        const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } })

        if (!cart) return NextResponse.json({ error: "Сагс олдсонгүй" }, { status: 400 })

        const product = await prisma.product.findUnique({ where: { id: cartId } })

        if (!product) return NextResponse.json({ error: "Бараа олдсонгүй" }, { status: 400 })

        const alreadyInCart = cart.items.map((e) => e.productId).includes(productId);

        if (alreadyInCart) {
            return NextResponse.json({ error: "Бараа хэдийн сагслагдсан байна!" }, { status: 401 })
        }

        if (product.stock < productQty) {
            return NextResponse.json({ error: "Барааны үлдэгдэл хүрэлцэхгүй байна!" }, { status: 401 })
        }

        const newItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: productId,
                quantity: productQty ?? 1,
            }
        });

        if (!newItem) {
            return NextResponse.json({ error: "Амжилтгүй" }, { status: 401 })
        }

        return NextResponse.json({ success: true, message: product.name + "ийг сагсаллаа" }, { status: 200 })

    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: error },
            { status: 404 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get("itemId");

        if (!itemId) {
            return NextResponse.json({ error: "Устгах барааны ID байхгүй байна" }, { status: 400 });
        }

        // 1. Барааг устгах (Устгахаас өмнө cartId-г нь авч үлдэх хэрэгтэй)
        const itemToDelete = await prisma.cartItem.findUnique({
            where: { id: Number(itemId) }
        });

        if (!itemToDelete) {
            return NextResponse.json({ error: "Бараа олдсонгүй" }, { status: 404 });
        }

        const cartId = itemToDelete.cartId;

        await prisma.cartItem.delete({
            where: { id: Number(itemId) }
        });

        // 2. Сагсны нийт дүн болон тоог дахин тооцоолох
        const remainingItems = await prisma.cartItem.findMany({
            where: { cartId: cartId },
            include: { product: true }
        });

        const newTotalCount = remainingItems.reduce((sum, item) => sum + item.quantity, 0);
        const newTotalPrice = remainingItems.reduce((sum, item) => {
            return sum + (item.quantity * (item.product?.price || 0));
        }, 0);

        // 3. Сагсны (Cart) мэдээллийг шинэчлэх
        await prisma.cart.update({
            where: { id: cartId },
            data: {
                totalCount: newTotalCount,
                totalPrice: newTotalPrice
            }
        });

        return NextResponse.json({
            success: true,
            message: "Барааг сагснаас хаслаа"
        }, { status: 200 });

    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: "Устгахад алдаа гарлаа" }, { status: 500 });
    }
}