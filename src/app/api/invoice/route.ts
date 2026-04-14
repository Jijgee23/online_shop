import { prisma } from "@/lib/prisma";
import { QPayService } from "@/services/qpay.service";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {

    const { amount, cartId, addressId } = await req.json();

    if (!amount || !cartId) {
        return NextResponse.json(
            { error: "Amount болон CartId шаардлагатай." },
            { status: 400 }
        );
    }

    try {
        const tokenResult = await QPayService.getAccessToken() as any;
        if (tokenResult.error) {
            return NextResponse.json({ error: tokenResult.error }, { status: 500 });
        }
        console.log(tokenResult?.accessToken)
        const qpaySettings = await prisma.qPaySettings.findUnique({
            where: { storeSettingsId: 1 },
        });

        if (qpaySettings?.invoiceCode == null) {
            return NextResponse.json({ error: "QPay тохиргоо бүрэн биш байна. Invoice Code оруулна уу." }, { status: 500 });
        }

        const senderInvoiceNo = `cart-${cartId}-${Date.now()}`;
        const callbackUrl = `${process.env.QPAY_CALL_BACK_URL}?cart_id=${cartId}&addressId=${addressId ?? ""}`;

        const headers = {
            Authorization: `Bearer ${tokenResult?.accessToken}`,
            "Content-Type": "application/json",
        };

        const body = JSON.stringify({
            invoice_code: qpaySettings.invoiceCode,
            sender_invoice_no: senderInvoiceNo,
            invoice_receiver_code: "terminal",
            invoice_description: `Cart #${cartId}`,
            amount: amount,
            callback_url: callbackUrl,
        });

        const res = await fetch(`${process.env.QPAY_MERCHANT_URL}invoice`, {
            method: "POST",
            headers,
            body,
        });

        const data = await res.json();

        console.log(data)

        if (!res.ok || !data.invoice_id) {
            return NextResponse.json({ error: data.error ?? "QPay invoice үүсгэхэд алдаа гарлаа" }, { status: res.status });
        }

        // Store invoice in DB so callback can look up cartId + addressId
        await prisma.invoice.create({
            data: {
                invoiceId: data.invoice_id,
                qrText: data.qr_text ?? null,
                qpayShortUrl: data.qpay_short_url ?? null,
                paymentUrls: data.urls ?? [],
                senderInvoiceNo,
                amount,
                cartId,
                addressId: addressId ?? null,
                expiryDate: new Date(Date.now() + 30 * 60 * 1000),
            },
        });
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Invoice create error:", error);
        return NextResponse.json(
            { error: "Failed to create invoice." },
            { status: 500 }
        );
    }
}
