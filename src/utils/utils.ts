import { ProductState, UserStatus } from "@/generated/prisma";



export const getStatusName = (status: UserStatus) => {
    let result = ''
    switch (status) {
        case (UserStatus.NEW): result = 'ШИНЭ'
        case (UserStatus.INACTIVE): result = 'ИДЭВХГҮЙ'
        default: result = 'ИДЭВХИТЭЙ'
    }
    return result
}
export const getProductStatusColor = (status: ProductState) => {
    switch (status) {
        case ProductState.ACTIVE: return "bg-green-500/10 border-green-500/20 text-green-500";
        default: return "bg-red-500/10 border-red-500/20 text-red-500";
    }
};

export const getProductStatusName = (status: ProductState) => {
    switch (status) {
        case ProductState.ACTIVE: return "Идэвхтэй";
        default: return "Идэвхгүй";
    }
};

export const generateSlug = (name: string) => {
    const cyrillicToLatin: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z',
        'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'ө': 'o', 'п': 'p',
        'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ү': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };

    const latinText = name.toLowerCase().split('').map(char => {
        return cyrillicToLatin[char] !== undefined ? cyrillicToLatin[char] : char;
    }).join('');

    return latinText
        .replace(/\s+/g, "-")          // Хоосон зайг зураасаар солих
        .replace(/[^\w-]+/g, "")       // Үсэг, тоо, зурааснаас бусдыг устгах
        .replace(/-+/g, "-")           // Дараалсан олон зураасыг нэг болгох
        .trim();                       // Эхэн болон төгсгөлийн зайг цэвэрлэх
};