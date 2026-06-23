import path from "path";

/**
 * Uploaded файлууд диск дээр хадгалагдах хавтас.
 * - Production: UPLOAD_DIR=/var/www/shop-uploads (nginx /uploads/-оор түгээнэ)
 * - Local dev (default): <project>/public/uploads (Next public/-аас түгээнэ)
 * Public URL нь файл хаана ч хадгалагдсан үргэлж /uploads/<filename> хэвээр.
 */
export function getUploadDir(): string {
    // .env-д санамсаргүй орсон хашилт/зайг арилгана (UPLOAD_DIR="..." → /...)
    const dir = process.env.UPLOAD_DIR?.trim().replace(/^["']|["']$/g, "");
    return dir || path.join(process.cwd(), "public/uploads");
}

/**
 * Давтагдашгүй файлын нэр үүсгэнэ.
 * Олон файлыг Promise.all-аар зэрэг бичихэд Date.now() ижил утга буцааж,
 * ижил нэртэй файлууд мөргөлдөж нэг url дээр 2 мөр (duplicate) үүсэхээс сэргийлнэ.
 */
export function uniqueFileName(originalName: string): string {
    const safe = (originalName || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
    const rand = Math.random().toString(36).slice(2, 8);
    return `${Date.now()}-${rand}-${safe}`;
}
