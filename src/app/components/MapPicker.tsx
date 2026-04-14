"use client";

import { useEffect, useRef } from "react";
import { X, MapPin } from "lucide-react";

interface MapPickerProps {
    lat?: number;
    lng?: number;
    onConfirm?: (lat: number, lng: number) => void;
    onClose: () => void;
    readOnly?: boolean;
}

// Ulaanbaatar default center
const DEFAULT_LAT = 47.9184;
const DEFAULT_LNG = 106.9174;
const DEFAULT_ZOOM = 13;

export default function MapPicker({ lat, lng, onConfirm, onClose, readOnly }: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const pickedRef = useRef<{ lat: number; lng: number }>({
        lat: lat ?? DEFAULT_LAT,
        lng: lng ?? DEFAULT_LNG,
    });

    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) return;

        let cancelled = false;

        (async () => {
            const L = (await import("leaflet")).default;

            if (cancelled || !mapRef.current) return;

            // Clear any leftover Leaflet state from StrictMode's double-invoke
            const container = mapRef.current as any;
            if (container._leaflet_id) {
                delete container._leaflet_id;
            }

            // Fix default marker icons
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const initLat = lat ?? DEFAULT_LAT;
            const initLng = lng ?? DEFAULT_LNG;

            const map = L.map(mapRef.current!, { zoomControl: true }).setView([initLat, initLng], DEFAULT_ZOOM);
            leafletMapRef.current = map;

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            const marker = L.marker([initLat, initLng], { draggable: !readOnly }).addTo(map);
            markerRef.current = marker;
            pickedRef.current = { lat: initLat, lng: initLng };

            if (!readOnly) {
                marker.on("dragend", () => {
                    const pos = marker.getLatLng();
                    pickedRef.current = { lat: pos.lat, lng: pos.lng };
                });

                map.on("click", (e: any) => {
                    marker.setLatLng(e.latlng);
                    pickedRef.current = { lat: e.latlng.lat, lng: e.latlng.lng };
                });
            }
        })();

        return () => {
            cancelled = true;
            leafletMapRef.current?.remove();
            leafletMapRef.current = null;
        };
    }, []);

    const handleConfirm = () => {
        onConfirm?.(pickedRef.current.lat, pickedRef.current.lng);
    };

    return (
        <>
            {/* Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />

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
                                    {readOnly ? "Хүргэлтийн байршил" : "Газрын зурагаас сонгох"}
                                </h3>
                                <p className="text-xs text-slate-400 dark:text-zinc-500">
                                    {readOnly ? "Захиалагчийн заасан байршил" : "Газрын зураг дээр дарж байршлаа тодорхойлно уу"}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-400 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Map */}
                    <div ref={mapRef} className="w-full" style={{ height: 420 }} />

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                        <p className="text-xs text-slate-400 dark:text-zinc-500">
                            {readOnly ? "Хүргэлтийн байршил" : "Дарах эсвэл пин чирч байршлаа тохируулна уу"}
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
        </>
    );
}
