"use client";

import { useEffect, useRef, useState } from "react";
import { X, MapPin } from "lucide-react";
import { loadGoogleMaps, tealPinIcon, UB_CENTER } from "./googleMaps";

interface MapPickerProps {
    lat?: number;
    lng?: number;
    onConfirm?: (lat: number, lng: number) => void;
    onClose: () => void;
    readOnly?: boolean;
    title?: string;
    subtitle?: string;
}

const DEFAULT_ZOOM = 13;

export default function MapPicker({ lat, lng, onConfirm, onClose, readOnly, title, subtitle }: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const pickedRef = useRef<{ lat: number; lng: number }>({
        lat: lat ?? UB_CENTER.lat,
        lng: lng ?? UB_CENTER.lng,
    });

    useEffect(() => {
        let cancelled = false;

        loadGoogleMaps()
            .then(maps => {
                if (cancelled || !mapRef.current) return;

                const isDark = document.documentElement.classList.contains("dark");
                const initCenter = { lat: lat ?? UB_CENTER.lat, lng: lng ?? UB_CENTER.lng };

                const map = new maps.Map(mapRef.current, {
                    center: initCenter,
                    zoom: DEFAULT_ZOOM,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    colorScheme: isDark ? "DARK" : "LIGHT",
                });

                const marker = new maps.Marker({
                    position: initCenter,
                    map,
                    draggable: !readOnly,
                    icon: tealPinIcon(maps),
                });
                pickedRef.current = initCenter;

                if (!readOnly) {
                    marker.addListener("dragend", () => {
                        const pos = marker.getPosition();
                        if (pos) pickedRef.current = { lat: pos.lat(), lng: pos.lng() };
                    });
                    map.addListener("click", (e: google.maps.MapMouseEvent) => {
                        if (!e.latLng) return;
                        marker.setPosition(e.latLng);
                        pickedRef.current = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    });
                }
            })
            .catch(err => {
                if (!cancelled) setError(err.message ?? "Газрын зураг ачаалахад алдаа гарлаа.");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const handleConfirm = () => {
        onConfirm?.(pickedRef.current.lat, pickedRef.current.lng);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-teal-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                {title ?? (readOnly ? "Хүргэлтийн байршил" : "Газрын зурагаас сонгох")}
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-zinc-500">
                                {subtitle ?? (readOnly ? "Захиалагчийн заасан байршил" : "Газрын зураг дээр дарж байршлаа тодорхойлно уу")}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-400 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Map */}
                {error ? (
                    <div className="flex flex-col items-center justify-center text-center" style={{ height: 420 }}>
                        <MapPin className="w-10 h-10 text-slate-300 dark:text-zinc-700 mb-3" />
                        <p className="text-slate-500 dark:text-zinc-500 text-sm px-6">{error}</p>
                    </div>
                ) : (
                    <div ref={mapRef} className="w-full" style={{ height: 420 }} />
                )}

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                        {readOnly ? (subtitle ?? "Хүргэлтийн байршил") : "Дарах эсвэл пин чирч байршлаа тохируулна уу"}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                        >
                            {readOnly ? "Хаах" : "Болих"}
                        </button>
                        {!readOnly && (
                            <button
                                onClick={handleConfirm}
                                className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 transition"
                            >
                                Байршил тохируулах
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
