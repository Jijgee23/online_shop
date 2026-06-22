'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DashboardResponse } from '@/interface/dashboard';

interface AdminContextType {
    loading: boolean;
    activePage: PageKey;
    setActivePage: (page: PageKey) => void;
    editingProductId: number | null;
    setEditingProductId: (id: number | null) => void;
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: (value: boolean) => void;
    dashboardData: DashboardResponse | null;
    fetchDashboardData: (dateFrom?: string, dateTo?: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export type PageKey =
    | "Хянах самбар"
    | "Захиалгууд"
    | "Бүтээгдэхүүнүүд"
    | "Шинэ бүтээгдэхүүнүүд"
    | "Онцлох бүтээгдэхүүн"
    | "Бүтээгдэхүүн засах"
    | "Ангилал"
    | "Харилцагчид"
    | "Төлбөрүүд"
    | "Invoices"
    | "Тайлан"
    | "Салбарууд"
    | "Тохиргоо"
    | "Профайл"
    | "Мэдэгдэл";

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState<PageKey>("Хянах самбар");
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [dashboardData, setData] = useState<DashboardResponse | null>(null);

    // Reload-д идэвхтэй хуудас + засаж буй барааны id-г сэргээх.
    // Transient (id шаардсан) хуудсыг id-гүйгээр сэргээхгүй — жагсаалт руу буцаана.
    useEffect(() => {
        const savedId = localStorage.getItem("adminEditingProductId");
        const restoredId = savedId ? Number(savedId) : null;
        if (restoredId) setEditingProductId(restoredId);

        const saved = localStorage.getItem("adminActivePage") as PageKey | null;
        if (saved) {
            if (saved === "Бүтээгдэхүүн засах" && !restoredId) {
                setActivePage("Бүтээгдэхүүнүүд");
            } else {
                setActivePage(saved);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("adminActivePage", activePage);
    }, [activePage]);

    useEffect(() => {
        if (editingProductId == null) localStorage.removeItem("adminEditingProductId");
        else localStorage.setItem("adminEditingProductId", String(editingProductId));
    }, [editingProductId]);

    useEffect(() => { fetchDashboardData(); }, []);

    const fetchDashboardData = async (dateFrom?: string, dateTo?: string) => {
        try {
            const q = new URLSearchParams();
            if (dateFrom) q.set("dateFrom", dateFrom);
            if (dateTo)   q.set("dateTo",   dateTo);
            const res = await fetch(`/api/admin/dashboard${q.toString() ? `?${q}` : ""}`);
            const result = await res.json();
            if (res.ok) setData(result);
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminContext.Provider value={{
            loading, activePage, setActivePage,
            editingProductId, setEditingProductId,
            isMobileSidebarOpen, setIsMobileSidebarOpen,
            dashboardData, fetchDashboardData,
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) throw new Error('useAdmin must be used within AdminProvider');
    return context;
};
