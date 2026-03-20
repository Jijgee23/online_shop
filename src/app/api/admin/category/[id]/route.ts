import { CategoryState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest,
    { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const categoryId = Number(id);

    try {
        const category = await prisma.category.findUnique(
            {
                where: {
                    id: categoryId
                }
            }
        )
        if (!category) {
            return NextResponse.json(
                { error: 'Ангилал олдсонгүй!' },
                { status: 404 }
            )
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

        return NextResponse.json({
            message: "Амжилттай устгагдлаа",
            data: deletedCategory
        });

    } catch (e) {

        console.log(e)

        return NextResponse.json(
            { error: 'Алдаа гарлаа' },
            { status: 404 }
        )
    }
}