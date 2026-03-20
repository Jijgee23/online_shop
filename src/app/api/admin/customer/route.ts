

import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // Admin logic here - authentication is handled by middleware
    } catch (err) {
        console.log("create customer error");
    }
}

export async function GET(request: Request) {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: UserRole.CUSTOMER,
            },
            select: {
                id: true,
                name: true,
                email: true,
                status: true,
                role: true,
                createdAt: true,
                orders: {
                    select: {
                        total: true
                    }
                }
            }
        });

        // Transform to Customer format
        const customers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            role: user.role,
            totalOrders: user.orders.length,
            totalSpent: user.orders.reduce((sum, order) => sum + (order.total || 0), 0)
        }));

        return NextResponse.json({
            data: customers ?? [],
        }, {
            status: 200
        });

    } catch (err) {
        console.log("create customer error");
        return NextResponse.json(
            { error: "Cant get user" },
            { status: 404 }
        );
    }
}