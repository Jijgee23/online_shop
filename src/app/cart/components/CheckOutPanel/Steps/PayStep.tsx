"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Btn, RadioCard, Row, StepHeader } from "../shared";
import toast from "react-hot-toast";

interface QRData {
    invoice_id: string;
    qr_text: string;
    qr_image: string;
    urls: QpayUrl[];
}

interface QpayUrl {
    name: string;
    description: string;
    logo: string;
    link: string;
}

interface PayStepProps {
    cart: any;
    myAddresses: any[];
    selectedAddressId: number | null;
    note: string;
    onBack: () => void;
    onDone: (orderNumber: string) => void;
}

type PayMode = "loading" | "select" | "qpay" | "delivery";

export default function PayStep({ cart, myAddresses, selectedAddressId, note, onBack, onDone }: PayStepProps) {
    const [mode, setMode] = useState<PayMode>("loading");
    const [payQpay, setPayQpay] = useState(false);
    const [payOnDelivery, setPayOnDelivery] = useState(false);

    useEffect(() => {
        fetch("/api/settings")
            .then(r => r.json())
            .then(d => {
                const qpay = d.payQpay ?? true;
                const delivery = d.payOnDelivery ?? false;
                setPayQpay(qpay);
                setPayOnDelivery(delivery);
                if (qpay && !delivery) setMode("qpay");
                else if (!qpay && delivery) setMode("delivery");
                else if (qpay && delivery) setMode("select");
                else setMode("select");
            })
            .catch(() => { setPayQpay(true); setMode("qpay"); });
    }, []);

    const handleBack = () => {
        if ((mode === "qpay" || mode === "delivery") && payQpay && payOnDelivery) {
            setMode("select");
        } else {
            onBack();
        }
    };

    const selectedAddress = myAddresses.find((a: any) => a.id === selectedAddressId);

    const summaryRow = (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mt-4 space-y-1.5 text-sm">
            <Row label="Дүн" value={`₮${Number(cart.totalPrice).toLocaleString()}`} />
            <Row label="Хаяг" value={selectedAddressId ? (selectedAddress?.district?.name ?? "—") : "Өөрөө авна"} />
        </div>
    );

    return (
        <>
            <StepHeader title="Төлбөр" onBack={handleBack} />

            {mode === "loading" && (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500" />
                </div>
            )}

            {mode === "select" && (
                <>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Төлбөрийн хэлбэрээ сонгоно уу</p>
                    <div className="space-y-2 mb-4">
                        {payQpay && (
                            <RadioCard selected={false} onClick={() => setMode("qpay")}>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">📱</span>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">QPay</p>
                                        <p className="text-xs text-slate-500">QR кодоор шуурхай төлөх</p>
                                    </div>
                                    <span className="ml-auto text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full">Шуурхай</span>
                                </div>
                            </RadioCard>
                        )}
                        {payOnDelivery && (
                            <RadioCard selected={false} onClick={() => setMode("delivery")}>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">💵</span>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Хүргэлтийн үеэр төлөх</p>
                                        <p className="text-xs text-slate-500">Хүргэлтэнд ирэхэд бэлнээр эсвэл картаар</p>
                                    </div>
                                </div>
                            </RadioCard>
                        )}
                    </div>
                    {summaryRow}
                </>
            )}

            {mode === "qpay" && (
                <>
                    <QPayScreen cart={cart} addressId={selectedAddressId} onDone={onDone} />
                    {summaryRow}
                </>
            )}

            {mode === "delivery" && (
                <DeliveryScreen
                    cart={cart}
                    addressId={selectedAddressId}
                    note={note}
                    address={selectedAddress}
                    onDone={onDone}
                />
            )}
        </>
    );
}

// ─── QPay QR screen ───────────────────────────────────────────────────────────

function QPayScreen({ cart, addressId, onDone }: { cart: any; addressId: number | null; onDone: (orderNumber: string) => void }) {
    const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
    const [qrData, setQrData] = useState<QRData | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const [retry, setRetry] = useState(0);
    const [checking, setChecking] = useState(false);
    const doneRef = useRef(false);

    useEffect(() => {
        setPhase("loading");
        setErrMsg(null);
        let cancelled = false;
        const create = async () => {
            try {
                const res = await fetch("/api/invoice", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: Number(cart.totalPrice), cartId: cart.id, addressId }),
                });
                const data = await res.json();
                if (cancelled) return;
                if (!res.ok || !data.invoice_id) {
                    setErrMsg(data.error ?? "Invoice үүсгэхэд алдаа гарлаа");
                    setPhase("error");
                    return;
                }
                setQrData(data);
                setPhase("ready");
            } catch {
                if (!cancelled) { setErrMsg("Холболтын алдаа гарлаа"); setPhase("error"); }
            }
        };
        create();
        return () => { cancelled = true; };
    }, [retry]);

    useEffect(() => {
        const handleFcm = (e: Event) => {
            const data = (e as CustomEvent<Record<string, string>>).detail;
            if (data?.type === "qpay_paid" && data.orderNumber && !doneRef.current) {
                doneRef.current = true;
                onDone(data.orderNumber);
            }
        };
        window.addEventListener("fcm-message", handleFcm);
        return () => window.removeEventListener("fcm-message", handleFcm);
    }, [onDone]);

    const checkPayment = async () => {
        const invoiceId = qrData?.invoice_id;
        if (!invoiceId) { toast.error("Invoice ID олдсонгүй."); return; }
        setChecking(true);
        try {
            const res = await fetch("/api/invoice/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoiceId }),
            });
            const data = await res.json();
            if (!data.paid) {
                toast.error(data.error ?? "Төлбөр баталгаажаагүй байна. QR кодыг уншуулсан эсэхээ шалгаад дахин оролдоно уу.");
                return;
            }
            if (data.orderNumber && !doneRef.current) {
                doneRef.current = true;
                onDone(data.orderNumber);
            }
        } catch {
            toast.error("Алдаа гарлаа");
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="space-y-4 mb-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                QPay апп-аар доорх QR кодыг уншуулна уу
            </p>
            <div className={`mx-auto w-44 h-44 bg-white rounded-2xl border-2 flex items-center justify-center shadow-inner p-3 transition-colors
                ${phase === "loading" || phase === "error" ? "border-slate-200 dark:border-slate-700" : "border-teal-200"}`}>
                {phase === "loading" && <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500" />}
                {phase === "error" && <p className="text-xs text-red-500 text-center px-2">{errMsg}</p>}
                {phase === "ready" && qrData && <QRCode value={qrData.qr_text} size={148} bgColor="#ffffff" fgColor="#0f172a" level="M" />}
            </div>

            {phase === "ready" && qrData?.urls && qrData.urls.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-3">
                    <p className="text-[11px] text-slate-400 mb-2 text-center">Банкны апп-аар төлөх</p>
                    <div className="grid grid-cols-4 gap-2">
                        {qrData.urls.map((e) => (
                            <a key={e.name} href={e.link} target="_blank" rel="noopener noreferrer"
                                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={e.logo} alt={e.description} className="w-10 h-10 rounded-xl object-contain" />
                                <span className="text-[9px] text-slate-400 text-center leading-tight line-clamp-2">{e.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3">
                <p className="text-xs text-slate-500 mb-1">Төлөх дүн</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">₮{Number(cart.totalPrice).toLocaleString()}</p>
            </div>

            {phase === "ready" && (
                <>
                    <Btn onClick={checkPayment} disabled={checking}>
                        {checking ? "Шалгаж байна..." : "Төлбөр шалгах"}
                    </Btn>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        Төлбөр хүлээж байна...
                    </div>
                </>
            )}
            {phase === "error" && <Btn onClick={() => setRetry(r => r + 1)}>Дахин оролдох</Btn>}
        </div>
    );
}

// ─── Pay-on-delivery confirmation screen ─────────────────────────────────────

function DeliveryScreen({ cart, addressId, note, address, onDone }: {
    cart: any;
    addressId: number | null;
    note: string;
    address: any;
    onDone: (orderNumber: string) => void;
}) {
    const [placing, setPlacing] = useState(false);

    const placeOrder = async () => {
        setPlacing(true);
        try {
            const res = await fetch("/api/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cartId: cart.id,
                    addressId,
                    paymentMethod: "ON_DELIVERY",
                    note,
                    paymentConfirmed: false,
                }),
            });
            const data = await res.json();
            if (res.ok && data.order?.orderNumber) {
                onDone(data.order.orderNumber);
            } else {
                toast.error(data.message ?? "Захиалга өгөхөд алдаа гарлаа");
            }
        } catch {
            toast.error("Алдаа гарлаа");
        } finally {
            setPlacing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">💵 Хүргэлтийн үеэр төлөх</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                    Захиалгыг хүлээн авахдаа бэлнээр эсвэл картаар төлнө үү
                </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2 text-sm">
                <Row label="Нийт дүн" value={`₮${Number(cart.totalPrice).toLocaleString()}`} />
                <Row label="Барааны тоо" value={`${cart.totalCount} ширхэг`} />
                {address && (
                    <Row label="Хаяг" value={`${address.district?.name ?? ""}${address.khoroo ? `, ${address.khoroo}-р хороо` : ""}`} />
                )}
            </div>

            <Btn onClick={placeOrder} disabled={placing}>
                {placing ? "Захиалга өгч байна..." : "Захиалга баталгаажуулах →"}
            </Btn>
        </div>
    );
}
