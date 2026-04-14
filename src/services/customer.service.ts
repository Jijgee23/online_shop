import { prisma } from "@/lib/prisma"


export const CustomerService = {
    async getCustomers(page: number, pageSize: number, search: string, status: string, where: any) {
        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    status: true,
                    role: true,
                    createdAt: true,
                    orders: {
                        select: { totalPrice: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.user.count({ where }),
        ]);
        const customers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            status: user.status,
            role: user.role,
            createdAt: user.createdAt,
            totalOrders: user.orders.length,
            totalSpent: user.orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0),
        }));
        return { customers, total };
    },
    async update(id: number, data: { status?: string, name?: string, phone?: string }) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return { message: "Хэрэглэгч олдсонгүй" };
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: data as any,
        });
        return updatedUser;
    },
    async delete(id: number) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return { message: "Хэрэглэгч олдсонгүй" };
        const deletedAt = new Date();
        const deletetion = await prisma.user.update({
            where: { id },
            data: { deletedAt },
        });
        return deletetion;
    }
}