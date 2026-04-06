import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../../auth/jwt/jwt_controller";

async function getUser(_req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return null;
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
    } catch {
        return null;
    }
}

export async function PATCH(req: NextRequest, context: any) {
    const decoded = await getUser(req);
    if (!decoded) return NextResponse.json({ message: "Нэвтрээгүй байна" }, { status: 401 });

    const { id } = await context.params;
    const { status } = await req.json();

    // Users can only cancel their own PENDING orders
    if (status !== "CANCELLED") {
        return NextResponse.json({ message: "Зөвшөөрөгдөөгүй үйлдэл" }, { status: 403 });
    }

    try {
        const order = await prisma.order.findUnique({ where: { id: Number(id) } });
        if (!order) return NextResponse.json({ message: "Захиалга олдсонгүй" }, { status: 404 });
        if (order.userId !== Number(decoded.userId)) {
            return NextResponse.json({ message: "Зөвшөөрөл байхгүй" }, { status: 403 });
        }
        if (order.status !== "PENDING") {
            return NextResponse.json({ message: "Зөвхөн хүлээгдэж буй захиалгыг цуцлах боломжтой" }, { status: 400 });
        }

        const updated = await prisma.order.update({
            where: { id: Number(id) },
            data: { status: "CANCELLED" },
        });

        return NextResponse.json({ order: updated }, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
    }
}
