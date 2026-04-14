import { NextRequest, NextResponse } from "next/server";
import { Clear } from "../controller";

export async function POST(req: NextRequest) {
    try {
        const { cartId } = await req.json();

        if (!cartId) {
            return NextResponse.json({ error: "cartId шаардлагатай" }, { status: 400 });
        }

        await Clear(Number(cartId));

        return NextResponse.json({ message: "Cart cleared" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
