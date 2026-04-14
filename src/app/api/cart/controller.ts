import { prisma } from "@/lib/prisma";


export async function Clear(cartId: number) {
    await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { cartId } }),
        prisma.cart.update({
            where: { id: cartId },
            data: { totalCount: 0, totalPrice: 0 }
        })
    ]);
}

export async function recalculateCart(cartId: number) {
    const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!cart) return null;

    const totalQty = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const totalPrice = cart.items.reduce((sum, item) => {
        return sum + item.quantity * Number(item.product?.price || 0);
    }, 0);

    return await prisma.cart.update({
        where: { id: cart.id },
        data: {
            totalCount: totalQty,
            totalPrice: totalPrice,
        }
    });
}
