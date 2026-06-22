import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const STORE_ID = 1;

export async function GET() {
    try {
        const macs = await prisma.macsSettings.findUnique({
            where: { storeSettingsId: STORE_ID },
        });
        return NextResponse.json({ data: macs });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { username, password, accessToken, refreshToken } = await req.json();

        const data: any = {};
        if (username     !== undefined) data.username     = username;
        if (password     !== undefined) data.password     = password;
        if (accessToken  !== undefined) data.accessToken  = accessToken;
        if (refreshToken !== undefined) data.refreshToken = refreshToken;

        const macs = await prisma.macsSettings.upsert({
            where:  { storeSettingsId: STORE_ID },
            update: data,
            create: {
                storeSettingsId: STORE_ID,
                username:     username     ?? "",
                password:     password     ?? "",
                accessToken:  accessToken  ?? null,
                refreshToken: refreshToken ?? null,
            },
        });
        return NextResponse.json({ data: macs });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
