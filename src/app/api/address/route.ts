import { error } from "console";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_SECRET } from "../auth/jwt/jwt_controller";
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
        }

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
        const userID = Number(decoded.userId)

        const address = await prisma.address.findUnique({ where: { userId: userID }, include: { user: true, orders: true } })

        if (!address) return NextResponse.json({ message: 'Хэрэглэгчийн хаяг бүртгэгдээгүй!' })

        return NextResponse.json({ address: address }, { status: 200 })


    } catch (e) {
        return NextResponse.json(
            { error: e },
            { status: 500 })
    }
}