"use client";

import { useState, Suspense } from "react";
import { Truck, Globe, Palette, CreditCard, Package, ShoppingCart, Plug, Images } from "lucide-react";
import GeneralTab  from "./tabs/GeneralTab";
import BannerTab   from "./tabs/BannerTab";
import ProductsTab from "./tabs/ProductsTab";
import DeliveryTab from "./tabs/DeliveryTab";
import StyleTab    from "./tabs/StyleTab";
import QPayTab     from "./tabs/QPayTab";
import OrderTab    from "./tabs/OrderTab";
import MacsTab     from "./tabs/MacsTab";

type Tab = "general" | "banner" | "products" | "delivery" | "order" | "style" | "qpay" | "macs";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "general",  label: "Ерөнхий",      icon: <Globe className="w-4 h-4" /> },
    { id: "banner",   label: "Баннер",        icon: <Images className="w-4 h-4" /> },
    { id: "products", label: "Бүтээгдэхүүн", icon: <Package className="w-4 h-4" /> },
    { id: "delivery", label: "Хүргэлт",       icon: <Truck className="w-4 h-4" /> },
    { id: "order",    label: "Захиалга",       icon: <ShoppingCart className="w-4 h-4" /> },
    { id: "style",    label: "Загвар",         icon: <Palette className="w-4 h-4" /> },
    { id: "qpay",     label: "QPay холболт",   icon: <CreditCard className="w-4 h-4" /> },
    { id: "macs",     label: "MACS холболт",   icon: <Plug className="w-4 h-4" /> },
];

const CONTENT: Record<Tab, React.ReactNode> = {
    general:  <GeneralTab />,
    banner:   <BannerTab />,
    products: <ProductsTab />,
    delivery: <DeliveryTab />,
    order:    <OrderTab />,
    style:    <StyleTab />,
    qpay:     <QPayTab />,
    macs:     <MacsTab />,
};

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>(() => {
        if (typeof window === "undefined") return "general";
        const saved = localStorage.getItem("adminSettingsTab") as Tab;
        return TABS.some(t => t.id === saved) ? saved : "general";
    });

    const handleTabChange = (tab: Tab) => {
        localStorage.setItem("adminSettingsTab", tab);
        setActiveTab(tab);
    };

    return (
        <div className="pb-20">
            <header className="mb-6 pt-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Тохиргоо</h2>
                <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">Системийн ерөнхий тохиргоонууд</p>
            </header>

            {/* Mobile: horizontal scroll tabs */}
            <div className="lg:hidden mb-5 -mx-1">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1 pb-1">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? "bg-teal-500/10 text-teal-500 border border-teal-500/30"
                                    : "text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border border-transparent"
                            }`}>
                            <span className={activeTab === tab.id ? "text-teal-500" : ""}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop: sidebar + content */}
            <div className="flex gap-6">
                <aside className="hidden lg:block w-48 flex-shrink-0">
                    <nav className="space-y-1 sticky top-6">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                                    activeTab === tab.id
                                        ? "bg-teal-500/10 text-teal-500"
                                        : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                                }`}>
                                <span className={activeTab === tab.id ? "text-teal-500" : ""}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <div className="flex-1 min-w-0 space-y-5">
                    <Suspense fallback={null}>
                        {CONTENT[activeTab]}
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
