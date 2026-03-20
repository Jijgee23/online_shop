import { CategoryState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      deletedAt: null,
      state: CategoryState.ACTIVE,
    },
    take: 20,
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name, slug, parentId, state } = await req.json();
  try {
    if (!name || !slug) {
      return NextResponse.json({ message: "Бүртгэлийн мэдээлэл дутуу байна" }, { status: 400 });
    }
    const reged = await prisma.category.findUnique({
      where: { slug }
    })

    if (reged) {
      return NextResponse.json({ message: "Бүртгэлтэй ангилал байна" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name,
        slug: slug,
        parentId: parentId ? Number(parentId) : null,
        state: state || "ACTIVE",
      }
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
  }
}


export async function PATCH(request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) {


  const { id, name, slug, parentId, state } = await request.json();

  console.log(id);

  try {
    if (!name || !slug) {
      return NextResponse.json({ message: "Мэдээлэл дутуу байна" }, { status: 400 });
    }



    const category = await prisma.category.findUnique({ where: { id: id} });
    if (!category) {
      return NextResponse.json(
        { error: 'Ангилал олдсонгүй!' },
        { status: 404 }
      )
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        name: name ?? category.name,
        slug: slug ?? category.slug,
        state: state ?? category.state,
        parentId: parentId
      }
    });

    return NextResponse.json({
      message: "Амжилттай шинэчлэгдлээ",
      data: updatedCategory
    });

  } catch (e) {
    return NextResponse.json(
      { error: 'Алдаа гарлаа' },
      { status: 404 }
    )
  }
}