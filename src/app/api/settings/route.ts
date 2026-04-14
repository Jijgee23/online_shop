import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const s = await prisma.storeSettings.findUnique({ where: { id: 1 } });
        return NextResponse.json({
            storeName: s?.storeName ?? "IShop",
            storeDesc: s?.storeDesc ?? "",
            phone: s?.phone ?? "",
            email: s?.email ?? "",
            address: s?.address ?? "",
            showStatProducts: s?.showStatProducts ?? true,
            showStatOrders: s?.showStatOrders ?? true,
            showStatSatisfaction: s?.showStatSatisfaction ?? true,
            showStatDelivery: s?.showStatDelivery ?? true,
            payQpay: s?.payQpay ?? true,
            payOnDelivery: s?.payOnDelivery ?? false,
            deliveryFee: s?.fee ?? 0,
            deliveryFeeThreshold: s?.feeThreshold ?? 0,
            facebookUrl: s?.facebookUrl ?? "",
            instagramUrl: s?.instagramUrl ?? "",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}
