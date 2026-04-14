import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../auth/jwt/jwt_controller";
import { OrderService, OrderError } from "@/services/order.service";

export async function POST(req: NextRequest) {
    const { cartId, addressId, paymentMethod, note, paymentConfirmed } = await req.json();

    try {
        const order = await OrderService.createOrder({ cartId, addressId, paymentMethod, note, paymentConfirmed });
        return NextResponse.json({ success: true, order }, { status: 200 });
    } catch (e) {
        if (e instanceof OrderError) {
            return NextResponse.json({ message: e.message, ...e.extra }, { status: e.status });
        }
        console.error("create order error:", e);
        return NextResponse.json({ message: "Захиалга үүсэхэд алдаа гарлаа" }, { status: 500 });
    }
}

export async function GET(_req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
    if (!decoded) return NextResponse.json({ message: "Нэвтрээгүй байна!" }, { status: 403 });

    try {
        const p = _req.nextUrl.searchParams;
        const page = Math.max(1, Number(p.get("page") || 1));
        const pageSize = Math.max(1, Number(p.get("pageSize") || 10));
        const userId = Number(decoded.userId);
        const { orders, total } = await OrderService.getOrders({ userId }, page, pageSize);
        return NextResponse.json({ orders, total, page, pageSize, success: true }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
    }
}
