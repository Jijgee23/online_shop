import React from "react";
import { Btn } from "../shared";

interface SuccessStepProps {
    orderNumber: string;
    total: number;
    onDone: () => void;
}

export default function SuccessStep({ orderNumber, total, onDone }: SuccessStepProps) {
    return (
        <div className="text-center py-4 space-y-5">
            <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center shadow-2xl shadow-teal-500/40 mx-auto">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping" />
            </div>

            <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">Төлбөр амжилттай!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Таны захиалга баталгаажлаа</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-left space-y-2.5 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-400">Захиалгын дугаар</span>
                    <span className="font-mono font-bold text-teal-500">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Нийт дүн</span>
                    <span className="font-bold text-slate-800 dark:text-white">₮{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Төлбөрийн арга</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">📱 QPay</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Төлөв</span>
                    <span className="font-bold text-teal-500">✓ Төлөгдсөн</span>
                </div>
            </div>

            <Btn onClick={onDone} color="bg-teal-500 hover:bg-teal-400">Захиалга харах →</Btn>
        </div>
    );
}
