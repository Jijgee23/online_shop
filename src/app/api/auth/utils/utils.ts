import { OtpType } from '@/generated/prisma';
import { requestForToken } from '@/lib/firebase/firebase';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export const validateOtp = async (email: string, otpCode: string, type: OtpType) => {
    // 1. Кодыг хайх
    console.log(email, otpCode, type)

    const otpRecord = await prisma.otp.findFirst({
        where: {
            email: email,
            code: otpCode,
            type: type,
            expiresAt: { gt: new Date() } // Хугацаа нь дуусаагүй байх
        }
    });

    if (!otpRecord) {
        return { success: false, message: "Код буруу эсвэл хугацаа нь дууссан байна." };
    }

    // 2. Ашигласан кодыг устгах (Нэг кодыг дахин ашиглахаас сэргийлнэ)
    await prisma.otp.delete({
        where: { id: otpRecord.id }
    });

    return { success: true, message: "Амжилттай баталгаажлаа." };
};

export const sendEmailOTP = async (email: string, otp: number, type: OtpType) => {
    const subject = type === OtpType.SIGNUP ? "Бүртгэл баталгаажуулах" : "Нууц үг сэргээх";
    const title = type === OtpType.SIGNUP ? "Тавтай морилно уу!" : "Нууц үг солих хүсэлт";
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.MAIL_SENDER_EMAIL, pass: process.env.MAIL_SENDER_PASS }
    });

    await transporter.sendMail({
        from: '"Ishop Store" <no-reply@ishop.mn>',
        to: email,
        subject: subject,
        text: `Таны баталгаажуулах код: ${otp}. Энэ код 5 минутын дараа хүчингүй болно.`,
        html: `
      <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f4;">
        <h2 style="color: #14b8a6;">Ishop Баталгаажуулалт</h2>
        <p>${title}:</p>
        <h1 style="letter-spacing: 5px; color: #18181b;">${otp}</h1>
        <p style="font-size: 12px; color: #71717a;">Энэ код 5 минутын дараа хүчингүй болно.</p>
      </div>
    `,
    });
};

export const createFCM = async (userId: number, token: string) => {
    try {
    
        // 1. Өмнө нь энэ токен бүртгэгдсэн эсэхийг шалгах
        const existingFCM = await prisma.fCM.findFirst({
            where: {
                token: token,
                userId: userId
            }
        });

        if (existingFCM) {
            // Хэрэв өмнө нь Soft Delete хийгдсэн (deletedAt != null) бол буцааж идэвхжүүлэх
            if (existingFCM.deletedAt) {
                const updated = await prisma.fCM.update({
                    where: { id: existingFCM.id },
                    data: { deletedAt: null }
                });
                return { data: updated, message: "Токен дахин идэвхжлээ", status: 200 };
            }
            return { message: "Токен аль хэдийн бүртгэгдсэн байна", status: 200 };
        }

        // 2. Шинээр токен үүсгэх
        const newFCM = await prisma.fCM.create({
            data: {
                token: token,
                userId: userId
            }
        });

        return { data: newFCM, message: "Амжилттай бүртгэгдлээ", status: 201 };

    } catch (error) {
        console.error("FCM Registration Error in Utils:", error);
        return { error: "Серверийн алдаа", status: 500 };
    }
}