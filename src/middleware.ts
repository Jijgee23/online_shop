import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from './app/api/auth/jwt/jwt_controller';

// Routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/landing',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/product',
  '/api/product/featured',
  '/api/category',
  '/api/admin/register'
];

// Routes that require admin role
const adminRoutes = [
  '/api/admin',
  '/api/admin/customer',
  '/api/admin/product',
  '/api/admin/category',
  '/api/admin/order',
];

// Helper function to get token from cookies or Authorization header
function getToken(request: NextRequest): string | null {
  // Try to get from Authorization header first

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get from cookies
  console.log("getting token from cookies")
  const token = request.cookies.get('accessToken')?.value;
  return token || null;
}

// Helper function to check if user is admin
function isAdmin(token: string): boolean {
  const decoded = verifyAccessToken(token);
  return decoded ? decoded.role === 'ADMIN' : false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token
  const token = getToken(request);

  if (!token) {
    return NextResponse.json(
      { error: 'Нэвтрэх шаардлагатай!' },
      { status: 401 }
    );
  }

  // Verify token
  //   console.log("verifieng access");
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: 'Хандах хугацаа дууссан, Нэвтэрнэ үү!' },
      { status: 401 }
    );
  }
  //   console.log(decoded)

  // Check admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!isAdmin(token)) {
      return NextResponse.json(
        { error: 'Хандах эрх байхгүй!' },
        { status: 403 }
      );
    }
  }

  // Token is valid, proceed
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
  runtime: 'nodejs', // JWT verification uses Node's crypto module
};

