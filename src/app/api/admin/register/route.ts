import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { OtpType, UserRole } from "@/generated/prisma";
import { validateOtp } from "@/app/api/auth/utils/utils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password, speacialCode, otp } = body;

        if (!name || !email || !password || !speacialCode || !otp) {
            return NextResponse.json(
                { message: "Бүх талбарыг бөглөнө үү" },
                { status: 400 }
            );
        }

        // 1. OTP баталгаажуулах
        const otpResult = await validateOtp(email, otp, OtpType.SIGNUP);
        if (!otpResult.success) {
            return NextResponse.json(
                { message: otpResult.message },
                { status: 400 }
            );
        }

        // 2. Имэйл хаяг бүртгэлтэй эсэхийг шалгах
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { message: "Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна!" },
                { status: 400 }
            );
        }

        // 3. Тусгай код шалгах
        if (speacialCode !== process.env.ADMIN_SPECIAL_CODE) {
            return NextResponse.json(
                { message: "Системийн тусгай код буруу байна!" },
                { status: 400 }
            );
        }

        // 4. Нууц үгийг хаших
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Шинэ админ үүсгэх
        const newAdmin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.ADMIN,
                phone: `a${Date.now().toString().slice(-7)}`,
            },
        });

        const { password: _, ...adminData } = newAdmin;

        return NextResponse.json(
            { success: true, message: "Админ амжилттай бүртгэгдлээ", data: adminData },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Admin Registration Error:", error);
        return NextResponse.json(
            { message: "Сервер дээр алдаа гарлаа", error: error.message },
            { status: 500 }
        );
    }
}