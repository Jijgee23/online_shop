import React from "react";
import { imgUrl } from "@/utils/imgUrl";
import { useSettings } from "@/app/context/settings_context";
import { Btn, Row } from "../shared";

interface SummaryStepProps {
    cart: any;
    onNext: () => void;
}

export default function SummaryStep({ cart, onNext }: SummaryStepProps) {
    const { settings } = useSettings();
    const total = Number(cart.totalPrice);
    const maxOrderValue = settings.maxOrderValue || 0;
    const overLimit = maxOrderValue > 0 && total > maxOrderValue;

    return (
        <>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Захиалгын хэсэг</h3>
            <div className="space-y-3 mb-6">
                {cart.items?.slice(0, 3).map((item: any) => {
                    const unit = item.productVariant?.price != null ? Number(item.productVariant.price)
                        : item.productStock?.price != null ? Number(item.productStock.price)
                        : Number(item.product?.price);
                    const variantLabel = item.productVariant
                        ? (item.productVariant.values ?? []).map((v: any) => v.attributeValue?.value).filter(Boolean).join(" / ")
                        : [item.productStock?.color?.name, item.productStock?.size?.sizeName].filter(Boolean).join(" / ");
                    return (
                        <div key={item.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                {item.product?.images?.[0]?.url && <img src={imgUrl(item.product.images[0].url)} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.product?.name}</p>
                                <p className="text-xs text-slate-400">
                                    {variantLabel ? `${variantLabel} · ` : ""}{item.quantity} ширхэг
                                </p>
                            </div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                ₮{(unit * item.quantity).toLocaleString()}
                            </p>
                        </div>
                    );
                })}
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
            {overLimit && (
                <p className="mb-3 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2.5 leading-relaxed">
                    Захиалгын дээд хязгаар ₮{maxOrderValue.toLocaleString()}. Сагсны дүнгээ багасгана уу.
                </p>
            )}
            <Btn onClick={onNext} disabled={overLimit}>Захиалах →</Btn>
        </>
    );
}
