import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_SECRET } from "../auth/jwt/jwt_controller";
import jwt from "jsonwebtoken";
import { recalculateCart } from "./controller";

const CART_INCLUDE = {
    items: {
        include: {
            product: { include: { images: { include: { links: { include: { attributeValue: { select: { attributeId: true } } } } } } } },
            productStock: { include: { color: true, size: true } },
            productVariant: { include: { values: { include: { attributeValue: { include: { attribute: true } } } } } },
        },
        orderBy: { createdAt: "asc" as const },
    },
};

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) return NextResponse.json({ error: "Нэвтрэх шаардлагатай!" }, { status: 401 });

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
        const userID = Number(decoded.userId);

        let c = await prisma.cart.findUnique({ where: { userId: userID } });
        if (!c) c = await prisma.cart.create({ data: { userId: userID } });

        await recalculateCart(c.id);

        const result = await prisma.cart.findUnique({ where: { id: c.id }, include: CART_INCLUDE });
        return NextResponse.json({ data: result }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();
        const userCart = await prisma.cart.create({
            data: { userId: userId },
        });

        if (userCart) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        return NextResponse.json(
            { message: "Сагсны мэдээлэ олдсонгүй" },
            { status: 404 }
        );
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 404 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();

        const { productId, productQty, cartId, productStockId, productVariantId } = body;

        const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } });

        if (!cart) return NextResponse.json({ error: "Сагс олдсонгүй" }, { status: 400 });

        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product) return NextResponse.json({ error: "Бараа олдсонгүй" }, { status: 400 });

        // Сонгосон хувилбар: шинэ ProductVariant эсвэл хуучин ProductStock-оор үлдэгдэл шалгана
        const stockId:   string | null = productStockId ?? null;
        const variantId: string | null = productVariantId ?? null;

        // Хувилбартай бараа — заавал хувилбар сонгосон байх ёстой
        if (!variantId) {
            const variantCount = await prisma.productVariant.count({ where: { productId } });
            if (variantCount > 0) {
                return NextResponse.json({ error: "Хувилбараа сонгоно уу" }, { status: 400 });
            }
        }

        let availableStock = product.stock;
        if (variantId) {
            const pv = await prisma.productVariant.findUnique({ where: { id: variantId } });
            if (!pv || pv.productId !== productId) {
                return NextResponse.json({ error: "Сонгосон хувилбар олдсонгүй" }, { status: 400 });
            }
            availableStock = pv.stock;
        } else if (stockId) {
            const ps = await prisma.productStock.findUnique({ where: { id: stockId } });
            if (!ps || ps.productId !== productId) {
                return NextResponse.json({ error: "Сонгосон хослол олдсонгүй" }, { status: 400 });
            }
            availableStock = ps.stock;
        }

        // Ижил бараа + ижил хувилбар(variant/stock)-ыг л нэг мөр болгож нэгтгэнэ
        const existingItem = cart.items.find(e =>
            e.productId === productId && e.productStockId === stockId && e.productVariantId === variantId);

        if (existingItem) {
            const newQty = existingItem.quantity + (productQty ?? 1);
            if (newQty > availableStock) {
                return NextResponse.json({ error: "Барааны үлдэгдэл хүрэлцэхгүй байна!" }, { status: 400 });
            }
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQty },
            });
            await recalculateCart(cart.id);
            return NextResponse.json({ success: true, message: product.name + " тоо шинэчлэгдлээ" }, { status: 200 });
        }

        if (availableStock < (productQty ?? 1)) {
            return NextResponse.json({ error: "Барааны үлдэгдэл хүрэлцэхгүй байна!" }, { status: 400 });
        }

        const newItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: productId,
                productStockId: stockId,
                productVariantId: variantId,
                quantity: productQty ?? 1,
            }
        });

        if (!newItem) {
            return NextResponse.json({ error: "Амжилтгүй" }, { status: 400 });
        }

        await recalculateCart(cart.id);

        return NextResponse.json({ success: true, message: product.name + " сагсанд нэмэгдлээ" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get("itemId");

        if (!itemId) {
            return NextResponse.json({ error: "Устгах барааны ID байхгүй байна" }, { status: 400 });
        }

        const itemToDelete = await prisma.cartItem.findUnique({
            where: { id: Number(itemId) }
        });

        if (!itemToDelete) {
            return NextResponse.json({ error: "Бараа олдсонгүй" }, { status: 404 });
        }

        const cartId = itemToDelete.cartId;

        await prisma.cartItem.delete({ where: { id: Number(itemId) } });

        const remainingItems = await prisma.cartItem.findMany({
            where: { cartId },
            include: { product: true, productStock: true, productVariant: true }
        });

        const newTotalCount = remainingItems.reduce((sum, item) => sum + item.quantity, 0);
        const newTotalPrice = remainingItems.reduce((sum, item) => {
            const unit = item.productVariant?.price != null
                ? Number(item.productVariant.price)
                : item.productStock?.price != null
                    ? Number(item.productStock.price)
                    : Number(item.product?.price || 0);
            return sum + (item.quantity * unit);
        }, 0);

        await prisma.cart.update({
            where: { id: cartId },
            data: { totalCount: newTotalCount, totalPrice: newTotalPrice }
        });

        return NextResponse.json({ success: true, message: "Барааг сагснаас хаслаа" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Устгахад алдаа гарлаа" }, { status: 500 });
    }
}
