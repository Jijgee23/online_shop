// Энэхүү interface-ийг src/interface/category.ts эсвэл ижил төстэй файлд байрлуулна уу.

// import { Product } from "./product"; // Product interface-ийг импортлох

export interface Category {
    id: number;
    name: string;
    slug: string;
    parentId: number | null; // Prisma-ийн Int? нь TypeScript дээр number | null болно

    // Relations (Холбоосууд)
    // Эдгээр нь зөвхөн Prisma-ийн 'include' ашиглаж татсан үед л байна
    parent?: Category | null;
    children?: Category[];
    //   products?: Product[];

    // Time stamps
    createdAt: Date | string; // JSON хэлбэрээр ирэх үед string байж болно
    updatedAt?: Date | string | null;
    deletedAt?: Date | string | null;
    _count: Count | null
}
interface Count {
    products: number | 0
}
/**
 * Хэрэв танд зөвхөн Form эсвэл үүсгэхэд зориулсан 
 * дата хэрэгтэй бол 'Partial' эсвэл 'Omit' ашиглаж болно:
 */
export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'parent' | 'children' | 'products' | '_count'>;