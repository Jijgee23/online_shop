import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import toast from "react-hot-toast";

const firebaseConfig = {
    apiKey: "AIzaSyBeUjKXulpS95iUvE--ADVoaz3uZ-SGpts",
    authDomain: "ishop-99ded.firebaseapp.com",
    projectId: "ishop-99ded",
    storageBucket: "ishop-99ded.firebasestorage.app",
    messagingSenderId: "39347484760",
    appId: "1:39347484760:web:a260fbcd1bbcb8ec2cf22d",
    measurementId: "G-ZQR4GF486L",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let foregroundListenerRegistered = false;

async function getMessagingInstance() {
    if (typeof window === "undefined") return null;
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
}

function registerForegroundListener(messaging: ReturnType<typeof getMessaging>) {
    if (foregroundListenerRegistered) return;
    foregroundListenerRegistered = true;

    onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? payload.data?.title ?? "Мэдэгдэл";
        const body = payload.notification?.body ?? payload.data?.body ?? "";
        console.log("body", body)

        // Show in-app toast — Chrome ignores new Notification() when tab is focused
        toast(
            (t) => (
                <div className="flex items-start gap-3" onClick={() => toast.dismiss(t.id)}>
                    <span className="text-xl flex-shrink-0">🔔</span>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{title}</p>
                        {body && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{body}</p>}
                    </div>
                </div>
            ),
            { duration: 5000, style: { maxWidth: 340 } }
        );

        // Signal bell components to refetch + carry message data for payment listeners
        window.dispatchEvent(new CustomEvent("fcm-message", { detail: payload.data ?? {} }));
    });
}

/** Re-register foreground listener on every page load when permission is already granted. */
export async function initForegroundMessaging(): Promise<void> {
    if (typeof window === "undefined") return;
    if (Notification.permission !== "granted") return;
    const messaging = await getMessagingInstance();
    if (!messaging) return;
    registerForegroundListener(messaging);
}

/** Request permission → register SW → get FCM token. Call on login. */
export const requestForToken = async (): Promise<string | null> => {
    if (typeof window === "undefined") return null;
    try {
        const messaging = await getMessagingInstance();
        if (!messaging) return null;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return null;

        const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
            { scope: "/firebase-cloud-messaging-push-scope" }
        );

        const token = await getToken(messaging, {
            vapidKey: "BADMN2ptCVitIQYtTi3xi2RB_oQm3SRYcXygxYwVlTMdOqM1rwGnmZkFsSuPmw2XL0c5wcD-4-VWu5kgWDPv49Y",
            serviceWorkerRegistration: registration,
        });

        registerForegroundListener(messaging);
        return token ?? null;
    } catch (error) {
        console.error("FCM token error:", error);
        return null;
    }
};
