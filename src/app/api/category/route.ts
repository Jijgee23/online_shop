import { CategoryState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { CategoryService } from "@/services/catogory.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const categories = await CategoryService.fetchCategories();
    return NextResponse.json(categories);
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();

        // categoryId, name гэх мэт body-оор авна
        return NextResponse.json({ message: "OK" });
    } catch (error) {
        return NextResponse.json({ error: "Амжилтгүй" }, { status: 500 });
    }
}
