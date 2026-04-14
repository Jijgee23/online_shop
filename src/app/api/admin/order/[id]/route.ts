import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/firebase/sendPush";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await context.params;
        const order = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
                address: { include: { district: true } },
                payment: true,
                items: {
                    include: {
                        product: { include: { images: true } },
                    },
                },
            },
        });
        if (!order) return NextResponse.json({ message: "Захиалга олдсонгүй" }, { status: 404 });
        return NextResponse.json({ order }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const { status, note, paymentStatus } = body;

        const order = await prisma.order.findUnique({ where: { id: Number(id) }, include: { payment: true } });
        if (!order) return NextResponse.json({ message: "Захиалга олдсонгүй" }, { status: 404 });

        const data: any = {};
        if (status) data.status = status as OrderStatus;
        if (note !== undefined) data.note = note;

        const updated = await prisma.order.update({ where: { id: Number(id) }, data });

        if (paymentStatus !== undefined && order.payment) {
            await prisma.payment.update({
                where: { orderId: Number(id) },
                data: { status: paymentStatus },
            });
        }

        // Send notification to the order owner when status changes
        if (status && status !== order.status) {
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
            const title = `Захиалга ${STATUS_LABEL[status] ?? status}`;
            const body  = `${order.orderNumber} — ${STATUS_BODY[status] ?? "Захиалгын төлөв өөрчлөгдлөө."}`;

            await prisma.notification.create({
                data: {
                    userId: order.userId,
                    type: "ORDER",
                    title,
                    body,
                    data: { orderId: order.id, orderNumber: order.orderNumber, status },
                },
            });

            // Push to user's device(s)
            sendPushToUser(order.userId, {
                title,
                body,
                data: { orderId: String(order.id), orderNumber: order.orderNumber, link: "/order" },
            }).catch(console.error);
        }

        return NextResponse.json({ order: updated }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
    }
}
