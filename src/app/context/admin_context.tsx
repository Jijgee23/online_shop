'use client';
import { createContext, useContext, useState, useEffect, ReactNode, JSX } from 'react';
import AdminDashboardPage from '../admin/dashboard/page';
import AdminOrdersPage from '../admin/orders/page';
import AdminProductsPage from '../admin/products/page';
import NewProductPage from '../admin/products/newProduct/page';
import AdminCategoryPage from '../admin/category/page';
import AdminCustomersPage from '../admin/customers/page';

interface AdminContextType {
    loading: boolean;
    activePage: PageKey;
    setActivePage: (page: PageKey) => void;
    isMobileSidebarOpen: boolean,
    setIsMobileSidebarOpen: (value: boolean) => void,
    pages: Record<PageKey, JSX.Element>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);
export type PageKey = "Хянах самбар" | "Захиалгууд" | "Бүтээгдэхүүнүүд" | "Шинэ бүтээгдэхүүнүүд" | "Ангилал" | "Харилцагчид" | "Тохиргоо";

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState<PageKey>("Хянах самбар");
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    useEffect(() => {
        console.log("admin context effecting")

    }, []);

    const pages: Record<PageKey, JSX.Element> = {
        "Хянах самбар": <AdminDashboardPage />,
        "Захиалгууд": <AdminOrdersPage />,
        "Бүтээгдэхүүнүүд": <AdminProductsPage />,
        "Шинэ бүтээгдэхүүнүүд": <NewProductPage />,
        "Ангилал": <AdminCategoryPage />,
        "Харилцагчид": <AdminCustomersPage />,
        "Тохиргоо": <div className="text-white">Тохиргооны хуудас - Хөгжүүлэгдэж байна</div>
    };

    const value: AdminContextType = {
        loading,
        activePage,
        setActivePage, 
        isMobileSidebarOpen, 
        setIsMobileSidebarOpen, 
        pages,
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
