import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { recalculateCart } from "../controller";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_SECRET } from "../../auth/jwt/jwt_controller";
import jwt from "jsonwebtoken";

export async function PATCH(req: NextRequest) {
    try {
        const { cartId, itemId, newQty } = await req.json();

        if (!cartId || !itemId || !newQty) return NextResponse.json(
            { error: 'cartId , itemId, newQty шаардлагатай!' },
            { status: 404 });

        const cart = await prisma.cart.findUnique({ where: { id: cartId } });

        if (!cart) NextResponse.json({ error: 'Сагсаны мэдээлэл олдсонгүй!' }, { status: 404 });

        const cartItem = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { product: true } });

        if (!cartItem) NextResponse.json({ error: 'Барааны мэдээлэл олдсонгүй!' }, { status: 404 });

        const product = cartItem?.product;

        if (!product) return NextResponse.json({ error: 'Барааны мэдээлэл олдсонгүй!' }, { status: 404 })

        if (product?.stock < Number(newQty)) return NextResponse.json({ error: 'Барааны үлдэгдэл хүрэлцэхгүй байна!' }, { status: 404 })

        const newCartItem = await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: newQty } })
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
        }

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
        await recalculateCart(decoded.userId)

        return NextResponse.json({ success: true, item: newCartItem }, { status: 200 })

    } catch (e) {
        return NextResponse.json({ error: 'Амжилтгүй' }, { status: 500 })
    }
}