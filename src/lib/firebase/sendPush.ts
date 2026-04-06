import admin from "./admin";
import { prisma } from "@/lib/prisma";

interface PushPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

/**
 * Send a push notification to all active FCM tokens of a user.
 * Automatically removes expired / invalid tokens from the DB.
 */
export async function sendPushToUser(userId: number, payload: PushPayload): Promise<void> {
    if (!admin.apps.length) return; // Admin SDK not initialised (missing env vars)

    const fcmRecords = await prisma.fCM.findMany({
        where: { userId, deletedAt: null },
        select: { id: true, token: true },
    });

    if (fcmRecords.length === 0) return;

    const tokens = fcmRecords.map(r => r.token);

    const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
        webpush: {
            notification: {
                title: payload.title,
                body: payload.body,
                icon: "/icons/icon-192x192.png",
            },
            fcmOptions: { link: payload.data?.link ?? "/" },
        },
    });

    // Remove tokens that are no longer valid
    const invalidIds: number[] = [];
    response.responses.forEach((res, idx) => {
        if (!res.success) {
            const code = res.error?.code;
            if (
                code === "messaging/registration-token-not-registered" ||
                code === "messaging/invalid-registration-token"
            ) {
                invalidIds.push(fcmRecords[idx].id);
            }
        }
    });

    if (invalidIds.length > 0) {
        await prisma.fCM.updateMany({
            where: { id: { in: invalidIds } },
            data: { deletedAt: new Date() },
        });
    }
}

/**
 * Send a push notification to all active FCM tokens of multiple users (e.g. all admins).
 */
export async function sendPushToUsers(userIds: number[], payload: PushPayload): Promise<void> {
    await Promise.allSettled(userIds.map(id => sendPushToUser(id, payload)));
}
