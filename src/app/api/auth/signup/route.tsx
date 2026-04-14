import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ActivityAction, OtpType, UserRole } from "@/generated/prisma";
import bcrypt from "bcrypt";
import { logActivity, validateOtp } from "../utils/utils";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, otpCode, otpVia } = await req.json();

    if (!name || !email || !phone || !password || !otpCode) {
      return NextResponse.json(
        { error: "Бүртгэлийн мэдээлэл дутуу байна!" },
        { status: 400 }
      );
    }

    const via: "email" | "phone" = otpVia === "phone" ? "phone" : "email";
    const identifier = via === "phone" ? phone : email;

    const otpValidation = await validateOtp(identifier, otpCode, OtpType.SIGNUP, via);
    if (!otpValidation.success) {
      return NextResponse.json({ error: otpValidation.message }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.email === email ? "Имейл хаяг бүртгэлтэй байна!" : "Утасны дугаар бүртгэлтэй байна!" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: UserRole.CUSTOMER,
        cart: { create: {} },
      },
      include: { cart: true },
    });

    const ip        = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
                   ?? req.headers.get("x-real-ip")
                   ?? undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;
    await logActivity(newUser.id, ActivityAction.SIGNUP, { ip, userAgent });

    return NextResponse.json({ message: "Бүртгэл амжилттай үүслээ", user: newUser });
  } catch (error) {
    console.error("signup error:", error);
    return NextResponse.json({ error: "Бүртгэл үүсэхэд алдаа гарлаа!" }, { status: 500 });
  }
}
