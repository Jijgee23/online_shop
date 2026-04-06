"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface StoreSettings {
    storeName:            string;
    storeDesc:            string;
    phone:                string;
    email:                string;
    address:              string;
    showStatProducts:     boolean;
    showStatOrders:       boolean;
    showStatSatisfaction: boolean;
    showStatDelivery:     boolean;
    payQpay:              boolean;
    payBankApp:           boolean;
    payCard:              boolean;
    payOnDelivery:        boolean;
}

const DEFAULT: StoreSettings = {
    storeName:            "IShop",
    storeDesc:            "",
    phone:                "",
    email:                "",
    address:              "",
    showStatProducts:     true,
    showStatOrders:       true,
    showStatSatisfaction: true,
    showStatDelivery:     true,
    payQpay:              true,
    payBankApp:           true,
    payCard:              true,
    payOnDelivery:        false,
};

interface SettingsContextType {
    settings: StoreSettings;
    loading:  boolean;
    refresh:  () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<StoreSettings>(DEFAULT);
    const [loading, setLoading]   = useState(true);

    const fetch_ = () => {
        setLoading(true);
        fetch("/api/settings")
            .then(r => r.json())
            .then(d => setSettings({ ...DEFAULT, ...d }))
            .catch(() => {})
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
