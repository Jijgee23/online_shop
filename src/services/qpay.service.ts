import { prisma } from "@/lib/prisma";

const QPAY_URL = process.env.QPAY_MERCHANT_URL ?? "https://merchant.qpay.mn/v2/";
const TOKEN_EXPIRY_BUFFER_MS = 30_000; // 30s buffer before expiry

type TokenResult = { accessToken: string; expiresAt: Date } | { error: string };
export interface PaymentCheckResponse {
    count: number;
    paid_amount: number;
    rows: {
        payment_id: string;
        payment_status: "PAID" | "PENDING" | "FAILED";
        paid_at: string;
    }[];
}

async function saveTokens(body: {
    access_token: string;
    refresh_token: string;
    expires_in: number;          // QPay returns Unix timestamp (seconds), not duration
    refresh_expires_in: number;  // same
}): Promise<{ accessToken: string; expiresAt: Date }> {
    const expiresAt = new Date(body.expires_in * 1000);
    await prisma.qPaySettings.update({
        where: { storeSettingsId: 1 },
        data: {
            accessToken: body.access_token,
            refreshToken: body.refresh_token,
            tokenExpiresAt: expiresAt,
            refreshTokenExpiresAt: new Date(body.refresh_expires_in * 1000),
        },
    });
    return { accessToken: body.access_token, expiresAt };
}

async function fetchNewToken(username: string, password: string): Promise<TokenResult> {
    console.log("fetching new token")
    const basic = Buffer.from(`${username}:${password}`).toString("base64");
    const res = await fetch(`${QPAY_URL}auth/token`, {
        method: "POST",
        headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/json" },
    });
    if (!res.ok) {
        return { error: "QPay токен авах явцад алдаа гарлаа. Тохиргоо болон холболтоо шалгана уу." };
    }
    return saveTokens(await res.json());

}

async function refreshToken(refreshTkn: string): Promise<TokenResult> {
    const res = await fetch(`${QPAY_URL}auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${refreshTkn}`, "Content-Type": "application/json" },
    });
    if (!res.ok) {
        return { error: "QPay токен шинэчлэх явцад алдаа гарлаа." };
    }
    return saveTokens(await res.json());
}

export const QPayService = {
    async getAccessToken(): Promise<TokenResult> {
        const qpaySettings = await prisma.qPaySettings.findUnique({
            where: { storeSettingsId: 1 },
        });

        if (!qpaySettings) {
            return { error: "QPay тохиргоо олдсонгүй. Та эхлээд QPay тохиргоог хадгалах хэрэгтэй." };
        }
        if (!qpaySettings.username || !qpaySettings.password || !qpaySettings.invoiceCode) {
            return { error: "QPay тохиргоо бүрэн биш байна. Username, Password болон Invoice Code оруулна уу." };
        }

        const now = Date.now();
        const accessValid =
            qpaySettings.accessToken &&
            qpaySettings.tokenExpiresAt &&
            qpaySettings.tokenExpiresAt.getTime() - now > TOKEN_EXPIRY_BUFFER_MS;

        if (accessValid) {
            return { accessToken: qpaySettings.accessToken!, expiresAt: qpaySettings.tokenExpiresAt! };
        }

        console.log()

        const refreshValid =
            qpaySettings.refreshToken &&
            qpaySettings.refreshTokenExpiresAt &&
            qpaySettings.refreshTokenExpiresAt.getTime() - now > TOKEN_EXPIRY_BUFFER_MS;

        if (refreshValid) {
            return refreshToken(qpaySettings.refreshToken!);
        }

        // Both tokens expired or missing — get a fresh token
        return fetchNewToken(qpaySettings.username, qpaySettings.password);
    },
    async checkPayment(invoiceId: any) {
        console.log("checking payment", invoiceId)

        if (!invoiceId) {
            return { error: "invoice_id шаардлагатай" };
        }
        const tokenResult = await QPayService.getAccessToken() as any;
        if (tokenResult.error) {
            return { error: tokenResult.error };
        }
        const res = await fetch(`${process.env.QPAY_MERCHANT_URL}payment/check`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokenResult.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                object_type: "INVOICE",
                object_id: invoiceId,
                offset: { page_number: 1, page_limit: 1 },
            }),
        });
        if (!res.ok) return { error: "Төлбөр шалгалт амжилтгүй" };
        const data = await res.json() as PaymentCheckResponse;
        console.log(data)
        const paid = data.rows?.some(r => r.payment_status === "PAID") ?? false;
        return { paid };
    }
};

export { saveTokens, QPAY_URL };
