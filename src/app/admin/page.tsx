"use client"

import { useAdmin, PageKey } from "../context/admin_context";
import ProfileSection from "../components/ProfileSection";
import { useEffect, useState } from "react";
import { ChevronDown, LayoutDashboard, ShoppingCart, Package, Users, Settings, Bell, CreditCard, Receipt } from "lucide-react";
import AdminNotificationBell from "../components/AdminNotificationBell";
import AdminDashboardPage from "./dashboard/page";
import AdminOrdersPage from "./order/page";
import AdminProductsPage from "./products/page";
import NewProductPage from "./products/newProduct/page";
import FeaturedProductsPage from "./products/featured/page";
import AdminCategoryPage from "./category/page";
import AdminCustomersPage from "./customers/page";
import AdminPaymentsPage from "./payments/page";
import AdminInvoicesPage from "./invoices/page";
import AdminSettingsPage from "./settings/page";
import AdminNotificationsPage from "./notifications/page";

function ActivePage({ page }: { page: PageKey }) {
  switch (page) {
    case "Хянах самбар": return <AdminDashboardPage />;
    case "Захиалгууд": return <AdminOrdersPage />;
    case "Бүтээгдэхүүнүүд": return <AdminProductsPage />;
    case "Шинэ бүтээгдэхүүнүүд": return <NewProductPage />;
    case "Онцлох бүтээгдэхүүн": return <FeaturedProductsPage />;
    case "Ангилал": return <AdminCategoryPage />;
    case "Харилцагчид": return <AdminCustomersPage />;
    case "Төлбөрүүд": return <AdminPaymentsPage />;
    case "Invoices": return <AdminInvoicesPage />;
    case "Тохиргоо": return <AdminSettingsPage />;
    case "Мэдэгдэл": return <AdminNotificationsPage />;
  }
}

type NavItem =
  | { type: "link"; label: string; page: PageKey; icon: React.ReactNode }
  | { type: "group"; label: string; icon: React.ReactNode; children: { label: string; page: PageKey }[] };

const NAV: NavItem[] = [
  { type: "link", label: "Хянах самбар", page: "Хянах самбар", icon: <LayoutDashboard className="w-4 h-4" /> },
  { type: "link", label: "Захиалгууд", page: "Захиалгууд", icon: <ShoppingCart className="w-4 h-4" /> },
  {
    type: "group", label: "Бүтээгдэхүүн", icon: <Package className="w-4 h-4" />,
    children: [
      { label: "Жагсаалт", page: "Бүтээгдэхүүнүүд" },
      { label: "Шинэ нэмэх", page: "Шинэ бүтээгдэхүүнүүд" },
      { label: "⭐ Онцлох", page: "Онцлох бүтээгдэхүүн" },
      { label: "Ангилал", page: "Ангилал" },
    ],
  },
  { type: "link", label: "Харилцагчид", page: "Харилцагчид", icon: <Users className="w-4 h-4" /> },
  {
    type: "group", label: "Санхүү", icon: <CreditCard className="w-4 h-4" />,
    children: [
      { label: "Төлбөрүүд", page: "Төлбөрүүд" },
      { label: "QPay Invoice", page: "Invoices" },
    ],
  },
  { type: "link", label: "Тохиргоо", page: "Тохиргоо", icon: <Settings className="w-4 h-4" /> },
  { type: "link", label: "Мэдэгдэл", page: "Мэдэгдэл", icon: <Bell className="w-4 h-4" /> },
];

export default function AdminDashboard() {
  const { activePage, setActivePage, isMobileSidebarOpen, setIsMobileSidebarOpen } = useAdmin();
  const [mounted, setMounted] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    NAV.filter(n => n.type === "group" && n.children.some(c => c.page === "Бүтээгдэхүүнүүд")).map(n => n.label)
  );

  const { fetchDashboardData } = useAdmin();

  useEffect(() => { setMounted(true); }, []);

  const handlePageChange = (page: PageKey) => {
    setActivePage(page);
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    if (activePage === "Хянах самбар") {
      fetchDashboardData();
    }
    fetchDashboardData()
  }, [activePage])

  const toggleGroup = (label: string) =>
    setOpenGroups(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);

  const isGroupActive = (item: NavItem) =>
    item.type === "group" && item.children.some(c => c.page === activePage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-300 flex">

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`w-64 border-r border-slate-200 dark:border-zinc-800 flex flex-col p-6 space-y-8 bg-slate-50 dark:bg-zinc-900 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isMobileSidebarOpen ? 'lg:flex' : 'hidden lg:flex'}`}>

        <button onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden self-end mb-4 p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-900 dark:text-white text-xl tracking-tighter">
            ISHOP <span className="text-teal-500">ADMIN</span>
          </div>
          <AdminNotificationBell onNavigate={() => handlePageChange("Мэдэгдэл")} />
        </div>

        <ProfileSection onAdminSettings={() => handlePageChange("Тохиргоо")} />

        <nav className="space-y-1">
          {NAV.map(item => {
            if (item.type === "link") {
              const active = activePage === item.page;
              return (
                <button key={item.page} onClick={() => handlePageChange(item.page)}
                  className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-teal-500/10 text-teal-400" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                    }`}>
                  <span className={active ? "text-teal-400" : ""}>{item.icon}</span>
                  {item.label}
                </button>
              );
            }

            // Group
            const isOpen = openGroups.includes(item.label);
            const groupActive = isGroupActive(item);
            return (
              <div key={item.label}>
                <button onClick={() => toggleGroup(item.label)}
                  className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${groupActive ? "text-teal-400" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                    }`}>
                  <span className={groupActive ? "text-teal-400" : ""}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="ml-7 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-zinc-800 pl-3">
                    {item.children.map(child => {
                      const childActive = activePage === child.page;
                      return (
                        <button key={child.page} onClick={() => handlePageChange(child.page)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${childActive ? "text-teal-400 font-semibold bg-teal-500/10" : "text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                            }`}>
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="font-bold text-slate-900 dark:text-white text-lg tracking-tighter">ISHOP <span className="text-teal-500">ADMIN</span></div>
          <AdminNotificationBell onNavigate={() => handlePageChange("Мэдэгдэл")} />
        </div>

        {mounted ? <ActivePage page={activePage} /> : (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500" />
          </div>
        )}

      </main>

    </div>
  )
}