import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../jwt/jwt_controller";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }, include: { cart: true }
    })

    // console.log("me", user)
    return NextResponse.json({
      user: user
    });

  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}