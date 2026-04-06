"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { AddressInput } from "@/app/context/address_context";
import { goto } from "@/utils/router";
import DropdownSelect from "@/ui/DropdownSelect";

// ─── Constants ────────────────────────────────────────────────────────────────

export const PAYMENT_METHODS = [
    { id: "QPAY", settingsKey: "payQpay", label: "QPay", desc: "QR кодоор төлөх", icon: "📱" },
    { id: "BANK_APP", settingsKey: "payBankApp", label: "Банкны апп", desc: "Шилжүүлгээр төлөх", icon: "🏦" },
    { id: "CARD", settingsKey: "payCard", label: "Картаар", desc: "Visa / Mastercard", icon: "💳" },
    { id: "ON_DELIVERY", settingsKey: "payOnDelivery", label: "Хүргэлтэд бэлнээр", desc: "Хүргэлтийн үед төлнө", icon: "💵" },
];

export const INSTANT_PAY_METHODS = ["QPAY", "CARD"];

export const BANK_INFO = { name: "Хаан Банк", account: "5000123456", holder: "ИШоп ХХК" };

export const STEPS = ["summary", "address", "payment", "pay", "done"] as const;
export type Step = typeof STEPS[number];

export const STEP_LABELS: Record<Step, string> = {
    summary: "Хэсэг", address: "Хаяг", payment: "Арга", pay: "Төлөх", done: "Дууслаа",
};

export const EMPTY_ADDR: AddressInput = { city: "Улаанбаатар", districtId: 0, khoroo: "", detail: "", phone: "" };

// ─── CheckoutPanel ────────────────────────────────────────────────────────────

export interface CheckoutPanelProps {
    cart: any;
    step: Step; setStep: (s: Step) => void;
    selectedAddressId: number | null; setSelectedAddressId: (id: number | null) => void;
    myAddresses: any[];
    paymentMethod: string; setPaymentMethod: (m: string) => void;
    note: string; setNote: (n: string) => void;
    showAddressForm: boolean; setShowAddressForm: (v: boolean) => void;
    savingAddress: boolean;
    districts: { id: number; name: string }[];
    newAddr: AddressInput; setNewAddr: React.Dispatch<React.SetStateAction<AddressInput>>;
    handleSaveNewAddress: (e: React.FormEvent) => void;
    handleConfirmOrder: (paymentConfirmed: boolean) => void;
    placing: boolean;
    orderNumber: string;
    resetCheckout: () => void;
    onStartCheckout: () => void;
}

export default function CheckoutPanel(props: CheckoutPanelProps) {
    const { districts } = props;
    const { cart, step, setStep, selectedAddressId, setSelectedAddressId, myAddresses,
        paymentMethod, setPaymentMethod, note, setNote,
        showAddressForm, setShowAddressForm, savingAddress, newAddr, setNewAddr,
        handleSaveNewAddress, handleConfirmOrder, placing, orderNumber, resetCheckout } = props;

    const [enabledMethods, setEnabledMethods] = useState<string[] | null>(null);

    useEffect(() => {
        if (step !== "payment") {
            setEnabledMethods(null); // reset so re-entry always re-fetches fresh
            return;
        }
        setEnabledMethods(null);
        fetch("/api/admin/settings", { cache: "no-store" })
            .then(r => r.json())
            .then(d => {
                const enabled = d.data
                    ? PAYMENT_METHODS.filter(m => d.data[m.settingsKey] === true).map(m => m.id)
                    : PAYMENT_METHODS.map(m => m.id);
                setEnabledMethods(enabled);
                if (paymentMethod && !enabled.includes(paymentMethod)) setPaymentMethod("");
            })
            .catch(() => { setEnabledMethods(PAYMENT_METHODS.map(m => m.id)); });
    }, [step]);

    const availableMethods = enabledMethods
        ? PAYMENT_METHODS.filter(m => enabledMethods.includes(m.id))
        : [];

    const visibleSteps = STEPS.filter(s => s !== "done");

    return (
        <>
            {/* Step bar — hidden on done */}
            {step !== "done" && (
                <div className="flex border-b border-slate-100 dark:border-slate-800">
                    {visibleSteps.map((s, i) => (
                        <div key={s} className={`flex-1 py-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors border-b-2
                            ${step === s ? "text-teal-500 border-teal-500"
                                : visibleSteps.indexOf(step) > i ? "text-teal-400/50 border-transparent"
                                    : "text-slate-400 dark:text-slate-600 border-transparent"}`}>
                            {i + 1}. {STEP_LABELS[s]}
                        </div>
                    ))}
                </div>
            )}

            <div className="p-5 sm:p-6">

                {/* 1. Summary */}
                {step === "summary" && (
                    <>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Захиалгын хэсэг</h3>
                        <div className="space-y-3 mb-6">
                            {cart.items?.slice(0, 3).map((item: any) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                        {item.product?.images?.[0]?.url && <img src={item.product.images[0].url} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.product?.name}</p>
                                        <p className="text-xs text-slate-400">{item.quantity} ширхэг</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">₮{(Number(item.product?.price) * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                            {(cart.items?.length ?? 0) > 3 && (
                                <p className="text-xs text-slate-400 text-center">+ {cart.items.length - 3} бараа</p>
                            )}
                        </div>
                        <div className="space-y-2 mb-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                            <Row label="Барааны тоо" value={`${cart.totalCount} ширхэг`} />
                            <Row label="Хүргэлт" value="Үнэгүй" valueClass="text-teal-500 font-semibold" />
                            <div className="flex justify-between items-end pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span className="font-bold text-slate-900 dark:text-white">Нийт дүн</span>
                                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">₮{Number(cart.totalPrice).toLocaleString()}</span>
                            </div>
                        </div>
                        <Btn onClick={() => setStep("address")}>Захиалах →</Btn>
                    </>
                )}

                {/* 2. Address */}
                {step === "address" && (
                    <>
                        <StepHeader title="Хүргэлтийн хаяг" onBack={() => { setStep("summary"); setShowAddressForm(false); }} />
                        {!showAddressForm ? (
                            <>
                                <div className="space-y-2 mb-3 max-h-52 overflow-y-auto pr-1">
                                    {myAddresses.map(addr => (
                                        <RadioCard key={addr.id} selected={selectedAddressId === addr.id} onClick={() => setSelectedAddressId(addr.id)}>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{addr.district?.name}, {addr.khoroo}-р хороо</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{addr.detail}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">📞 {addr.phone}</p>
                                        </RadioCard>
                                    ))}
                                    <RadioCard selected={selectedAddressId === null} onClick={() => setSelectedAddressId(null)}>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Өөрөө авч явна</p>
                                        <p className="text-xs text-slate-500">Хүргэлтгүйгээр авна</p>
                                    </RadioCard>
                                </div>
                                <button onClick={() => setShowAddressForm(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:text-teal-500 hover:border-teal-400 transition-all text-sm font-semibold">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                    Шинэ хаяг нэмэх
                                </button>
                                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Тэмдэглэл (заавал биш)..." rows={2}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 resize-none mb-4 placeholder:text-slate-400 text-slate-800 dark:text-white" />
                                <Btn onClick={() => setStep("payment")}>Үргэлжлэх →</Btn>
                            </>
                        ) : (
                            <form onSubmit={handleSaveNewAddress} className="space-y-3">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Шинэ хаяг нэмэх</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="mt-1"> <AddrInput label="Хот" value={newAddr.city} onChange={v => setNewAddr(a => ({ ...a, city: v }))} required /></div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Дүүрэг</label>
                                        <DropdownSelect
                                            required
                                            value={newAddr.districtId || ""}
                                            onChange={id => setNewAddr(a => ({ ...a, districtId: Number(id) }))}
                                            options={districts.map(d => ({ id: d.id, label: d.name }))}
                                            placeholder="Дүүрэг сонгох"
                                        />
                                    </div>
                                </div>
                                <AddrInput label="Хороо" placeholder="15-р хороо" value={newAddr.khoroo} onChange={v => setNewAddr(a => ({ ...a, khoroo: v }))} required />
                                <AddrInput label="Дэлгэрэнгүй" placeholder="Байр, орц, тоот..." value={newAddr.detail} onChange={v => setNewAddr(a => ({ ...a, detail: v }))} required />
                                <AddrInput label="Утас" placeholder="88******" type="tel" value={newAddr.phone} onChange={v => setNewAddr(a => ({ ...a, phone: v }))} required />
                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => { setShowAddressForm(false); setNewAddr(EMPTY_ADDR); }}
                                        className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Буцах
                                    </button>
                                    <button type="submit" disabled={savingAddress}
                                        className="flex-1 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold transition-colors disabled:opacity-50">
                                        {savingAddress ? "Хадгалж байна..." : "Хадгалах"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}

                {/* 3. Payment method */}
                {step === "payment" && (
                    <>
                        <StepHeader title="Төлбөрийн хэлбэр" onBack={() => setStep("address")} />
                        <div className="space-y-2 mb-5">
                            {enabledMethods === null ? (
                                <div className="space-y-2 animate-pulse">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
                                </div>
                            ) : availableMethods.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-6">Төлбөрийн арга тохируулагдаагүй байна</p>
                            ) : availableMethods.map(pm => (
                                <RadioCard key={pm.id} selected={paymentMethod === pm.id} onClick={() => setPaymentMethod(pm.id)}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{pm.icon}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{pm.label}</p>
                                            <p className="text-xs text-slate-500">{pm.desc}</p>
                                        </div>
                                        {INSTANT_PAY_METHODS.includes(pm.id) && (
                                            <span className="ml-auto text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full">
                                                Шуурхай
                                            </span>
                                        )}
                                    </div>
                                </RadioCard>
                            ))}
                        </div>
                        <Btn disabled={!paymentMethod || enabledMethods === null} onClick={() => setStep("pay")}>Үргэлжлэх →</Btn>
                    </>
                )}

                {/* 4. Pay */}
                {step === "pay" && (
                    <PayStep
                        cart={cart}
                        paymentMethod={paymentMethod}
                        myAddresses={myAddresses}
                        selectedAddressId={selectedAddressId}
                        placing={placing}
                        onBack={() => setStep("payment")}
                        onConfirm={handleConfirmOrder}
                    />
                )}

                {/* 5. Done */}
                {step === "done" && (
                    <SuccessScreen
                        orderNumber={orderNumber}
                        paymentMethod={paymentMethod}
                        total={Number(cart?.totalPrice ?? 0)}
                        onDone={() => { resetCheckout(); goto("/order"); }}
                    />
                )}
            </div>
        </>
    );
}

// ─── Pay step ─────────────────────────────────────────────────────────────────

function PayStep({ cart, paymentMethod, myAddresses, selectedAddressId, placing, onBack, onConfirm }: {
    cart: any; paymentMethod: string; myAddresses: any[]; selectedAddressId: number | null;
    placing: boolean; onBack: () => void; onConfirm: (confirmed: boolean) => void;
}) {
    return (
        <>
            <StepHeader title="Төлбөр хийх" onBack={onBack} />

            {paymentMethod === "QPAY" && <QPayScreen cart={cart} placing={placing} onConfirm={onConfirm} />}
            {paymentMethod === "BANK_APP" && <BankTransferScreen cart={cart} placing={placing} onConfirm={onConfirm} />}
            {paymentMethod === "CARD" && <CardScreen cart={cart} placing={placing} onConfirm={onConfirm} />}
            {paymentMethod === "ON_DELIVERY" && <OnDeliveryScreen cart={cart} placing={placing} onConfirm={onConfirm} />}

            {/* Recap */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mt-4 space-y-1.5 text-sm">
                <Row label="Дүн" value={`₮${Number(cart.totalPrice).toLocaleString()}`} />
                <Row label="Хаяг" value={selectedAddressId ? (myAddresses.find((a: any) => a.id === selectedAddressId)?.district?.name ?? "—") : "Өөрөө авна"} />
                <Row label="Төлбөр" value={PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label ?? "—"} />
            </div>
        </>
    );
}

// ─── QPAY screen ──────────────────────────────────────────────────────────────

function QPayScreen({ cart, placing, onConfirm }: { cart: any; placing: boolean; onConfirm: (c: boolean) => void }) {
    const [status, setStatus] = useState<"idle" | "checking" | "confirmed">("idle");
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef<any>(null);

    const startCheck = () => {
        if (status !== "idle") return;
        setStatus("checking");
        setCountdown(5);
        timerRef.current = setInterval(() => {
            setCountdown(p => {
                if (p <= 1) {
                    clearInterval(timerRef.current);
                    setStatus("confirmed");
                    return 0;
                }
                return p - 1;
            });
        }, 1000);
    };

    useEffect(() => () => clearInterval(timerRef.current), []);

    return (
        <div className="space-y-4 mb-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">QPay апп-аар доорх QR кодыг уншуулна уу</p>

            {/* QR code */}
            <div className={`mx-auto w-44 h-44 bg-white rounded-2xl border-2 flex items-center justify-center shadow-inner transition-all p-3 ${status === "confirmed" ? "border-teal-400" : "border-slate-200 dark:border-slate-700"}`}>
                {status === "confirmed" ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-xs font-bold text-teal-600">Баталгаажлаа</p>
                    </div>
                ) : (
                    <QRCode
                        value={`bank:${BANK_INFO.account};name:${BANK_INFO.holder};amount:${cart.totalPrice}`}
                        size={148}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                        level="M"
                    />
                )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Төлөх дүн</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">₮{Number(cart.totalPrice).toLocaleString()}</p>
            </div>

            {status === "idle" && (
                <Btn onClick={startCheck}>Төлбөр шалгах</Btn>
            )}
            {status === "checking" && (
                <div className="flex flex-col items-center gap-2 py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500" />
                    <p className="text-sm text-slate-500">Шалгаж байна... {countdown}с</p>
                </div>
            )}
            {status === "confirmed" && (
                <Btn onClick={() => onConfirm(true)} disabled={placing} color="bg-teal-500 hover:bg-teal-400">
                    {placing ? "Үүсгэж байна..." : "Захиалга баталгаажуулах ✓"}
                </Btn>
            )}
        </div>
    );
}

// ─── Bank transfer screen ─────────────────────────────────────────────────────

function BankTransferScreen({ cart, placing, onConfirm }: { cart: any; placing: boolean; onConfirm: (c: boolean) => void }) {
    const [copied, setCopied] = useState<string | null>(null);
    const ref = `ORDER-${Date.now().toString().slice(-6)}`;

    const copy = (val: string, key: string) => {
        navigator.clipboard.writeText(val).catch(() => { });
        setCopied(key);
        setTimeout(() => setCopied(null), 1500);
    };

    const rows = [
        { label: "Банк", value: BANK_INFO.name, key: "bank" },
        { label: "Дансны дугаар", value: BANK_INFO.account, key: "acc" },
        { label: "Хүлээн авагч", value: BANK_INFO.holder, key: "holder" },
        { label: "Дүн", value: `${Number(cart.totalPrice).toLocaleString()}`, key: "amt" },
        { label: "Гүйлгээний утга", value: ref, key: "ref" },
    ];

    return (
        <div className="space-y-3 mb-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">Доорх дансанд шилжүүлнэ үү</p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
                {rows.map(r => (
                    <div key={r.key} className="flex justify-between items-center px-4 py-3">
                        <span className="text-xs text-slate-500">{r.label}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">{r.label === "Дүн" ? `₮${r.value}` : r.value}</span>
                            <button onClick={() => copy(r.value, r.key)}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:text-teal-600 transition-colors">
                                {copied === r.key ? "✓" : "Хуулах"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 text-xs text-amber-700 dark:text-amber-300">
                ⚠️ Гүйлгээний утгыг заавал оруулах шаардлагатай. Шилжүүлсний дараа захиалга үүснэ, админ баталгаажуулна.
            </div>
            <Btn onClick={() => onConfirm(false)} disabled={placing} color="bg-teal-500 hover:bg-teal-400">
                {placing ? "Үүсгэж байна..." : "Шилжүүлсэн, захиалга үүсгэх"}
            </Btn>
        </div>
    );
}

// ─── Card screen ──────────────────────────────────────────────────────────────

function CardScreen({ cart, placing, onConfirm }: { cart: any; placing: boolean; onConfirm: (c: boolean) => void }) {
    const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
    const [processing, setProcessing] = useState<"idle" | "processing" | "confirmed">("idle");

    const isValid = card.number.length === 16 && card.expiry.length === 5 && card.cvv.length === 3 && card.name.length > 0;

    const handlePay = async () => {
        if (!isValid) return;
        setProcessing("processing");
        await new Promise(r => setTimeout(r, 2000));
        setProcessing("confirmed");
    };

    return (
        <div className="space-y-3 mb-2">
            {/* Card preview */}
            <div className="h-28 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                <div className="flex justify-between items-start">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Дебит карт</span>
                    <span className="text-white/80 text-sm font-bold">VISA</span>
                </div>
                <div>
                    <p className="text-white font-mono text-sm tracking-widest">
                        {card.number ? card.number.replace(/(.{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}
                    </p>
                    <p className="text-white/60 text-xs mt-1">{card.name || "CARD HOLDER"}</p>
                </div>
            </div>

            {processing === "idle" && (
                <>
                    <input placeholder="Картын дугаар" value={card.number} maxLength={16}
                        onChange={e => setCard(c => ({ ...c, number: e.target.value.replace(/\D/g, "") }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 font-mono text-slate-800 dark:text-white" />
                    <input placeholder="Эзэмшигчийн нэр" value={card.name}
                        onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-white" />
                    <div className="grid grid-cols-2 gap-3">
                        <input placeholder="MM/YY" value={card.expiry} maxLength={5}
                            onChange={e => { let v = e.target.value.replace(/\D/g, ""); if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2); setCard(c => ({ ...c, expiry: v })); }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 font-mono text-slate-800 dark:text-white" />
                        <input placeholder="CVV" type="password" value={card.cvv} maxLength={3}
                            onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "") }))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 font-mono text-slate-800 dark:text-white" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 text-center">
                        <p className="text-xs text-slate-500 mb-0.5">Картнаас гарах дүн</p>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white">₮{Number(cart.totalPrice).toLocaleString()}</p>
                    </div>
                    <Btn onClick={handlePay} disabled={!isValid}>Төлөх ₮{Number(cart.totalPrice).toLocaleString()}</Btn>
                </>
            )}

            {processing === "processing" && (
                <div className="py-6 flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 dark:border-slate-700 border-t-teal-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl">💳</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-slate-800 dark:text-white text-sm">Баталгаажуулж байна...</p>
                        <p className="text-xs text-slate-400 mt-1">Картын мэдээлэл шалгаж байна</p>
                    </div>
                    <div className="flex gap-1.5">
                        {["Шалгаж байна", "Баталгаажуулж байна", "Дуусаж байна"].map((s, i) => (
                            <span key={i} className="flex items-center gap-1 text-[10px] text-slate-400">
                                <div className={`w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse`} style={{ animationDelay: `${i * 200}ms` }} />
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {processing === "confirmed" && (
                <div className="space-y-4">
                    <div className="py-4 flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="font-bold text-teal-600 dark:text-teal-400">Картаар амжилттай төллөө</p>
                        <p className="text-xs text-slate-400">₮{Number(cart.totalPrice).toLocaleString()} гарсан</p>
                    </div>
                    <Btn onClick={() => onConfirm(true)} disabled={placing} color="bg-teal-500 hover:bg-teal-400">
                        {placing ? "Үүсгэж байна..." : "Захиалга баталгаажуулах ✓"}
                    </Btn>
                </div>
            )}
        </div>
    );
}

// ─── On-delivery screen ───────────────────────────────────────────────────────

function OnDeliveryScreen({ cart, placing, onConfirm }: { cart: any; placing: boolean; onConfirm: (c: boolean) => void }) {
    return (
        <div className="space-y-4 mb-2">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 space-y-2">
                <p className="text-base">💵</p>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Бэлэн мөнгөөр төлнө</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                    Бараагаа хүлээн авах үед <strong>₮{Number(cart.totalPrice).toLocaleString()}</strong>-г бэлнээр бэлтгэнэ үү.
                </p>
            </div>
            <Btn onClick={() => onConfirm(false)} disabled={placing} color="bg-teal-500 hover:bg-teal-400">
                {placing ? "Үүсгэж байна..." : "Захиалах →"}
            </Btn>
        </div>
    );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ orderNumber, paymentMethod, total, onDone }: {
    orderNumber: string; paymentMethod: string; total: number; onDone: () => void;
}) {
    const isPaid = INSTANT_PAY_METHODS.includes(paymentMethod);
    const pm = PAYMENT_METHODS.find(p => p.id === paymentMethod);

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
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
                    {isPaid ? "Төлбөр амжилттай!" : "Захиалга хүлээн авлаа!"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isPaid ? "Таны захиалга баталгаажлаа" : "Админ баталгаажуулмагц мэдэгдэнэ"}
                </p>
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
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{pm?.icon} {pm?.label}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Төлөв</span>
                    <span className={`font-bold ${isPaid ? "text-teal-500" : "text-yellow-500"}`}>
                        {isPaid ? "✓ Төлөгдсөн" : "⏳ Хүлээгдэж байна"}
                    </span>
                </div>
            </div>

            <Btn onClick={onDone} color="bg-teal-500 hover:bg-teal-400">Захиалга харах →</Btn>
        </div>
    );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function StepHeader({ title, onBack }: { title: string; onBack: () => void }) {
    return (
        <div className="flex items-center gap-2 mb-5">
            <button onClick={onBack} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
    );
}

function RadioCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} className={`w-full text-left p-3 sm:p-4 rounded-2xl border transition-all
            ${selected ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20" : "border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700"}`}>
            <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${selected ? "border-teal-500" : "border-slate-300 dark:border-slate-600"}`}>
                    {selected && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                </div>
                <div className="flex-1">{children}</div>
            </div>
        </button>
    );
}

function Btn({ onClick, disabled, children, color, className }: {
    onClick?: () => void; disabled?: boolean; children: React.ReactNode; color?: string; className?: string;
}) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold text-white text-sm sm:text-base transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
                ${color ?? "bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500"} ${className ?? ""}`}>
            {children}
        </button>
    );
}

function Row({ label, value, valueClass = "font-semibold text-slate-900 dark:text-white" }: {
    label: string; value: string; valueClass?: string;
}) {
    return (
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>{label}</span><span className={valueClass}>{value}</span>
        </div>
    );
}


function AddrInput({ label, value, onChange, placeholder, type = "text", required }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/30 placeholder:text-slate-400" />
        </div>
    );
}
