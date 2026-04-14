import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityAction, OtpType } from "@/generated/prisma";
import bcrypt from "bcrypt";
import { logActivity, validateOtp } from "../utils/utils";

export async function POST(req: NextRequest) {
    try {
        const { email, phone, otpCode, newPassword } = await req.json();

        if ((!email && !phone) || !otpCode || !newPassword) {
            return NextResponse.json({ error: "Мэдээлэл дутуу байна" }, { status: 400 });
        }

        const via: "email" | "phone" = phone ? "phone" : "email";
        const identifier = phone ?? email;

        const otpValidation = await validateOtp(identifier, otpCode, OtpType.FORGOT_PASSWORD, via);
        if (!otpValidation.success) {
            return NextResponse.json({ error: otpValidation.message }, { status: 400 });
        }

        const user = via === "phone"
            ? await prisma.user.findUnique({ where: { phone } })
            : await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        const ip        = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
                       ?? req.headers.get("x-real-ip")
                       ?? undefined;
        const userAgent = req.headers.get("user-agent") ?? undefined;
        await logActivity(user.id, ActivityAction.PASSWORD_RESET, { ip, userAgent });

        return NextResponse.json({ message: "Нууц үг амжилттай шинэчлэгдлээ" }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: "Дотоод алдаа гарлаа" }, { status: 500 });
    }
}
