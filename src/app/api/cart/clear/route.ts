import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Clear } from "../controller";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Нэвтрээгүй байна" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;

        await Clear(decoded.userId);

        return NextResponse.json(
            { message: "Cart cleared" },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}