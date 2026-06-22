import path from "path";

/**
 * Uploaded файлууд диск дээр хадгалагдах хавтас.
 * - Production: UPLOAD_DIR=/var/www/shop-uploads (nginx /uploads/-оор түгээнэ)
 * - Local dev (default): <project>/public/uploads (Next public/-аас түгээнэ)
 * Public URL нь файл хаана ч хадгалагдсан үргэлж /uploads/<filename> хэвээр.
 */
export function getUploadDir(): string {
    return process.env.UPLOAD_DIR || path.join(process.cwd(), "public/uploads");
}
