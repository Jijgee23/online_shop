import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { generateAccessToken, generateRefreshToken } from "../jwt/jwt_controller";
import { logActivity, registerDevice } from "../utils/utils";
import { ActivityAction } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  const { identifier, password, token } = await req.json()

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Нэвтрэх мэдээлэл дутуу байна!" },
      { status: 400 }
    )
  }

  try {
    const isEmail = identifier.includes("@")
    const user = isEmail
      ? await prisma.user.findUnique({ where: { email: identifier } })
      : await prisma.user.findUnique({ where: { phone: identifier } })

    if (!user) {
      return NextResponse.json(
        { error: "Бүртгэлтэй хэрэглэгч олдсонгүй!" },
        { status: 404 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Энэ бүртгэл Google-ээр нэвтрэх боломжтой. Нууц үг тохируулагдаагүй байна." },
        { status: 401 }
      );
    }

    const valid = user.password.startsWith('$2')
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!valid) {
      return NextResponse.json({ error: "Нууц үг буруу байна" }, { status: 401 })
    }

    const accessToken = generateAccessToken(user as any);
    const refreshToken = generateRefreshToken(user as any);

    const result = NextResponse.json({
      message: "Login success",
      user,
      accessToken,
      refreshToken,
    }, { status: 200 });

    result.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 48,
      path: '/',
    });

    result.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    const ip        = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
                   ?? req.headers.get("x-real-ip")
                   ?? undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;

    await Promise.all([
        registerDevice(user.id, { ip, userAgent, fcmToken: token ?? undefined }),
        logActivity(user.id, ActivityAction.LOGIN, { ip, userAgent }),
    ]);

    return result

  } catch (error) {
    return NextResponse.json({ error: "Нэвтрэхэд алдаа гарлаа" }, { status: 400 })
  }
}
