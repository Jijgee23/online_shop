import { CategoryState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";



export const CategoryService = {
    async fetchCategories() {
        const filters: any = {
            orderBy: { createdAt: 'desc' },
            where: {
                deletedAt: null,
                state: CategoryState.ACTIVE,
                parent: null
            },
            include: {
                _count: { select: { products: true } },
                children: { where: { deletedAt: null, state: CategoryState.ACTIVE } }
            },
        }
        const categories = await prisma.category.findMany(
            filters
        );
        return categories;
    },
    async updateCategory(id: number, data: {
        name?: string;
        slug?: string;
        parentId?: number | null;
        state?: CategoryState;
        image?: string | null;
        featured?: boolean;
    }) {
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) return null;

        const updated = await prisma.category.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.slug !== undefined && { slug: data.slug }),
                ...(data.parentId !== undefined && { parentId: data.parentId }),
                ...(data.state !== undefined && { state: data.state }),
                ...(data.image !== undefined && { image: data.image }),
                ...(data.featured !== undefined && { featured: data.featured }),
            },
            include: {
                _count: { select: { products: true } },
                children: { where: { deletedAt: null } },
            },
        });
        return updated;
    },
    async deleteCategory(categoryId: number) {
        const category = await prisma.category.findUnique(
            { where: { id: categoryId } })

        if (!category) {
            return { error: 'Ангилал олдсонгүй!'};
        }

        const deletedCategory = await prisma.category.update({
            where: {
                id: category.id,
            },
            data: {
                deletedAt: new Date(),
                state: CategoryState.INACTIVE,
            }
        });

        return { message: "Амжилттай устгагдлаа", data: deletedCategory };
    }
}
