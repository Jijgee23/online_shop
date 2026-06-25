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

// 5. Бага үлдэгдэлтэй бараа
export interface LowStockProduct {
    id: number;
    name: string;
    sku: string | null;
    type: "simple" | "variant" | "stock";
    totalStock: number;
    variantCount: number;
}

export interface LowStockSummary {
    threshold: number;
    total: number;          // нийт бага үлдэгдэлтэй барааны тоо
    items: LowStockProduct[]; // эхний хэдийг (limit) л буцаана
}

// 6. Сарын орлогын зорилт ба явц
export interface RevenueGoal {
    goal: number;      // тохируулсан сарын зорилт (0 = тохируулаагүй)
    current: number;   // тухайн сард хүрсэн бодит орлого
    month: string;     // жишээ нь: "6-р сар"
    daysLeft: number;  // сар дуустал үлдсэн өдөр
}

// 7. Ангиллын статистик (хүргэгдсэн захиалгуудаар)
export interface CategoryStat {
    name: string;     // ангиллын нэр ("Бусад" — үлдсэн жижиг ангиллуудын нийлбэр)
    revenue: number;  // тухайн ангиллын борлуулалтын дүн
    count: number;    // зарагдсан нийт тоо ширхэг
}

// 8. API-аас ирэх үндсэн хариуны бүтэц (Main Response)
export interface DashboardResponse {
    summary: DashboardSummary;
    chartData: ChartDataPoint[];
    topProducts: TopProduct[];
    recentOrders: RecentOrder[];
    lowStock: LowStockSummary;
    revenueGoal: RevenueGoal;
    categoryStats: CategoryStat[];
}