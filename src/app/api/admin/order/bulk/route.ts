import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/firebase/sendPush";

const STATUS_LABEL: Record<string, string> = {
    PENDING:   "Хүлээгдэж байна",
    PAID:      "Төлбөр баталгаажлаа",
    SHIPPED:   "Хүргэлтэнд гарлаа",
    DELIVERED: "Хүргэгдлээ",
    CANCELLED: "Цуцлагдлаа",
};

const STATUS_BODY: Record<string, string> = {
    PENDING:   "Таны захиалга хүлээн авлаа.",
    PAID:      "Таны захиалгын төлбөр амжилттай баталгаажлаа.",
    SHIPPED:   "Таны захиалга хүргэлтэнд гарсан байна.",
    DELIVERED: "Таны захиалга амжилттай хүргэгдлээ. Баярлалаа!",
    CANCELLED: "Таны захиалга цуцлагдлаа. Дэлгэрэнгүй мэдээлэл авахыг хүсвэл холбогдоно уу.",
};

// PATCH /api/admin/order/bulk
// body: { ids: number[], status: OrderStatus }
export async function PATCH(req: NextRequest) {
    try {
        const { ids, status } = await req.json();

        if (!Array.isArray(ids) || ids.length === 0)
            return NextResponse.json({ error: "Захиалгын жагсаалт хоосон байна" }, { status: 400 });
        if (!status || !Object.values(OrderStatus).includes(status))
            return NextResponse.json({ error: "Буруу төлөв" }, { status: 400 });

        // Fetch affected orders to build per-user notifications
        const orders = await prisma.order.findMany({
            where: { id: { in: ids } },
            select: { id: true, userId: true, orderNumber: true, status: true },
        });

        // Only notify orders whose status actually changes
        const changing = orders.filter(o => o.status !== status);

        await prisma.order.updateMany({
            where: { id: { in: ids } },
            data: { status: status as OrderStatus },
        });

        if (changing.length > 0) {
            await prisma.notification.createMany({
                data: changing.map(o => ({
                    userId:  o.userId,
                    type:    "ORDER",
                    title:   `Захиалга ${STATUS_LABEL[status] ?? status}`,
                    body:    `${o.orderNumber} — ${STATUS_BODY[status] ?? "Захиалгын төлөв өөрчлөгдлөө."}`,
                    data:    { orderId: o.id, orderNumber: o.orderNumber, status },
                })),
            });

            // Push notifications — best effort, non-blocking
            changing.forEach(o =>
                sendPushToUser(o.userId, {
                    title: `Захиалга ${STATUS_LABEL[status] ?? status}`,
                    body:  `${o.orderNumber} — ${STATUS_BODY[status] ?? "Захиалгын төлөв өөрчлөгдлөө."}`,
                    data:  { orderId: String(o.id), orderNumber: o.orderNumber, link: "/order" },
                }).catch(console.error)
            );
        }

        return NextResponse.json({
            message: `${ids.length} захиалгын төлөв шинэчлэгдлээ`,
            count: ids.length,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}
