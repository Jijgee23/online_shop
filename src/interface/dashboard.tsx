import { OrderStatus } from "./order"; // Өмнө үүсгэсэн OrderStatus enum

// 1. Ерөнхий статистик үзүүлэлтүүд (Summary Cards)
export interface DashboardSummary {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    pendingOrders: number;
}

// 2. Графикийн өгөгдөл (Chart Data)
export interface ChartDataPoint {
    date: string;    // Жишээ нь: "Дав", "Мяг" эсвэл "03/20"
    revenue: number; // Тухайн өдрийн нийт орлого
}

// 3. Хамгийн их зарагдсан барааны мэдээлэл
export interface TopProduct {
    name: string;
    price: number;
    totalSold: number; // Групплэж гаргаж ирсэн нийт тоо ширхэг
}

// 4. Сүүлийн захиалгуудын товч мэдээлэл
export interface RecentOrder {
    id: number;
    totalPrice: number;
    orderNumber: string | ''
    status: OrderStatus;
    createdAt: string | Date;
    user: {
        name: string;
        email: string;
    };
}

// 5. API-аас ирэх үндсэн хариуны бүтэц (Main Response)
export interface DashboardResponse {
    summary: DashboardSummary;
    chartData: ChartDataPoint[];
    topProducts: TopProduct[];
    recentOrders: RecentOrder[];
}