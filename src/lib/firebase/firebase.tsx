import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBeUjKXulpS95iUvE--ADVoaz3uZ-SGpts",
    authDomain: "ishop-99ded.firebaseapp.com",
    projectId: "ishop-99ded",
    storageBucket: "ishop-99ded.firebasestorage.app",
    messagingSenderId: "39347484760",
    appId: "1:39347484760:web:a260fbcd1bbcb8ec2cf22d",
    measurementId: "G-ZQR4GF486L"
};

// 1. Firebase App-ийг нэг л удаа үүсгэх
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const requestForToken = async () => {
    // Зөвхөн хөтөч дээр ажиллахыг баталгаажуулах
    if (typeof window === "undefined") return null;

    try {
        // 2. Хөтөч Push Messaging-ийг дэмждэг эсэхийг заавал шалгах
        const supported = await isSupported();
        if (!supported) {
            console.warn("Мэдэгдэл энэ хөтөч дээр дэмжигдэхгүй байна.");
            return null;
        }

        // 3. Messaging-ийг ЗӨВХӨН ЭНД дуудах (Lazy Initialization)
        const messaging = getMessaging(app);

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            // 4. Service Worker-ийг гараар бүртгэж ажиллуулах (Reference Error-оос сэргийлнэ)
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/firebase-cloud-messaging-push-scope',
            });

            const token = await getToken(messaging, {
                vapidKey: "BADMN2ptCVitIQYtTi3xi2RB_oQm3SRYcXygxYwVlTMdOqM1rwGnmZkFsSuPmw2XL0c5wcD-4-VWu5kgWDPv49Y",
                serviceWorkerRegistration: registration,
            });

            return token;
        }
    } catch (error) {
        console.error("FCM Token авах үед алдаа гарлаа:", error);
    }
    return null;
};