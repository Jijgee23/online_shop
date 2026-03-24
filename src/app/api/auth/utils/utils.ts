import { OtpType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const generateOTP = () => {
    // 6 оронтой санамсаргүй тоо үүсгэх
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
        auth: { user: 'jijgee647@gmail.com', pass: 'uwsk ebrg nibq nvvn' }
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