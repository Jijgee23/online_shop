"use client";

import React, { useState } from "react";
import { AddressInput } from "@/app/context/address_context";
import DropdownSelect from "@/ui/DropdownSelect";
import { Btn, StepHeader, RadioCard, AddrInput, EMPTY_ADDR } from "../shared";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { Map } from "lucide-react";

const MapPicker = dynamic(() => import("@/app/components/MapPicker"), { ssr: false });

interface AddressStepProps {
    myAddresses: any[];
    selectedAddressId: number | null;
    setSelectedAddressId: (id: number | null) => void;
    note: string;
    setNote: (n: string) => void;
    showAddressForm: boolean;
    setShowAddressForm: (v: boolean) => void;
    savingAddress: boolean;
    districts: { id: number; name: string }[];
    newAddr: AddressInput;
    setNewAddr: React.Dispatch<React.SetStateAction<AddressInput>>;
    handleSaveNewAddress: (e: React.FormEvent) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function AddressStep({
    myAddresses, selectedAddressId, setSelectedAddressId,
    note, setNote, showAddressForm, setShowAddressForm, savingAddress,
    districts, newAddr, setNewAddr, handleSaveNewAddress, onBack, onNext
}: AddressStepProps) {
    const [showMap, setShowMap] = useState(false);

    return (
        <>
            <StepHeader title="Хүргэлтийн хаяг" onBack={onBack} />
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
                    </div>
                    <button onClick={() => setShowAddressForm(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:text-teal-500 hover:border-teal-400 transition-all text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Шинэ хаяг нэмэх
                    </button>
                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Тэмдэглэл (заавал биш)..." rows={2}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 resize-none mb-4 placeholder:text-slate-400 text-slate-800 dark:text-white" />
                    <Btn onClick={() => {
                        if (!selectedAddressId) {
                            toast.error("Хүргэлтийн хаяг сонгоно уу");
                            return;
                        }
                        onNext();
                    }}>Үргэлжлэх →</Btn>
                </>
            ) : (
                <form onSubmit={handleSaveNewAddress} className="space-y-3">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Шинэ хаяг нэмэх</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="mt-1">
                            <AddrInput label="Хот" value={newAddr.city} onChange={v => setNewAddr(a => ({ ...a, city: v }))} required />
                        </div>
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

                    <button
                        type="button"
                        onClick={() => setShowMap(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 rounded-2xl text-sm transition-colors group"
                    >
                        <Map className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                        {newAddr.latitude && newAddr.longitude ? (
                            <span className="flex-1 text-left text-teal-500 font-semibold text-xs">
                                {newAddr.latitude.toFixed(5)}, {newAddr.longitude.toFixed(5)}
                            </span>
                        ) : (
                            <span className="flex-1 text-left text-slate-400 dark:text-slate-500">Газрын зурагаас байршил сонгох</span>
                        )}
                        {newAddr.latitude && newAddr.longitude && (
                            <span className="text-[10px] font-bold text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-full">✓ Тохируулсан</span>
                        )}
                    </button>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => { setShowAddressForm(false); setNewAddr(EMPTY_ADDR); }}
                            className="w-full flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Буцах
                        </button>
                        <button type="submit" disabled={savingAddress}
                            className="flex-1 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold transition-colors disabled:opacity-50">
                            {savingAddress ? "Хадгалж байна..." : "Хадгалах"}
                        </button>
                    </div>
                </form>
            )}

            {showMap && (
                <MapPicker
                    lat={newAddr.latitude}
                    lng={newAddr.longitude}
                    onConfirm={(lat, lng) => {
                        setNewAddr(a => ({ ...a, latitude: lat, longitude: lng }));
                        setShowMap(false);
                    }}
                    onClose={() => setShowMap(false)}
                />
            )}
        </>
    );
}
