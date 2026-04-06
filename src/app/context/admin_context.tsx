'use client';
import { createContext, useContext, useState, useEffect, ReactNode, JSX } from 'react';
import AdminDashboardPage from '../admin/dashboard/page';
import AdminOrdersPage from '../admin/order/page';
import AdminProductsPage from '../admin/products/page';
import NewProductPage from '../admin/products/newProduct/page';
import FeaturedProductsPage from '../admin/products/featured/page';
import AdminCategoryPage from '../admin/category/page';
import AdminCustomersPage from '../admin/customers/page';
import AdminSettingsPage from '../admin/settings/page';
import AdminNotificationsPage from '../admin/notifications/page';
import { DashboardResponse } from '@/interface/dashboard';

interface AdminContextType {
    loading: boolean;
    activePage: PageKey;
    setActivePage: (page: PageKey) => void;
    isMobileSidebarOpen: boolean,
    setIsMobileSidebarOpen: (value: boolean) => void,
    pages: Record<PageKey, JSX.Element>,
    dashboardData: DashboardResponse | null,
    fetchDashboardData: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);
export type PageKey = "Хянах самбар" | "Захиалгууд" | "Бүтээгдэхүүнүүд" | "Шинэ бүтээгдэхүүнүүд" | "Онцлох бүтээгдэхүүн" | "Ангилал" | "Харилцагчид" | "Тохиргоо" | "Мэдэгдэл";

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState<PageKey>(() => {
        if (typeof window === 'undefined') return "Хянах самбар";
        return (localStorage.getItem("adminActivePage") as PageKey) || "Хянах самбар";
    });
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [dashboardData, setData] = useState<DashboardResponse | null>(null);

    useEffect(() => {
        localStorage.setItem("adminActivePage", activePage);
    }, [activePage]);

    useEffect(() => { fetchDashboardData() }, [])

    const pages: Record<PageKey, JSX.Element> = {
        "Хянах самбар": <AdminDashboardPage />,
        "Захиалгууд": <AdminOrdersPage />,
        "Бүтээгдэхүүнүүд": <AdminProductsPage />,
        "Шинэ бүтээгдэхүүнүүд": <NewProductPage />,
        "Онцлох бүтээгдэхүүн": <FeaturedProductsPage />,
        "Ангилал": <AdminCategoryPage />,
        "Харилцагчид": <AdminCustomersPage />,
        "Тохиргоо": <AdminSettingsPage />,
        "Мэдэгдэл": <AdminNotificationsPage />
    };
    const fetchDashboardData = async () => {
        try {
            const res = await fetch("/api/admin/dashboard");
            const result = await res.json();
            if (res.ok) {
                setData(result);
            }
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };


    const value: AdminContextType = {
        loading,
        activePage,
        setActivePage,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        pages,
        dashboardData,
        fetchDashboardData
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
