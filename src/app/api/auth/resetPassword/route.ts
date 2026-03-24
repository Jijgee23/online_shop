import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OtpType } from "@/generated/prisma";
import bcrypt from "bcrypt";
import { validateOtp } from "../utils/utils";

export async function POST(req: Request) {
    try {
        const { email, otpCode, newPassword } = await req.json();

        if (!email || !otpCode || !newPassword) {
            return NextResponse.json({ error: "Мэдээлэл дутуу байна" }, { status: 400 });
        }

        // 1. OTP баталгаажуулах
        const otpValidation = await validateOtp(email, otpCode, OtpType.FORGOT_PASSWORD);
        if (!otpValidation.success) {
            return NextResponse.json({ error: otpValidation.message }, { status: 400 });
        }

        // 2. Хэрэглэгчийг олох
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
        }

        // 3. Шинэ нууц үгийг хашилах (hash)
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Баазад шинэчлэх
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ message: "Нууц үг амжилттай шинэчлэгдлээ" }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: "Дотоод алдаа гарлаа" }, { status: 500 });
    }
}