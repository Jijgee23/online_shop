import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

// Нэг зураг файлыг public/uploads-д хадгалж, public URL буцаана.
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Файл олдсонгүй" }, { status: 400 });
        }
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Зөвхөн зураг оруулна уу" }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), "public/uploads");
        try { await mkdir(uploadDir, { recursive: true }); } catch { /* хавтас байвал алгасна */ }

        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileName = `${Date.now()}-${safeName}`;
        await writeFile(path.join(uploadDir, fileName), buffer);

        return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
