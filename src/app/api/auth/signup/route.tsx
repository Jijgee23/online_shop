import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OtpType, UserRole } from "@/generated/prisma";
import bcrypt from "bcrypt";
import { validateOtp } from "../utils/utils";


export async function POST(req: Request) {
  try {
    const { name, email, phone, password, otpCode } = await req.json();

    if (!name || !email || !password || !otpCode) {
      return NextResponse.json(
        { error: 'Бүртгэлийн мэдээлэл дутуу байна!' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Имейл хаяг бүртгэлтэй байна!" },
        { status: 400 }
      );
    }

    const otpValidation = await validateOtp(email, otpCode, OtpType.SIGNUP);
    if (!otpValidation.success) {
      return NextResponse.json(
        { error: otpValidation.message },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: UserRole.CUSTOMER,
        cart: { create: {} },
      },
      include: { cart: true },
    });

    return NextResponse.json({
      message: "Бүртгэл амжилттай үүслээ",
      user: newUser,
    });
  } catch (error) {
    console.error("signup error:", error);
    return NextResponse.json(
      { error: "Бүртгэл үүсэхэд алдаа гарлаа!" },
      { status: 500 }
    );
  }
}