import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const STORE_ID = 1;

export async function GET() {
    try {
        const qpay = await prisma.qPaySettings.findUnique({
            where: { storeSettingsId: STORE_ID },
        });
        return NextResponse.json({ data: qpay });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { invoiceCode, username, password } = await req.json();

        const data: any = {};
        if (invoiceCode !== undefined) data.invoiceCode = invoiceCode;
        if (username    !== undefined) data.username    = username;
        if (password    !== undefined) data.password    = password;

        const qpay = await prisma.qPaySettings.upsert({
            where:  { storeSettingsId: STORE_ID },
            update: data,
            create: {
                storeSettingsId: STORE_ID,
                invoiceCode: invoiceCode ?? "",
                username:    username    ?? "",
                password:    password    ?? "",
            },
        });
        return NextResponse.json({ data: qpay });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
