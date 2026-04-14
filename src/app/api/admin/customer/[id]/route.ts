import { prisma } from "@/lib/prisma";
import { CustomerService } from "@/services/customer.service";
import { NextResponse, NextRequest } from "next/server";
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Promise болгож өөрчилсөн
) {
  try {
    // 1. Params-ийг заавал await хийж авна
    const { id } = await context.params
    console.log("Татаж буй хэрэглэгчийн ID:", id);
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json({ message: `Буруу ID формат: ${id}` }, { status: 400 });
    }

    const customer = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          orderBy: { createdAt: "desc" }
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ message: "Хэрэглэгч олдсонгүй" }, { status: 404 });
    }
    const totalSpent = customer.orders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
    const totalOrders = customer.orders.length;

    return NextResponse.json({
      ...customer,
      totalSpent,
      totalOrders,
    });

  } catch (error) {
    console.error("GET Customer Error:", error);
    return NextResponse.json({ message: "Сервер дээр алдаа гарлаа" }, { status: 500 });
  }
}

// 2. Хэрэглэгчийн төлөв эсвэл мэдээллийг шинэчлэх (PATCH)
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = Number(id);
    const body = await request.json();
    const { status, name, phone } = body;
    const updatedUser = await CustomerService.update(userId, { status, name, phone });
    if ("message" in updatedUser) {
      return NextResponse.json({ message: updatedUser.message }, { status: 404 });
    }
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ message: "Засахад алдаа гарлаа" }, { status: 500 });
  }
}

// 3. Хэрэглэгчийг устгах (DELETE)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deletion = await CustomerService.delete(Number(id))
    if ("message" in deletion) {
      return NextResponse.json({ message: deletion.message }, { status: 404 });
    }
    return NextResponse.json({ message: "Амжилттай устгагдлаа", data: deletion });
  } catch (error) {
    return NextResponse.json({ message: "Устгахад алдаа гарлаа" }, { status: 500 });
  }
}