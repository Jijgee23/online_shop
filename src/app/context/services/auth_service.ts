import toast from "react-hot-toast";


export const AuthService = {
    async checkUser() {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Хэрэглэгч олдсонгүй");
        return res.json();
    },
    async login(credentials: Record<string, string>) {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Нэвтрэхэд алдаа гарлаа");
        return data;
    },

    async sendResetOtp(email: string) {
        const res = await fetch("/api/auth/getOtp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, type: "FORGOT_PASSWORD" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Код илгээхэд алдаа гарлаа");
        return data;
    },

    async resetPassword(credentials: { email: string; otpCode: string; newPassword: string }) {
        const res = await fetch("/api/auth/resetPassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Нууц үг солиход алдаа гарлаа");
        return data;
    },

    async updateFcmToken(token: string) {
        return fetch("/api/user/fcm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });
    },
    async sendSignupOtp(email: string) {
        const res = await fetch("/api/auth/getOtp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, type: "SIGNUP" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Код илгээхэд алдаа гарлаа");
        return data;
    },

    async register(params: { name: string; email: string; phone: string; password: string; otpCode: string }) {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Бүртгэл үүсгэх үйлдэл амжилтгүй");
        return data;
    },
}