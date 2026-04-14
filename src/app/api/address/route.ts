import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_SECRET } from "../auth/jwt/jwt_controller";
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
        }

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
        const userID = Number(decoded.userId)

        const addresses = await prisma.address.findMany({ where: { userId: userID }, include: { user: true, orders: true, district: true } })

        if (!addresses) return NextResponse.json({ message: 'Хэрэглэгчийн хаяг бүртгэгдээгүй!' })

        return NextResponse.json({ data: addresses }, { status: 200 })

    } catch (e) {

        console.log("error get address", e)

        return NextResponse.json(
            { error: e },
            { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
        }

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
        const userID = Number(decoded.userId)

        const { address } = await req.json()

        if (!address) return NextResponse.json({ error: "Мэдээлэл дутуу байна" }, { status: 400 });

        const { city, districtId, khoroo, detail, phone, latitude, longitude } = address;
        const parsedDistrictId = Number(districtId);

        if (!city || !parsedDistrictId || !khoroo || !detail || !phone) {
            return NextResponse.json({ error: "Мэдээлэл дутуу байна" }, { status: 400 });
        }

        const recordedAddresses = await prisma.address.findMany({ where: { userId: userID } })
        const isFirst = recordedAddresses.length === 0

        const newAddress = await prisma.address.create({
            data: {
                userId: userID,
                isMain: isFirst,
                city,
                districtId: parsedDistrictId,
                khoroo,
                detail,
                phone,
                ...(latitude != null && longitude != null && {
                    latitude: latitude,
                    longitude: longitude,
                }),
            },
            include: { district: true },
        })

        if (!newAddress) NextResponse.json({ error: "Бүртгэлт амжилтгүй" }, { status: 400 });

        return NextResponse.json({ data: newAddress }, { status: 200 })


    } catch (e) {
        console.log(e)
        return NextResponse.json(
            { error: e },
            { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
        }

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
        const userID = Number(decoded.userId)

        const { id } = await req.json()

        const addressId = Number(id)


        if (!addressId) NextResponse.json({ error: "Мэдээлэл дутуу байна" }, { status: 400 });

        try {
            await prisma.address.delete({
                where: { id: addressId, userId: userID }
            })
        } catch (e) {
            NextResponse.json({ error: "Амжилтгүй" }, { status: 400 });
        }

        return NextResponse.json({ status: 200 })

    } catch (e) {
        console.log(e)
        return NextResponse.json(
            { error: e },
            { status: 500 })
    }
}