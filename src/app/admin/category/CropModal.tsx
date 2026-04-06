"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";

export default function CropModal({ src, onConfirm, onCancel }: {
    src: string;
    onConfirm: (file: File) => void;
    onCancel: () => void;
}) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
        const c = centerCrop(makeAspectCrop({ unit: "%", width: 80 }, 3 / 4, w, h), w, h);
        setCrop(c);
    }, []);

    const handleConfirm = () => {
        if (!imgRef.current || !completedCrop) return;
        const canvas = document.createElement("canvas");
        canvas.width  = 600;
        canvas.height = 800;
        const ctx = canvas.getContext("2d")!;
        const img = imgRef.current;
        const scaleX = img.naturalWidth  / img.width;
        const scaleY = img.naturalHeight / img.height;
        ctx.drawImage(
            img,
            completedCrop.x * scaleX, completedCrop.y * scaleY,
            completedCrop.width * scaleX, completedCrop.height * scaleY,
            0, 0, 600, 800,
        );
        canvas.toBlob(blob => {
            if (!blob) return;
            onConfirm(new File([blob], `category-${Date.now()}.jpg`, { type: "image/jpeg" }));
        }, "image/jpeg", 0.9);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Зураг тайрах</h3>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Хүссэн хэсгийг чирж тохируулна уу (3:4)</p>
                    </div>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 flex items-center justify-center bg-slate-50 dark:bg-zinc-950 max-h-[60vh] overflow-auto">
                    <ReactCrop
                        crop={crop}
                        onChange={c => setCrop(c)}
                        onComplete={c => setCompletedCrop(c)}
                        aspect={3 / 4}
                        minWidth={60}
                        keepSelection
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img ref={imgRef} src={src} alt="crop" onLoad={onImageLoad}
                            className="max-w-full max-h-[55vh] object-contain" />
                    </ReactCrop>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-zinc-800">
                    <button onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl text-slate-500 dark:text-zinc-400 font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-sm">
                        Цуцлах
                    </button>
                    <button onClick={handleConfirm} disabled={!completedCrop}
                        className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white rounded-xl font-bold transition-colors text-sm">
                        Батлах
                    </button>
                </div>
            </div>
        </div>
    );
}
