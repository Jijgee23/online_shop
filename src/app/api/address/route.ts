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

        if (!newAddress) return NextResponse.json({ error: "Бүртгэлт амжилтгүй" }, { status: 400 });

        return NextResponse.json({ data: newAddress }, { status: 200 })


    } catch (e) {
        console.log(e)
        return NextResponse.json(
            { error: e },
            { status: 500 })
    }
}

// Хаяг засах: id өгвөл тухайн хаягийг (эзэмшил шалгаад) шинэчилнэ.
// id байхгүй бол үндсэн хаягийг шинэчилнэ (байхгүй бол үүсгэнэ) — давхцал үүсгэхгүй.
export async function PATCH(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
        const userID = Number(decoded.userId);

        const { id, address } = await req.json();
        if (!address) return NextResponse.json({ error: "Мэдээлэл дутуу байна" }, { status: 400 });

        const { city, districtId, khoroo, detail, phone, latitude, longitude } = address;
        const parsedDistrictId = Number(districtId);
        if (!city || !parsedDistrictId || !khoroo || !detail || !phone) {
            return NextResponse.json({ error: "Мэдээлэл дутуу байна" }, { status: 400 });
        }

        const data = {
            city,
            districtId: parsedDistrictId,
            khoroo,
            detail,
            phone,
            ...(latitude != null && longitude != null && { latitude, longitude }),
        };

        // ── Тодорхой хаягийг засах ────────────────────────────────────────────
        if (id != null) {
            const target = await prisma.address.findFirst({ where: { id: Number(id), userId: userID } });
            if (!target) return NextResponse.json({ error: "Хаяг олдсонгүй" }, { status: 404 });
            const saved = await prisma.address.update({ where: { id: target.id }, data, include: { district: true } });
            return NextResponse.json({ data: saved }, { status: 200 });
        }

        // ── id байхгүй: үндсэн хаягийг upsert ─────────────────────────────────
        const main = await prisma.address.findFirst({
            where: { userId: userID },
            orderBy: [{ isMain: "desc" }, { id: "desc" }],
        });

        const saved = main
            ? await prisma.address.update({ where: { id: main.id }, data, include: { district: true } })
            : await prisma.address.create({ data: { userId: userID, isMain: true, ...data }, include: { district: true } });

        return NextResponse.json({ data: saved }, { status: 200 });
    } catch (e) {
        console.log("patch address error", e);
        return NextResponse.json({ error: e }, { status: 500 });
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


        if (!addressId) return NextResponse.json({ error: "Мэдээлэл дутуу байна" }, { status: 400 });

        try {
            await prisma.address.delete({
                where: { id: addressId, userId: userID }
            })
        } catch (e) {
            return NextResponse.json({ error: "Амжилтгүй" }, { status: 400 });
        }

        return NextResponse.json({ status: 200 })

    } catch (e) {
        console.log(e)
        return NextResponse.json(
            { error: e },
            { status: 500 })
    }
}