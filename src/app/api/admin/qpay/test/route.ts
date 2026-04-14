import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { saveTokens, QPAY_URL } from "@/services/qpay.service";

export async function POST() {
    try {
        const qpay = await prisma.qPaySettings.findUnique({
            where: { storeSettingsId: 1 },
        });

        if (!qpay?.username || !qpay?.password) {
            return NextResponse.json(
                { error: "QPay тохиргоо хадгалагдаагүй байна. Username болон Password оруулна уу." },
                { status: 400 }
            );
        }

        const basic = Buffer.from(`${qpay.username}:${qpay.password}`).toString("base64");

        const res = await fetch(`${QPAY_URL}auth/token`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${basic}`,
                "Content-Type": "application/json",
            },
        });

        const body = await res.json().catch(() => ({}));

        if (res.ok && body.access_token) {
            await saveTokens(body);
            await prisma.qPaySettings.update({
                where: { storeSettingsId: 1 },
                data: { testedAt: new Date() },
            });
            return NextResponse.json({
                success: true,
                message: "QPay холболт амжилттай!",
                token_type: body.token_type,
                expires_in: body.expires_in,
            });
        }

        return NextResponse.json(
            { error: `QPay алдаа (${res.status}): ${body.message ?? body.error ?? res.statusText}` },
            { status: 400 }
        );
    } catch (e: any) {
        return NextResponse.json(
            { error: `Холболтын алдаа: ${e.message}` },
            { status: 500 }
        );
    }
}
