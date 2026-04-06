import { User } from '@/generated/prisma';
import jwt from 'jsonwebtoken'



export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;


export const generateAccessToken = (user: User) => {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
}


export const generateRefreshToken = (user: User) => {
    return jwt.sign(
        { userId: user.id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

// Token verification functions
export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as {
            userId: number;
            role: string;
            iat: number;
            exp: number;
        };
    } catch (error) {
        console.error('verifyAccessToken failed:', error);
        return null;
    }
};

export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET) as {
            userId: number;
            iat: number;
            exp: number;
        };
    } catch (error) {
        return null;
    }
};

// Middleware helper to check user role from bearer token
export const checkUserRole = (token: string, requiredRole: string) => {
    const decoded = verifyAccessToken(token);
    if (!decoded) return false;

    return decoded.role === requiredRole;
};

// Get user info from token
export const getUserFromToken = (token: string) => {
    const decoded = verifyAccessToken(token);
    return decoded ? { userId: decoded.userId, role: decoded.role } : null;
};
