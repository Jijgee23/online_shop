import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password, speacialCode } = body;

        // 1. Оролтын өгөгдлийг шалгах
        if (!name || !email || !password || !speacialCode) {
            return NextResponse.json(
                { message: "Бүх талбарыг бөглөнө үү" },
                { status: 400 }
            );
        }
        
        console.log(name, email, password, speacialCode)
        // 2. Имэйл хаяг бүртгэлтэй эсэхийг шалгах
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна!" },
                { status: 400 }
            );
        }

        if (speacialCode !== 'SPCODE') {
            return NextResponse.json(
                { message: "Системийн тусгай код буруу байна!" },
                { status: 400 }
            );
        }

        // 3. Нууц үгийг хаших (Hash password)
        // Salt rounds: 10 (Аюулгүй байдал болон хурдны тэнцвэр)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Шинэ админ хэрэглэгч үүсгэх
        // Таны User модель дээр 'role' талбар байгаа гэж үзлээ (ADMIN эсвэл USER)
        const newAdmin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.ADMIN, // Эсвэл таны моделийн дагуу (жишээ нь isAdmin: true)
            },
        });

        // 5. Нууц үгийг хасаж хариу илгээх
        const { password: _, ...adminData } = newAdmin;

        return NextResponse.json(
            {
                success: true,
                message: "Админ амжилттай бүртгэгдлээ",
                data: adminData
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Admin Registration Error:", error);
        return NextResponse.json(
            { message: "Сервер дээр алдаа гарлаа", error: error.message },
            { status: 500 }
        );
    }
}