import { CategoryState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { CategoryService } from "@/services/catogory.service";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const categoryId = Number(id);

    try {
        const body = await request.json();
        const { name, slug, parentId, state, image, featured } = body;

        const updated = await CategoryService.updateCategory(categoryId, {
            name, slug, parentId, state, image, featured,
        });

        if (!updated) {
            return NextResponse.json({ error: "Ангилал олдсонгүй!" }, { status: 404 });
        }

        return NextResponse.json({ message: "Амжилттай шинэчлэгдлээ", data: updated });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const deletion = await CategoryService.deleteCategory(Number(id));

        if ("error" in deletion) {
            return NextResponse.json({ error: deletion.error }, { status: 404 });
        }
        
        return NextResponse.json({ message: deletion.message, data: deletion.data });

    } catch (e) {

        return NextResponse.json(
            { error: 'Алдаа гарлаа' },
            { status: 404 }
        )
    }
}
