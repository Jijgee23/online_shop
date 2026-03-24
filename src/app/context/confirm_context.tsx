"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ConfirmContextType {
    confirm: (message: string, title?: string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({ title: "", message: "" });
    const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>();

    const confirm = (message: string, title: string = "Баталгаажуулалт") => {
        setIsOpen(true);
        setConfig({ title, message });
        return new Promise<boolean>((resolve) => {
            setResolvePromise(() => resolve);
        });
    };

    const handleClose = (result: boolean) => {
        setIsOpen(false);
        if (resolvePromise) resolvePromise(result);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Модал дизайн (Tailwind ашиглав) */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">{config.title}</h3>
                        <p className="text-zinc-400 mb-8 leading-relaxed">{config.message}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleClose(false)}
                                className="flex-1 px-6 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
                            >
                                Үгүй
                            </button>
                            <button
                                onClick={() => handleClose(true)}
                                className="flex-1 px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-bold transition-all active:scale-95 shadow-lg shadow-teal-500/20"
                            >
                                Тийм
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (context === undefined) {
        throw new Error("useConfirm must be used within ConfirmProvider");
    }
    return context;
};