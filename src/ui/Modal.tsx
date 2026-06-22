"use client";
import { X } from "lucide-react";
import React from "react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
    zIndex?: string;
}

export function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = "max-w-sm", zIndex = "z-50" }: ModalProps) {
    if (!open) return null;
    return (
        <div
            className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/60 backdrop-blur-sm p-4`}
            onClick={onClose}
        >
            <div
                className={`w-full ${maxWidth} bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl shadow-2xl overflow-hidden`}
                onClick={e => e.stopPropagation()}
            >
                {(title || subtitle) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
                        <div>
                            {title && <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>}
                            {subtitle && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{subtitle}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <div className="p-6">{children}</div>
                {footer && (
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-zinc-800">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
