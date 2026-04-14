"use client";

import { goto } from "@/utils/router";
import { CheckoutPanelProps, STEPS, STEP_LABELS } from "./shared";
import SummaryStep from "./Steps/SummaryStep";
import AddressStep from "./Steps/AddressStep";
import PayStep from "./Steps/PayStep";
import SuccessStep from "./Steps/SuccessStep";
import { useAddress } from "@/app/context/address_context";
import { useEffect } from "react";

export default function CheckoutPanel(props: CheckoutPanelProps) {
    const {
        cart, step, setStep,
        selectedAddressId, setSelectedAddressId, myAddresses,
        note, setNote,
        showAddressForm, setShowAddressForm, savingAddress,
        districts, newAddr, setNewAddr, handleSaveNewAddress,
        onQPayDone,
        orderNumber, resetCheckout,
    } = props;
    const { fetchAddress } = useAddress()
    const visibleSteps = STEPS.filter(s => s !== "done");
    useEffect(() => {
        fetchAddress
    }, [])
    return (
        <>
            {step !== "done" && (
                <div className="flex border-b border-slate-100 dark:border-zinc-800">
                    {visibleSteps.map((s, i) => (
                        <div key={s} className={`flex-1 py-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors border-b-2
                            ${step === s
                                ? "text-teal-500 border-teal-500"
                                : visibleSteps.indexOf(step) > i
                                    ? "text-teal-400/50 border-transparent"
                                    : "text-slate-400 dark:text-zinc-600 border-transparent"}`}>
                            {i + 1}. {STEP_LABELS[s]}
                        </div>
                    ))}
                </div>
            )}

            <div className="p-5 sm:p-6">
                {step === "summary" && (
                    <SummaryStep cart={cart} onNext={() => setStep("address")} />
                )}

                {step === "address" && (
                    <AddressStep
                        myAddresses={myAddresses}
                        selectedAddressId={selectedAddressId}
                        setSelectedAddressId={setSelectedAddressId}
                        note={note} setNote={setNote}
                        showAddressForm={showAddressForm} setShowAddressForm={setShowAddressForm}
                        savingAddress={savingAddress}
                        districts={districts}
                        newAddr={newAddr} setNewAddr={setNewAddr}
                        handleSaveNewAddress={handleSaveNewAddress}
                        onBack={() => { setStep("summary"); setShowAddressForm(false); }}
                        onNext={() => setStep("pay")}
                    />
                )}

                {step === "pay" && (
                    <PayStep
                        cart={cart}
                        myAddresses={myAddresses}
                        selectedAddressId={selectedAddressId}
                        note={note}
                        onBack={() => setStep("address")}
                        onDone={onQPayDone}
                    />
                )}

                {step === "done" && (
                    <SuccessStep
                        orderNumber={orderNumber}
                        total={Number(cart?.totalPrice ?? 0)}
                        onDone={() => { resetCheckout(); goto("/order"); }}
                    />
                )}
            </div>
        </>
    );
}
