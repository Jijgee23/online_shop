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
