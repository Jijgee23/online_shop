import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Promise болгож өөрчилсөн
) {
  try {
    // 1. Params-ийг заавал await хийж авна
    const { id } = await params; 
    
    console.log("Татаж буй хэрэглэгчийн ID:", id);

    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json({ message: `Буруу ID формат: ${id}` }, { status: 400 });
    }

    const customer = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ message: "Хэрэглэгч олдсонгүй" }, { status: 404 });
    }

    // Нийт статистик тооцоолох
    // Хэрэв таны Order модел дээр үнийн дүн нь 'totalAmount' биш 'total' бол үүнийг тааруулна уу
    const totalSpent = customer.orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
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
  { params }: { params: { id: string } }
) {
  try {
    const userId = Number(params.id);
    const body = await request.json();
    const { status, name, phone } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: status, // Жишээ нь: ACTIVE, BLOCKED, NEW
        name: name,
        // phone: phone,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PATCH Customer Error:", error);
    return NextResponse.json({ message: "Засахад алдаа гарлаа" }, { status: 500 });
  }
}

// 3. Хэрэглэгчийг устгах (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = Number(params.id);
    
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Амжилттай устгагдлаа" });
  } catch (error) {
    return NextResponse.json({ message: "Устгахад алдаа гарлаа" }, { status: 500 });
  }
}