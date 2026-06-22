const BASE = process.env.NEXT_PUBLIC_IMAGE_URL || "";

export function imgUrl(path: string | null | undefined): string {
    if (!path) return `${BASE}/uploads/placeholder.png`;
    // Аль хэдийн бүтэн URL / preview (blob, data) бол хэвээр нь буцаана
    if (/^(https?:|blob:|data:)/i.test(path)) return path;
    return `${BASE}${path}`;
}
