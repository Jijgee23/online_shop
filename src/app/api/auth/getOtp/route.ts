import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateOTP, sendSMS, sendEmailOTP } from "../utils/utils";
import { OtpType } from "@/generated/prisma";

export async function POST(req: Request) {
    try {
        const { phone, email, type } = await req.json();

        if (!phone && !email) {
            return NextResponse.json({ message: "Имэйл эсвэл утасны дугаар оруулна уу!" }, { status: 400 });
        }

        const via = phone ? "phone" : "email";

        // Check duplicate for SIGNUP
        if (type === OtpType.SIGNUP) {
            const user = via === "phone"
                ? await prisma.user.findUnique({ where: { phone } })
                : await prisma.user.findUnique({ where: { email } });
            if (user) {
                return NextResponse.json({ message: "Хэрэглэгч аль хэдийн бүртгэгдсэн байна" }, { status: 400 });
            }
        }

        // Check for still-active OTP
        const activeOtp = await prisma.otp.findFirst({
            where: via === "phone"
                ? { phone, type, expiresAt: { gt: new Date() } }
                : { email, type, expiresAt: { gt: new Date() } }
        });
        if (activeOtp) {
            return NextResponse.json(
                { message: "Таны өмнөх код хүчинтэй байна. Түр хүлээгээд дахин оролдоно уу." },
                { status: 429 }
            );
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        if (via === "phone") {
            await sendSMS(Number(otp), type as OtpType, phone);
            await prisma.otp.upsert({
                where: { phone_type: { phone, type } },
                update: { code: otp, expiresAt, createdAt: new Date() },
                create: { phone, code: otp, expiresAt, type },
            });
        } else {
            await sendEmailOTP(email, Number(otp), type as OtpType);
            await prisma.otp.upsert({
                where: { email_type: { email, type } },
                update: { code: otp, expiresAt, createdAt: new Date() },
                create: { email, code: otp, expiresAt, type },
            });
        }

        return NextResponse.json({ message: "OTP код амжилттай илгээгдлээ" }, { status: 200 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Дотоод алдаа гарлаа" }, { status: 500 });
    }
}
