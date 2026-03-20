import { CategoryState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
    ) {
    const { id } = await context.params;

    const categoryId = Number(id);

    try {
        const category = await prisma.category.findUnique(
            { where: { id: categoryId } })

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


// export async function PATCH(request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }) {


//   const { id, name, slug, parentId, state } = await request.json();

//   console.log(id);

//   try {
//     if (!name || !slug) {
//       return NextResponse.json({ message: "Мэдээлэл дутуу байна" }, { status: 400 });
//     }



//     const category = await prisma.category.findUnique({ where: { id: id} });
//     if (!category) {
//       return NextResponse.json(
//         { error: 'Ангилал олдсонгүй!' },
//         { status: 404 }
//       )
//     }

//     const updatedCategory = await prisma.category.update({
//       where: {
//         id: category.id,
//       },
//       data: {
//         name: name ?? category.name,
//         slug: slug ?? category.slug,
//         state: state ?? category.state,
//         parentId: parentId
//       }
//     });

//     return NextResponse.json({
//       message: "Амжилттай шинэчлэгдлээ",
//       data: updatedCategory
//     });

//   } catch (e) {
//     return NextResponse.json(
//       { error: 'Алдаа гарлаа' },
//       { status: 404 }
//     )
//   }
// }