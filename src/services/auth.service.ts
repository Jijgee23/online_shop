
export const AuthService = {
    async checkUser() {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Хэрэглэгч олдсонгүй");
        return res.json();
    },

    async login(identifier: string, password: string) {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Нэвтрэхэд алдаа гарлаа");
        return data;
    },

    async sendOtp(identifier: string, via: "email" | "phone", type: "SIGNUP" | "FORGOT_PASSWORD") {
        const body = via === "phone"
            ? { phone: identifier, type }
            : { email: identifier, type };
        const res = await fetch("/api/auth/getOtp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Код илгээхэд алдаа гарлаа");
        return data;
    },

    async sendSignupOtp(identifier: string, via: "email" | "phone") {
        return this.sendOtp(identifier, via, "SIGNUP");
    },

    async sendResetOtp(identifier: string, via: "email" | "phone") {
        return this.sendOtp(identifier, via, "FORGOT_PASSWORD");
    },

    async resetPassword(params: { email?: string; phone?: string; otpCode: string; newPassword: string }) {
        const res = await fetch("/api/auth/resetPassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
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

    async register(params: { name: string; email: string; phone: string; password: string; otpCode: string; otpVia: "email" | "phone" }) {
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
