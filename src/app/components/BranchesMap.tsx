"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { loadGoogleMaps, tealPinIcon, UB_CENTER } from "./googleMaps";
import { normalizeHours, openStatus } from "@/lib/branchHours";

interface MapBranch {
    id: number;
    name: string;
    phone: string | null;
    city: string;
    district: string | null;
    khoroo: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    hours: unknown;
}

interface BranchesMapProps {
    branches: MapBranch[];
}

const DEFAULT_ZOOM = 12;

const esc = (s: string) =>
    s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

export default function BranchesMap({ branches }: BranchesMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    const located = branches.filter(b => b.latitude != null && b.longitude != null);

    useEffect(() => {
        let cancelled = false;

        loadGoogleMaps()
            .then(maps => {
                if (cancelled || !mapRef.current) return;

                const isDark = document.documentElement.classList.contains("dark");

                const map = new maps.Map(mapRef.current, {
                    center: UB_CENTER,
                    zoom: DEFAULT_ZOOM,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    colorScheme: isDark ? "DARK" : "LIGHT",
                });

                const bounds = new maps.LatLngBounds();
                const info = new maps.InfoWindow();

                located.forEach((b: MapBranch) => {
                    const position = { lat: b.latitude as number, lng: b.longitude as number };
                    bounds.extend(position);

                    const marker = new maps.Marker({ position, map, title: b.name, icon: tealPinIcon(maps) });

                    const subtitle = [b.city, b.district, b.khoroo].filter(Boolean).join(", ");
                    const phoneLine = b.phone
                        ? `<a href="tel:${esc(b.phone)}" style="color:#14b8a6;text-decoration:none;font-weight:600;">${esc(b.phone)}</a>`
                        : "";
                    const bHours = normalizeHours(b.hours);
                    const { open, today } = openStatus(bHours);
                    const statusLine = bHours
                        ? `<div style="font-size:12px;margin-top:6px;display:flex;align-items:center;gap:5px;">
                               <span style="width:7px;height:7px;border-radius:9999px;background:${open ? "#14b8a6" : "#94a3b8"};"></span>
                               <span style="font-weight:600;color:${open ? "#14b8a6" : "#94a3b8"};">${open ? "Нээлттэй" : "Хаалттай"}</span>
                               ${today?.open ? `<span style="color:#64748b;">· ${esc(today.from)}–${esc(today.to)}</span>` : ""}
                           </div>`
                        : "";
                    const content = `
                        <div style="min-width:160px;font-family:inherit;color:#0f172a;">
                            <div style="font-weight:700;margin-bottom:2px;">${esc(b.name)}</div>
                            ${subtitle ? `<div style="font-size:12px;color:#64748b;">${esc(subtitle)}</div>` : ""}
                            ${b.address ? `<div style="font-size:12px;color:#334155;margin-top:4px;">${esc(b.address)}</div>` : ""}
                            ${phoneLine ? `<div style="font-size:12px;margin-top:6px;">${phoneLine}</div>` : ""}
                            ${statusLine}
                        </div>
                    `;

                    marker.addListener("click", () => {
                        info.setContent(content);
                        info.open({ map, anchor: marker });
                    });
                });

                if (located.length > 1) {
                    map.fitBounds(bounds, 60);
                } else if (located.length === 1) {
                    map.setCenter({ lat: located[0].latitude as number, lng: located[0].longitude as number });
                    map.setZoom(15);
                }
            })
            .catch(err => {
                if (!cancelled) setError(err.message ?? "Газрын зураг ачаалахад алдаа гарлаа.");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800">
                <MapPin className="w-10 h-10 text-slate-300 dark:text-zinc-700 mb-3" />
                <p className="text-slate-500 dark:text-zinc-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="rounded-3xl overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-sm">
            <div ref={mapRef} className="w-full" style={{ height: 560 }} />
        </div>
    );
}
