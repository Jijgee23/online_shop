import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/generated/prisma";
import bcrypt from "bcrypt";

enum Role {
  CUSTOMER,
  ADMIN
}

export async function POST(req: Request) {

  const { name, email, password, } = await req.json()

  try {
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Бүртгэлийн мэдээлэл дутуу байна!' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      return NextResponse.json(
        { error: "Имейл хаяг бүртгэлтэй байна!" },
        { status: 404 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: UserRole.CUSTOMER,
        cart: {
        }
      }
    });

    if (newUser) {
      await prisma.cart.create({
        data: { userId: newUser.id },
      })
    }

    if (newUser) console.log(newUser)

    return NextResponse.json({
      message: "Бүртгэл амжилттай үүслээ",
      user: newUser,
    })
  } catch (error) {
    NextResponse.json({
      error: "Бүртгэл үүсэхэд алдаа гарлаа!"
    }, { status: 404 })
  }
}