import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SETTINGS_ID = 1;

export async function GET() {
    try {
        const settings = await prisma.storeSettings.upsert({
            where: { id: SETTINGS_ID },
            update: {},
            create: { id: SETTINGS_ID, storeName: "IShop", storeDesc: "", phone: "", email: "", address: "", onlyInStock: false, onlyPublished: true },
        });
        return NextResponse.json({ data: settings }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { storeName, storeDesc, phone, email, address, onlyInStock, onlyPublished,
                payQpay, payBankApp, payCard, payOnDelivery,
                showStatProducts, showStatOrders, showStatSatisfaction, showStatDelivery,
                fee, feeThreshold } = body;

        const data: any = {};
        if (storeName            !== undefined) data.storeName            = storeName;
        if (storeDesc            !== undefined) data.storeDesc            = storeDesc;
        if (phone                !== undefined) data.phone                = phone;
        if (email                !== undefined) data.email                = email;
        if (address              !== undefined) data.address              = address;
        if (onlyInStock          !== undefined) data.onlyInStock          = onlyInStock;
        if (onlyPublished        !== undefined) data.onlyPublished        = onlyPublished;
        if (payQpay              !== undefined) data.payQpay              = payQpay;
        if (payBankApp           !== undefined) data.payBankApp           = payBankApp;
        if (payCard              !== undefined) data.payCard              = payCard;
        if (payOnDelivery        !== undefined) data.payOnDelivery        = payOnDelivery;
        if (showStatProducts     !== undefined) data.showStatProducts     = showStatProducts;
        if (showStatOrders       !== undefined) data.showStatOrders       = showStatOrders;
        if (showStatSatisfaction !== undefined) data.showStatSatisfaction = showStatSatisfaction;
        if (showStatDelivery     !== undefined) data.showStatDelivery     = showStatDelivery;
        if (fee                  !== undefined) data.fee                  = fee;
        if (feeThreshold         !== undefined) data.feeThreshold         = feeThreshold;

        const settings = await prisma.storeSettings.upsert({
            where: { id: SETTINGS_ID },
            update: data,
            create: { id: SETTINGS_ID, storeName: "IShop", storeDesc: "", phone: "", email: "", address: "", onlyInStock: false, onlyPublished: true, ...data },
        });
        return NextResponse.json({ data: settings }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
