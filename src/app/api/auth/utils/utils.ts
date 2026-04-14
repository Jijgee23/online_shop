import { ActivityAction, OtpType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export const validateOtp = async (
    identifier: string,
    otpCode: string,
    type: OtpType,
    via: "email" | "phone" = "email"
) => {
    const otpRecord = await prisma.otp.findFirst({
        where: via === "email"
            ? { email: identifier, code: otpCode, type, expiresAt: { gt: new Date() } }
            : { phone: identifier, code: otpCode, type, expiresAt: { gt: new Date() } }
    });

    if (!otpRecord) {
        return { success: false, message: "Код буруу эсвэл хугацаа нь дууссан байна." };
    }

    await prisma.otp.delete({ where: { id: otpRecord.id } });
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
        const existingFCM = await prisma.fCM.findFirst({
            where: { token, userId }
        });

        if (existingFCM) {
            if (existingFCM.deletedAt) {
                const updated = await prisma.fCM.update({
                    where: { id: existingFCM.id },
                    data: { deletedAt: null }
                });
                return { data: updated, message: "Токен дахин идэвхжлээ", status: 200 };
            }
            return { message: "Токен аль хэдийн бүртгэгдсэн байна", status: 200 };
        }

        const newFCM = await prisma.fCM.create({ data: { token, userId } });
        return { data: newFCM, message: "Амжилттай бүртгэгдлээ", status: 201 };

    } catch (error) {
        console.error("FCM Registration Error in Utils:", error);
        return { error: "Серверийн алдаа", status: 500 };
    }
};

// ─── Activity log ─────────────────────────────────────────────────────────────

export const logActivity = async (
    userId: number,
    action: ActivityAction,
    opts?: { description?: string; ip?: string; userAgent?: string; metadata?: Record<string, any> }
) => {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                description: opts?.description,
                ip:          opts?.ip,
                userAgent:   opts?.userAgent,
                metadata:    opts?.metadata,
            },
        });
    } catch (err) {
        console.error("logActivity error:", err);
    }
};

// ─── Device detection helpers ─────────────────────────────────────────────────

function detectPlatform(ua: string): string {
    if (/android/i.test(ua)) return "android";
    if (/iphone|ipad|ipod/i.test(ua)) return "ios";
    return "web";
}

function detectDeviceName(ua: string): string {
    if (/android/i.test(ua)) {
        const m = ua.match(/;\s*([^;)]+)\s*Build\//);
        return m ? m[1].trim() : "Android";
    }
    if (/iphone/i.test(ua)) return "iPhone";
    if (/ipad/i.test(ua)) return "iPad";
    if (/windows/i.test(ua)) return "Windows PC";
    if (/macintosh/i.test(ua)) return "Mac";
    return "Веб хөтөч";
}

export const registerDevice = async (
    userId: number,
    opts: { ip?: string; userAgent?: string; fcmToken?: string; }
) => {
    try {
        const { ip, userAgent, fcmToken } = opts;

        const platform   = userAgent ? detectPlatform(userAgent)   : "web";
        const deviceName = userAgent ? detectDeviceName(userAgent)  : "Тодорхойгүй";

        // If this FCM token already belongs to a device, reuse that device
        let deviceId: number | null = null;
        if (fcmToken) {
            const existingFCM = await prisma.fCM.findUnique({ where: { token: fcmToken } });
            if (existingFCM?.deviceId) deviceId = existingFCM.deviceId;
        }

        if (deviceId) {
            const device = await prisma.device.findUnique({ where: { id: deviceId } });
            if (device) {
                const ips = ip && !device.ipAddresses.includes(ip)
                    ? [...device.ipAddresses, ip]
                    : device.ipAddresses;
                await prisma.device.update({
                    where: { id: deviceId },
                    data: { lastSeenAt: new Date(), ipAddresses: ips },
                });
            }
        } else {
            const created = await prisma.device.create({
                data: {
                    userId,
                    platform,
                    deviceName,
                    ipAddresses: ip ? [ip] : [],
                    lastSeenAt: new Date(),
                },
            });
            deviceId = created.id;
        }

        // Upsert FCM token linked to the device
        if (fcmToken && deviceId) {
            const existing = await prisma.fCM.findUnique({ where: { token: fcmToken } });
            if (existing) {
                await prisma.fCM.update({
                    where: { id: existing.id },
                    data: { deletedAt: null, deviceId, userId },
                });
            } else {
                await prisma.fCM.create({ data: { token: fcmToken, userId, deviceId } });
            }
        }

        await logActivity(userId, ActivityAction.DEVICE_REGISTERED, {
            ip,
            userAgent,
            metadata: { deviceId, platform, deviceName },
        });
    } catch (err) {
        console.error("registerDevice error:", err);
        // Silent — never propagate
    }
};

export const sendSMS = async (otp: number, optType: OtpType, phone: string) => {
    const subject = optType === OtpType.SIGNUP ? "Бүртгэл баталгаажуулах" : "Нууц үг сэргээх";
    // const title = optType === OtpType.SIGNUP ? "Тавтай морилно уу!" : "Нууц үг солих хүсэлт";
    const apiUrl = process.env.CALL_PRO_URL ?? 'https://api.messagepro.mn/send';
    const xApiKey = process.env.CALL_PRO_API_KEY ?? '10c2f933f9a9af1936b31c6ddcf59847';
    const callProScecialKey = process.env.CALL_PRO_SPECIAL_KEY ?? '72776399';
    const text = `Ishop, ${subject} код ${otp}`;
    const response = await fetch(`${apiUrl}?from=${callProScecialKey}&to=${phone}&text=${text}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "x-api-key": xApiKey },
    });
    return response.ok;
};
