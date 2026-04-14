import { CategoryState } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function saveImage(file: File): Promise<string> {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });
    const fileName = `cat-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);
    return `/uploads/${fileName}`;
}

export async function GET() {
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const name     = formData.get("name")     as string;
        const slug     = formData.get("slug")     as string;
        const parentId = formData.get("parentId") as string | null;
        const state    = (formData.get("state")   as string) || "ACTIVE";
        const imageFile = formData.get("image") as File | null;

        if (!name || !slug) {
            return NextResponse.json({ message: "Бүртгэлийн мэдээлэл дутуу байна" }, { status: 400 });
        }

        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json({ message: "Бүртгэлтэй ангилал байна" }, { status: 400 });
        }

        let imageUrl: string | null = null;
        if (imageFile && imageFile.size > 0) {
            imageUrl = await saveImage(imageFile);
        }

        const newCategory = await prisma.category.create({
            data: {
                name,
                slug,
                parentId: parentId ? Number(parentId) : null,
                state: state as CategoryState,
                image: imageUrl,
            },
        });

        return NextResponse.json(newCategory);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const formData = await req.formData();
        const id       = formData.get("id")       as string;
        const name     = formData.get("name")     as string | null;
        const slug     = formData.get("slug")     as string | null;
        const parentId = formData.get("parentId") as string | null;
        const state    = formData.get("state")    as string | null;
        const imageFile = formData.get("image")   as File | null;
        const removeImage = formData.get("removeImage") === "true";

        if (!id) {
            return NextResponse.json({ message: "ID шаардлагатай" }, { status: 400 });
        }

        const category = await prisma.category.findUnique({ where: { id: Number(id) } });
        if (!category) {
            return NextResponse.json({ error: "Ангилал олдсонгүй!" }, { status: 404 });
        }

        let imageUrl: string | null | undefined = undefined; // undefined = don't change
        if (removeImage) {
            imageUrl = null;
        } else if (imageFile && imageFile.size > 0) {
            imageUrl = await saveImage(imageFile);
        }

        const updatedCategory = await prisma.category.update({
            where: { id: category.id },
            data: {
                name:     name     ?? category.name,
                slug:     slug     ?? category.slug,
                state:    (state   ?? category.state) as CategoryState,
                parentId: parentId !== null ? Number(parentId) || null : category.parentId,
                ...(imageUrl !== undefined ? { image: imageUrl } : {}),
            },
        });

        return NextResponse.json({ message: "Амжилттай шинэчлэгдлээ", data: updatedCategory });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}
