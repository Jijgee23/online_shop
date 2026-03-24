import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from "../auth/jwt/jwt_controller";
export async function POST(req: NextRequest) {

    const { cartId, address, note } = await req.json()

    try {


        const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: true } } } })

        if (!cart) return NextResponse.json({ message: 'Сагсы мэдээлэл олдсонгүй!' }, { status: 404 });

        if (cart.items.length === 0 || cart.totalCount === 0 || cart.totalPrice === 0) {
            return NextResponse.json({ message: 'Сагс хоосон байна!' }, { status: 400 });
        }


        const stockUnavailableIds: number[] = [];

        for (const item of cart.items) {
            if (item.quantity > item.product.stock) {
                stockUnavailableIds.push(item.id);
            }
        }

        if (stockUnavailableIds.length > 0) {
            return NextResponse.json(
                {
                    message: 'Зарим бараа хүрэлцэхгүй байна!',
                    stockUnavailableIds
                },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {

            const user = await tx.user.findUnique({ where: { id: cart.userId }, include: { address: true } },)
            let addressId = 0;
            const createdAddress = user?.address

            if (createdAddress) {

                addressId = createdAddress.id

            } else {
                const addressData = {
                    ...address,
                    userId: cart.userId
                };

                const newAddress = await prisma.address.create({
                    data: addressData
                })

                addressId = newAddress.id
            }

            console.log(addressId)


            const data = {
                userId: cart.userId,
                totalPrice: cart.totalPrice,
                totalCount: cart.totalCount,
                note: note ?? '',
                addressId: addressId,
                orderNumber: `PENDING-${Date.now()}`,

            }
            const order = await tx.order.create({
                data: data,
            });
            const seqValue = (order as any).seq;
            if (!seqValue) {
                throw new Error("Sequence value олдохгүй байна. Schema дээр @default(autoincrement()) байгаа эсэхийг шалгана уу.");
            }


            const formattedId = `AAA${String(seqValue).padStart(6, '0')}`;
            await tx.order.update({
                where: { id: order.id },
                data: { orderNumber: formattedId },
            });


            // 2. order items create
            await tx.orderItem.createMany({
                data: cart.items.map(item => ({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price
                }))
            });

            // 3. stock update
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            // 4. clear cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            await tx.cart.update({
                where: { id: cart.id },
                data: {
                    totalCount: 0,
                    totalPrice: 0
                }
            });

            return order;
        });

        return NextResponse.json(
            { success: true, order: result },
            { status: 200 }
        );



    } catch (e) {


        console.log("creat order error" + e)
        return NextResponse.json(
            { message: 'Захиалга үүсэхэд алдаа гарлаа' },
            { status: 500 })
    }
}

export async function GET(req: NextRequest) {

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
        return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
    if (!decoded) return NextResponse.json({ message: "Нэвтрээгүй байна!" }, { status: 403 })
    try {

        const userId = Number(decoded.userId)
        const orders = await prisma.order.findMany({
            where: { userId: userId },
            include: { items: { include: { product: { include: { images: true } } }, }, address: true },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({
            orders: orders,
            success: true,
        }, { status: 200 })
    } catch (e) {
        return NextResponse.json(
            { message: 'Алдаа гарлаа', },
            { status: 500 });
    }
}