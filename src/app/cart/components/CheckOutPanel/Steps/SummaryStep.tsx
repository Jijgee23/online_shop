import React from "react";
import { Btn, Row } from "../shared";

interface SummaryStepProps {
    cart: any;
    onNext: () => void;
}

export default function SummaryStep({ cart, onNext }: SummaryStepProps) {
    return (
        <>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Захиалгын хэсэг</h3>
            <div className="space-y-3 mb-6">
                {cart.items?.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                            {item.product?.images?.[0]?.url && <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.product.images[0].url}`} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.product?.name}</p>
                            <p className="text-xs text-slate-400">{item.quantity} ширхэг</p>
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            ₮{(Number(item.product?.price) * item.quantity).toLocaleString()}
                        </p>
                    </div>
                ))}
                {(cart.items?.length ?? 0) > 3 && (
                    <p className="text-xs text-slate-400 text-center">+ {cart.items.length - 3} бараа</p>
                )}
            </div>
            <div className="space-y-2 mb-5 border-t border-slate-100 dark:border-zinc-800 pt-4">
                <Row label="Барааны тоо" value={`${cart.totalCount} ширхэг`} />
                <Row label="Хүргэлт" value="Үнэгүй" valueClass="text-teal-500 font-semibold" />
                <div className="flex justify-between items-end pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <span className="font-bold text-slate-900 dark:text-white">Нийт дүн</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">₮{Number(cart.totalPrice).toLocaleString()}</span>
                </div>
            </div>
            <Btn onClick={onNext}>Захиалах →</Btn>
        </>
    );
}
