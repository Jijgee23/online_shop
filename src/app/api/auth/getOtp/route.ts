import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateOTP, sendEmailOTP } from "../utils/utils";
import { OtpType } from "@/generated/prisma";

// ... бусад import-ууд

export async function POST(req: Request) {
    try {
        const { email, type } = await req.json();

        // 1. Хэрэглэгч шалгах
        const user = await prisma.user.findUnique({ where: { email } });
        if (user && type === OtpType.SIGNUP) {
            return NextResponse.json({ message: 'Хэрэглэгч аль хэдийн бүртгэгдсэн байна' }, { status: 400 });
        }

        // 2. Идэвхтэй OTP байгаа эсэхийг ЗӨВ шалгах
        const activeOtp = await prisma.otp.findFirst({
            where: {
                email: email,
                type: type,
                expiresAt: { gt: new Date() }
            }
        });

        if (activeOtp) {
            return NextResponse.json({
                message: 'Таны өмнөх код хүчинтэй байна. Түр хүлээгээд дахин оролдоно уу.'
            }, { status: 429 });
        }

        // 3. OTP үүсгэх болон илгээх
        const otp = generateOTP();
        await sendEmailOTP(email, Number(otp), type as OtpType);

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

        // 4. Баазад хадгалах (Upsert ашиглавал илүү цэвэрхэн - хуучныг нь шинэчилнэ)
        // Хэрэв @@unique([email, type]) идэвхжүүлсэн бол ингэж бичнэ:
        const createdOtp = await prisma.otp.upsert({
            where: {
                email_type: { email, type: type }
            },
            update: {
                code: otp,
                expiresAt: expiresAt,
                createdAt: new Date()
            },
            create: {
                email: email,
                code: otp,
                expiresAt: expiresAt,
                type: type
            }
        });

        return NextResponse.json({ message: 'OTP код амжилттай илгээгдлээ' }, { status: 200 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Дотоод алдаа гарлаа" }, { status: 500 });
    }
}