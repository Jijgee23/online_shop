import { prisma } from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "../../jwt/jwt_controller";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../../jwt/jwt_controller";

export async function GET(req: NextRequest) {
    const code  = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state"); // "connect" | null
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    if (!code) {
        return NextResponse.redirect(`${appUrl}/auth/login?error=google_cancelled`);
    }

    try {
        // Exchange code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id:     process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri:  `${appUrl}/api/auth/google/callback`,
                grant_type:    "authorization_code",
            }),
        });

        const tokens = await tokenRes.json();
        if (!tokenRes.ok || !tokens.access_token) {
            return NextResponse.redirect(`${appUrl}/auth/login?error=google_token`);
        }

        // Fetch Google user info
        const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const googleUser = await infoRes.json();
        if (!googleUser.email) {
            return NextResponse.redirect(`${appUrl}/auth/login?error=google_no_email`);
        }

        // ── CONNECT mode: link Google to the currently logged-in user ─────────
        if (state === "connect") {
            const cookieStore = await cookies();
            const token = cookieStore.get("accessToken")?.value;
            if (!token) {
                return NextResponse.redirect(`${appUrl}/auth/login?error=not_logged_in`);
            }
            let decoded: any;
            try { decoded = jwt.verify(token, ACCESS_TOKEN_SECRET); } catch {
                return NextResponse.redirect(`${appUrl}/auth/login?error=session_expired`);
            }

            // Make sure this Google account isn't already used by someone else
            const existing = await prisma.user.findUnique({ where: { googleId: googleUser.id } });
            if (existing && existing.id !== Number(decoded.userId)) {
                return NextResponse.redirect(`${appUrl}/settings?error=google_already_used`);
            }

            await prisma.user.update({
                where: { id: Number(decoded.userId) },
                data:  { googleId: googleUser.id },
            });

            return NextResponse.redirect(`${appUrl}/settings?success=google_connected`);
        }

        // ── LOGIN / SIGNUP mode ───────────────────────────────────────────────
        let user = await prisma.user.findFirst({
            where: { OR: [{ googleId: googleUser.id }, { email: googleUser.email }] },
        });

        if (user) {
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data:  { googleId: googleUser.id },
                });
            }
        } else {
            user = await prisma.user.create({
                data: {
                    name:     googleUser.name ?? googleUser.email.split("@")[0],
                    email:    googleUser.email,
                    googleId: googleUser.id,
                    password: null,
                },
            });
        }

        const accessToken  = generateAccessToken(user as any);
        const refreshToken = generateRefreshToken(user as any);
        const isProd = process.env.NODE_ENV === "production";

        const res = NextResponse.redirect(`${appUrl}/`);
        res.cookies.set("accessToken",  accessToken,  { httpOnly: true, secure: isProd, sameSite: "strict", maxAge: 30 * 60 * 48, path: "/" });
        res.cookies.set("refreshToken", refreshToken, { httpOnly: true, secure: isProd, sameSite: "strict", maxAge: 7 * 24 * 60 * 60, path: "/" });
        return res;

    } catch (err) {
        console.error("Google OAuth error:", err);
        return NextResponse.redirect(`${appUrl}/auth/login?error=google_failed`);
    }
}
