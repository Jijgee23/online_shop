import { NextResponse } from 'next/server';
import { checkUserRole, getUserFromToken } from '../jwt/jwt_controller';

// Helper function to get token from Authorization header
export const getTokenFromHeader = (request: Request) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
};

// Middleware to require admin role
export const requireAdmin = (request: Request) => {
    const token = getTokenFromHeader(request);
    if (!token) {
        return NextResponse.json(
            { error: "Access token required" },
            { status: 401 }
        );
    }

    const isAdmin = checkUserRole(token, 'ADMIN');
    if (!isAdmin) {
        return NextResponse.json(
            { error: "Admin access required" },
            { status: 403 }
        );
    }

    return null; // No error, proceed
};

// Middleware to require authentication (any role)
export const requireAuth = (request: Request) => {
    const token = getTokenFromHeader(request);
    if (!token) {
        console.log("cant read token from request")
        return NextResponse.json(
            { error: "Access token required" },
            { status: 401 }
        );
    }

    const user = getUserFromToken(token);
    if (!user) {
        return NextResponse.json(
            { error: "Invalid token" },
            { status: 401 }
        );
    }

    return user; // Return user info
};

// Middleware to require specific role
export const requireRole = (request: Request, role: string) => {
    const token = getTokenFromHeader(request);
    if (!token) {
        return NextResponse.json(
            { error: "Access token required" },
            { status: 401 }
        );
    }

    const hasRole = checkUserRole(token, role);
    if (!hasRole) {
        return NextResponse.json(
            { error: `${role} access required` },
            { status: 403 }
        );
    }

    return null; // No error, proceed
};