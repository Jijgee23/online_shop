import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { generateAccessToken, generateRefreshToken } from "../jwt/jwt_controller";

export async function POST(req: Request) {
  console.log("logging in backend");
  const { email, password } = await req.json()

  if (!email || !password) {

    return NextResponse.json(
      { error: "Имейл болон нууц үг шаардлагатай!" },
      { status: 400 }
    )
  }
  console.log("email:" + email, "password:" + password);

  try {

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log("user not found");
      return NextResponse.json(
        { error: "Бүртгэлтэй хэрэглэгч олдсонгүй!" },
        { status: 404 }
      )
    }

    // Check if password is hashed (bcrypt hashes start with $2) or plain text
    let valid = false;
    if (user.password.startsWith('$2')) {
      // Password is hashed, use bcrypt compare
      valid = await bcrypt.compare(password, user.password);
    } else {
      // Password is plain text (legacy), compare directly
      valid = password === user.password;
    }

    if (!valid) {
      return NextResponse.json(
        { error: "Нууц үг буруу байна" },
        { status: 401 }
      )
    }

    // console.log(user)
    const accessToken = generateAccessToken(user as any);
    const refreshToken = generateRefreshToken(user as any);

    const result = NextResponse.json({
      message: "Login success",
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken
    }, { status: 200 },
    );

    // Set HTTP-only cookies for security
    result.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 48, // 30 minutes
      path: '/',
    });

  
    result.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    if (user && valid) {
      // console.log("returning result")
      return result
    }

  } catch (error) {
    console.log("be err:" + error);
    return NextResponse.json({
      error: "Login not success"
    }, { status: 400 })
  }
}