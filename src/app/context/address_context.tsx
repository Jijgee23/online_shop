"use client";

import { Address, District } from "@/interface/order";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import toast from "react-hot-toast";
import { MapPin, Plus, ChevronRight, X, Map } from "lucide-react";
import { useConfirm } from "./confirm_context";
import { Input } from "../../ui/Input";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("../components/MapPicker"), { ssr: false });

export interface AddressInput {
    city: string;
    districtId: number;
    khoroo: string;
    detail: string;
    phone: string;
    latitude?: number;
    longitude?: number;
}

interface AddressContextType {
    getDeliveryAddress: (isNew: boolean) => Promise<AddressInput | null>;
    myAddresses: Address[];
    districts: District[];
    fetchAddress: () => Promise<void>;
    create: () => Promise<void>;
    deleteAddress: (id: number) => void;
    editAddress: (id: number) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [myAddresses, setMyAddresses] = useState<Address[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const { confirm } = useConfirm();
    const [address, setAddress] = useState<AddressInput>({
        city: "Улаанбаатар",
        districtId: 0,
        khoroo: "",
        detail: "",
        phone: "",
    });

    const [showMap, setShowMap] = useState(false);
    const [resolvePromise, setResolvePromise] = useState<(value: AddressInput | null) => void>();

    const fetchAddress = async () => {
        try {
            const res = await fetch('/api/address', { method: 'GET' });
            const data = await res.json();
            if (res.ok) setMyAddresses(data.data || []);
        } catch (ex) {
            setMyAddresses([]);
        }
    };

    const fetchDistricts = async () => {
        try {
            const res = await fetch('/api/districts', { method: 'GET' });
            const data = await res.json();
            if (res.ok) setDistricts(data.data || []);
        } catch (ex) {
            setDistricts([]);
        }
    };

    const getDeliveryAddress = (isNew: boolean) => {
        setIsOpen(true);
        setShowForm(false); // Эхлээд жагсаалтыг харуулна
        return new Promise<AddressInput | null>((resolve) => {
            setResolvePromise(() => resolve);
        });
    };

    const handleSelectExisting = (addr: Address) => {
        setIsOpen(false);
        if (resolvePromise) resolvePromise(addr);
    };

    const handleSubmitNew = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsOpen(false);
        await saveAddress(address);
        if (resolvePromise) resolvePromise(address);
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolvePromise) resolvePromise(null);
    };

    const deleteAddress = async (id: number) => {

        const isOK = await confirm("Хаягын мэдээллийг устгах уу?")

        if (!isOK) return

        try {
            const r = await fetch('api/address', { method: "DELETE", body: JSON.stringify({ id: id }) })
            if (r.ok) {
                toast('Амжилттай устгагдлаа')
                return
            }
            const d = await r.json()
            toast.error(d.message ?? 'Амжилтгүй')
        } catch (e) {
            toast.error('Амжилтгүй')
        }
    }
    const editAddress = async (id: number) => {

        const isOK = await confirm("Хаягын мэдээллийг устгах уу?")

        if (!isOK) return

        try {
            const r = await fetch('api/address', { method: "PATCH", body: JSON.stringify({ id: id }) })
            if (r.ok) {
                toast('Амжилттай устгагдлаа')
                return
            }
            const d = await r.json()
            toast.error(d.message ?? 'Амжилтгүй')
        } catch (e) {
            toast.error('Амжилтгүй')
        }
    }

    useEffect(() => {
        fetchAddress(); fetchDistricts(); 
    }, []);

    const saveAddress = async (data: AddressInput) => {
        try {
            const res = await fetch('/api/address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: data })
            })
            const json = await res.json()
            if (res.ok) {
                toast.success('Амжилттай')
                await fetchAddress()
                return
            }
            toast.error(json.message ?? 'Амжилтгүй')
        } catch (ex) {
            toast.error('Амжилтгүй')
        }
    }

    const create = async () => {
        const deliveryData = await getDeliveryAddress(true);
        if (!deliveryData) return
        await saveAddress(deliveryData as AddressInput)
    }

    return (
        <AddressContext.Provider value={{ getDeliveryAddress, myAddresses, districts, fetchAddress, create, deleteAddress, editAddress }}>
            {children}

            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white bg-white dark:bg-slate-900 p-1 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all animate-in fade-in zoom-in duration-200">

                        {/* Header */}
                        <div className="p-8 pb-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    {showForm ? "Шинэ хаяг нэмэх" : "Хүргэлтийн хаяг сонгох"}
                                </h3>
                                <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1">
                                    {showForm ? "Дэлгэрэнгүй мэдээллээ оруулна уу." : "Хадгалсан хаягуудаас сонгоно уу."}
                                </p>
                            </div>
                            <button onClick={handleCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 dark:text-zinc-500 transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 pt-0 max-h-[70vh] overflow-y-auto custom-scrollbar ">
                            {!showForm ? (
                                <div className="space-y-3">
                                    {myAddresses.map((addr, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSelectExisting(addr)}
                                            className="w-full flex items-center gap-4 p-5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 hover:border-teal-500/50 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-3xl transition-all group text-left"
                                        >
                                            <div className="p-3 bg-slate-100 dark:bg-zinc-700/50 rounded-2xl text-teal-500">
                                                <MapPin size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-slate-900 dark:text-white font-bold text-sm">{addr.district?.name}, {addr.khoroo}</p>
                                                <p className="text-slate-500 dark:text-zinc-500 text-xs mt-0.5 line-clamp-1">{addr.detail}</p>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-400 dark:text-zinc-600 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="w-full flex items-center justify-center gap-3 p-5 border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-teal-400 dark:hover:border-zinc-700 rounded-3xl text-slate-400 dark:text-zinc-400 hover:text-teal-500 dark:hover:text-white transition-all mt-4"
                                    >
                                        <Plus size={20} />
                                        <span className="font-bold">Шинэ хаяг ашиглах</span>
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitNew} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 ml-2 uppercase">Хот</label>
                                            <Input required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 ml-2 uppercase">Дүүрэг</label>
                                            <select required value={address.districtId || ""} onChange={e => setAddress({ ...address, districtId: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/50">
                                                <option value="">Дүүрэг сонгоно уу</option>
                                                {districts.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 ml-2 uppercase">Хороо</label>
                                        <Input required placeholder="15-р хороо" value={address.khoroo} onChange={e => setAddress({ ...address, khoroo: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 ml-2 uppercase">Дэлгэрэнгүй</label>
                                        <textarea required rows={2} placeholder="Байр, орц, тоот..." value={address.detail} onChange={e => setAddress({ ...address, detail: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/50 resize-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 ml-2 uppercase">Утас</label>
                                        <Input maxLength={8} required type="tel" placeholder="88******" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/50" />
                                    </div>

                                    {/* Map picker */}
                                    <button
                                        type="button"
                                        onClick={() => setShowMap(true)}
                                        className="w-full flex items-center gap-3 px-5 py-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 hover:border-teal-500/50 rounded-2xl text-sm transition-colors group"
                                    >
                                        <Map className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                                        {address.latitude && address.longitude ? (
                                            <span className="flex-1 text-left text-teal-500 font-semibold text-xs">
                                                {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
                                            </span>
                                        ) : (
                                            <span className="flex-1 text-left text-slate-400 dark:text-zinc-500">Газрын зурагаас байршил сонгох</span>
                                        )}
                                        {address.latitude && address.longitude && (
                                            <span className="text-[10px] font-bold text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-full">✓ Тохируулсан</span>
                                        )}
                                    </button>

                                    <div className="flex gap-4 mt-6">
                                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 p-4 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-zinc-700">Буцах</button>
                                        <button type="submit" className="flex-1 p-4 rounded-2xl bg-teal-500 text-white font-black hover:bg-teal-400 shadow-lg shadow-teal-500/20 active:scale-95 transition-all">Хадгалах</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showMap && (
                <MapPicker
                    lat={address.latitude}
                    lng={address.longitude}
                    onConfirm={(lat, lng) => {
                        setAddress(prev => ({ ...prev, latitude: lat, longitude: lng }));
                        setShowMap(false);
                    }}
                    onClose={() => setShowMap(false)}
                />
            )}
        </AddressContext.Provider>
    );
};

export const useAddress = () => {
    const context = useContext(AddressContext);
    if (!context) throw new Error("useAddress must be used within AddressProvider");
    return context;
};