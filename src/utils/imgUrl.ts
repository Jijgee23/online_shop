const BASE = process.env.NEXT_PUBLIC_IMAGE_URL || "";

export function imgUrl(path: string | null | undefined): string {
    if (!path) return `${BASE}/uploads/placeholder.png`;
    return `${BASE}${path}`;
}
