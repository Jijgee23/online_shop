import { NextRequest, NextResponse } from "next/server";

// Only allow internal, relative return paths (guards against open redirects)
function safeReturnPath(raw: string | null): string | null {
    if (!raw) return null;
    if (!raw.startsWith("/") || raw.startsWith("//")) return null;
    return raw;
}

export async function GET(req: NextRequest) {
    const clientId   = process.env.GOOGLE_CLIENT_ID!;
    const appUrl     = process.env.NEXT_PUBLIC_APP_URL!;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // Remember where the user started so the callback can send them back
    const from = safeReturnPath(req.nextUrl.searchParams.get("from"));
    const state = from ? `connect:${from}` : "connect";

    const params = new URLSearchParams({
        client_id:     clientId,
        redirect_uri:  redirectUri,
        response_type: "code",
        scope:         "openid email profile",
        access_type:   "offline",
        prompt:        "select_account",
        state,
    });

    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
