import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SETTINGS_ID = 1;

export async function GET() {
    try {
        const settings = await prisma.storeSettings.upsert({
            where: { id: SETTINGS_ID },
            update: {},
            create: { id: SETTINGS_ID, storeName: "Дэлгүүр", storeDesc: "", phone: "", email: "", address: "", onlyInStock: false, onlyPublished: true },
        });
        return NextResponse.json({ data: settings }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { storeName, logo, banners, storeDesc, phone, email, address, onlyInStock, onlyPublished,
                payQpay, payOnDelivery, showBranches, showStock, maxOrderValue,
                showStatProducts, showStatOrders, showStatSatisfaction, showStatDelivery,
                fee, feeThreshold, facebookUrl, instagramUrl } = body;

        const data: any = {};
        if (storeName            !== undefined) data.storeName            = storeName;
        if (logo                 !== undefined) data.logo                 = logo;
        if (Array.isArray(banners))            data.banners              = banners.filter((b: unknown) => typeof b === "string" && b).slice(0, 5);
        if (storeDesc            !== undefined) data.storeDesc            = storeDesc;
        if (phone                !== undefined) data.phone                = phone;
        if (email                !== undefined) data.email                = email;
        if (address              !== undefined) data.address              = address;
        if (onlyInStock          !== undefined) data.onlyInStock          = onlyInStock;
        if (onlyPublished        !== undefined) data.onlyPublished        = onlyPublished;
        if (payQpay              !== undefined) data.payQpay              = payQpay;
        if (payOnDelivery        !== undefined) data.payOnDelivery        = payOnDelivery;
        if (showBranches         !== undefined) data.showBranches         = showBranches;
        if (showStock            !== undefined) data.showStock            = showStock;
        if (maxOrderValue        !== undefined) data.maxOrderValue        = maxOrderValue;
        if (showStatProducts     !== undefined) data.showStatProducts     = showStatProducts;
        if (showStatOrders       !== undefined) data.showStatOrders       = showStatOrders;
        if (showStatSatisfaction !== undefined) data.showStatSatisfaction = showStatSatisfaction;
        if (showStatDelivery     !== undefined) data.showStatDelivery     = showStatDelivery;
        if (fee                  !== undefined) data.fee                  = fee;
        if (feeThreshold         !== undefined) data.feeThreshold         = feeThreshold;
        if (facebookUrl          !== undefined) data.facebookUrl          = facebookUrl;
        if (instagramUrl         !== undefined) data.instagramUrl         = instagramUrl;

        const settings = await prisma.storeSettings.upsert({
            where: { id: SETTINGS_ID },
            update: data,
            create: { id: SETTINGS_ID, storeName: "Дэлгүүр", storeDesc: "", phone: "", email: "", address: "", onlyInStock: false, onlyPublished: true, ...data },
        });
        return NextResponse.json({ data: settings }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
