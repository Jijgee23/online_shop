"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { cropImage, Area } from "@/utils/cropImage";

interface Props {
    imageSrc: string;
    fileName: string;
    onDone: (file: File) => void;
    onCancel: () => void;
}

const ASPECTS = [
    { label: "1:1", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:4", value: 3 / 4 },
    { label: "16:9", value: 16 / 9 },
];

export default function ImageCropper({ imageSrc, fileName, onDone, onCancel }: Props) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(1);
    const [pixelCrop, setPixelCrop] = useState<Area>({ x: 0, y: 0, width: 0, height: 0 });
    const [loading, setLoading] = useState(false);

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setPixelCrop(croppedPixels);
    }, []);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const file = await cropImage(imageSrc, pixelCrop, fileName);
            onDone(file);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                    <h3 className="text-white font-bold text-lg">Зураг тайрах</h3>
                    <button onClick={onCancel} className="text-zinc-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Crop area */}
                <div className="relative w-full bg-zinc-950" style={{ height: 340 }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                {/* Controls */}
                <div className="px-6 py-4 space-y-4">
                    {/* Aspect ratio */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 w-14 flex-shrink-0">Харьцаа</span>
                        <div className="flex gap-2">
                            {ASPECTS.map((a) => (
                                <button
                                    key={a.label}
                                    type="button"
                                    onClick={() => setAspect(a.value)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                        aspect === a.value
                                            ? "bg-teal-500 text-white"
                                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                    }`}
                                >
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Zoom */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 w-14 flex-shrink-0">Томруулах</span>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 accent-teal-500"
                        />
                        <span className="text-xs text-zinc-500 w-8 text-right">{zoom.toFixed(1)}x</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 pb-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-2xl border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800 transition-colors"
                    >
                        Цуцлах
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-bold transition-colors disabled:opacity-50"
                    >
                        {loading ? "Хадгалж байна..." : "Тайрах"}
                    </button>
                </div>
            </div>
        </div>
    );
}
