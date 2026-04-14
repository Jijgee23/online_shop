import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicRoutes = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/landing',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/auth/getOtp',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/auth/reset-password',
  '/api/product',
  '/api/product/featured',
  '/api/category',
  '/api/districts',
  '/api/admin/register',
  '/api/invoice',
  '/api/invoice/check',
  '/api/payments',
  '/api/settings'
];

const adminRoutes = [
  '/api/admin',
  '/api/admin/customer',
  '/api/admin/product',
  '/api/admin/category',
  '/api/admin/order',
  '/api/admin/qpay',
  '/api/admin/payment',
  '/api/admin/invoice',
];

function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return request.cookies.get('accessToken')?.value ?? null;
}

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: number; role: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = getToken(request);

  if (!token) {
    return NextResponse.json(
      { error: 'Нэвтрэх шаардлагатай!' },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: 'Хандах хугацаа дууссан, Нэвтэрнэ үү!' },
      { status: 401 }
    );
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Хандах эрх байхгүй!' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
