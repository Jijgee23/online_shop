import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../jwt/jwt_controller";
import { ActivityAction } from "@/generated/prisma";
import { logActivity } from "../utils/utils";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  if (token) {
      try {
          const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
          const ip        = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
                         ?? req.headers.get("x-real-ip")
                         ?? undefined;
          const userAgent = req.headers.get("user-agent") ?? undefined;
          await logActivity(Number(decoded.userId), ActivityAction.LOGOUT, { ip, userAgent });
      } catch { /* expired token — log nothing */ }
  }

  const response = NextResponse.json({
    message: "Logout successful"
  }, { status: 200 });

  // Clear the authentication cookies
  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}