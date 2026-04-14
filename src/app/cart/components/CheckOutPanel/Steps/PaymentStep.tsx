// "use client";

// import React, { useEffect, useState } from "react";
// import { Btn, StepHeader, RadioCard, PAYMENT_METHODS } from "../shared";

// interface PaymentStepProps {
//     paymentMethod: string;
//     setPaymentMethod: (m: string) => void;
//     onBack: () => void;
//     onNext: () => void;
// }

// export default function PaymentStep({ paymentMethod, setPaymentMethod, onBack, onNext }: PaymentStepProps) {
//     const [enabledMethods, setEnabledMethods] = useState<string[] | null>(null);

//     useEffect(() => {
//         setEnabledMethods(null);
//         fetch("/api/admin/settings", { cache: "no-store" })
//             .then(r => r.json())
//             .then(d => {
//                 const enabled = d.data
//                     ? PAYMENT_METHODS.filter(m => d.data[m.settingsKey] === true).map(m => m.id)
//                     : PAYMENT_METHODS.map(m => m.id);
//                 setEnabledMethods(enabled);
//                 if (paymentMethod && !enabled.includes(paymentMethod)) setPaymentMethod("");
//             })
//             .catch(() => setEnabledMethods(PAYMENT_METHODS.map(m => m.id)));
//     }, []);

   
//     const availableMethods = enabledMethods
//         ? PAYMENT_METHODS.filter(m => enabledMethods.includes(m.id))
//         : [];

//     return (
//         <>
//             <StepHeader title="Төлбөрийн хэлбэр" onBack={onBack} />
//             <div className="space-y-2 mb-5">
//                 {enabledMethods === null ? (
//                     <div className="space-y-2 animate-pulse">
//                         {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
//                     </div>
//                 ) : availableMethods.length === 0 ? (
//                     <p className="text-sm text-slate-400 text-center py-6">Төлбөрийн арга тохируулагдаагүй байна</p>
//                 ) : availableMethods.map(pm => (
//                     <RadioCard key={pm.id} selected={paymentMethod === pm.id} onClick={() => setPaymentMethod(pm.id)}>
//                         <div className="flex items-center gap-3">
//                             <span className="text-xl">{pm.icon}</span>
//                             <div>
//                                 <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{pm.label}</p>
//                                 <p className="text-xs text-slate-500">{pm.desc}</p>
//                             </div>
//                             {INSTANT_PAY_METHODS.includes(pm.id) && (
//                                 <span className="ml-auto text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full">
//                                     Шуурхай
//                                 </span>
//                             )}
//                         </div>
//                     </RadioCard>
//                 ))}
//             </div>
//             <Btn disabled={!paymentMethod || enabledMethods === null} onClick={onNext}>Үргэлжлэх →</Btn>
//         </>
//     );
// }
