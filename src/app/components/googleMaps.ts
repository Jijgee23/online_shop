// Shared Google Maps JS API loader + helpers.
// Types come from the dev dependency `@types/google.maps` (global `google` namespace).

declare global {
    interface Window {
        google: typeof google;
    }
}

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Ulaanbaatar default center
export const UB_CENTER = { lat: 47.9184, lng: 106.9174 };

// Singleton promise so the Google Maps script is only injected once across all components.
let mapsPromise: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(): Promise<typeof google.maps> {
    if (typeof window !== "undefined" && window.google?.maps) {
        return Promise.resolve(window.google.maps);
    }
    if (mapsPromise) return mapsPromise;

    mapsPromise = new Promise((resolve, reject) => {
        if (!GOOGLE_MAPS_API_KEY) {
            reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY тохируулагдаагүй байна."));
            return;
        }
        const existing = document.getElementById("google-maps-script") as HTMLScriptElement | null;
        if (existing) {
            if (window.google?.maps) {
                resolve(window.google.maps);
                return;
            }
            existing.addEventListener("load", () => resolve(window.google.maps));
            existing.addEventListener("error", () => reject(new Error("Google Maps ачаалахад алдаа гарлаа.")));
            return;
        }
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = () => reject(new Error("Google Maps ачаалахад алдаа гарлаа."));
        document.head.appendChild(script);
    });

    return mapsPromise;
}

// Branded teal map-pin marker icon (replaces Google's default red pin).
export function tealPinIcon(maps: typeof google.maps): google.maps.Icon {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
            <path d="M20 0C9 0 0 9 0 20c0 14 20 28 20 28s20-14 20-28C40 9 31 0 20 0z" fill="#14b8a6"/>
            <path d="M20 0C9 0 0 9 0 20c0 14 20 28 20 28s20-14 20-28C40 9 31 0 20 0z" fill="#0f766e" opacity="0.15"/>
            <circle cx="20" cy="20" r="8" fill="#ffffff"/>
            <circle cx="20" cy="20" r="4" fill="#14b8a6"/>
        </svg>
    `;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg.trim()),
        scaledSize: new maps.Size(40, 48),
        anchor: new maps.Point(20, 48),
    };
}
