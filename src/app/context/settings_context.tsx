"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface StoreSettings {
    storeName: string;
    storeDesc: string;
    phone: string;
    email: string;
    address: string;
    showStatProducts: boolean;
    showStatOrders: boolean;
    showStatSatisfaction: boolean;
    showStatDelivery: boolean;
    payQpay: boolean;
    facebookUrl: string;
    instagramUrl: string;
}

const DEFAULT: StoreSettings = {
    storeName: "IShop",
    storeDesc: "",
    phone: "",
    email: "",
    address: "",
    showStatProducts: true,
    showStatOrders: true,
    showStatSatisfaction: true,
    showStatDelivery: true,
    payQpay: true,
    facebookUrl: "",
    instagramUrl: "",
};

interface SettingsContextType {
    settings: StoreSettings;
    loading: boolean;
    refresh: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<StoreSettings>(DEFAULT);
    const [loading, setLoading] = useState(true);

    const fetch_ = async () => {
        setLoading(true);
        await fetch("/api/settings")
            .then(async r => await r.json())
            .then(d => setSettings({ ...DEFAULT, ...d }))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch_(); }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refresh: fetch_ }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
    return ctx;
}
