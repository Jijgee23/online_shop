"use client";

import { Address } from "@/interface/order";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./auth_context";

export interface AddressInput {
    city: string;
    district: string;
    khoroo: string;
    detail: string;
    phone: string;
}

interface AddressContextType {
    getDeliveryAddress: () => Promise<AddressInput | null>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const [address, setAddress] = useState<AddressInput>({
        city: "Улаанбаатар",
        district: "",
        khoroo: "",
        detail: "",
        phone: "",
    });
    const [resolvePromise, setResolvePromise] = useState<(value: AddressInput | null) => void>();
   
    const getDeliveryAddress = () => {
        setIsOpen(true);
        return new Promise<AddressInput | null>((resolve) => {
            setResolvePromise(() => resolve);
        });
    };



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOpen(false);
        if (resolvePromise) resolvePromise(address);
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolvePromise) resolvePromise(null);
    }

    return (
        <AddressContext.Provider value={{ getDeliveryAddress  }}>
            {children}

            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl animate-in fade-in zoom-in duration-200"
                    >
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-white tracking-tight">Хүргэлтийн хаяг</h3>
                            <p className="text-zinc-500 text-sm mt-1">Захиалга баталгаажуулахын тулд хаягаа оруулна уу.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase ml-2">Хот/Аймаг</label>
                                    <input
                                        required
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-3 text-white outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase ml-2">Дүүрэг/Сум</label>
                                    <input
                                        required
                                        placeholder="Жишээ: БЗД"
                                        value={address.district}
                                        onChange={(e) => setAddress({ ...address, district: e.target.value })}
                                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-3 text-white outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase ml-2">Хороо/Баг</label>
                                <input
                                    required
                                    placeholder="Жишээ: 15-р хороо"
                                    value={address.khoroo}
                                    onChange={(e) => setAddress({ ...address, khoroo: e.target.value })}
                                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-3 text-white outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase ml-2">Дэлгэрэнгүй хаяг</label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="Байр, орц, тоот..."
                                    value={address.detail}
                                    onChange={(e) => setAddress({ ...address, detail: e.target.value })}
                                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-3 text-white outline-none focus:ring-2 focus:ring-teal-500/50 transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase ml-2">Утасны дугаар</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="88******"
                                    value={address.phone}
                                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-3 text-white outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
                            >
                                Цуцлах
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-extrabold shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                            >
                                Захиалга өгөх
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AddressContext.Provider>
    );
};

export const useAddress = () => {
    const context = useContext(AddressContext);
    if (!context) throw new Error("useAddress must be used within AddressProvider");
    return context;
};