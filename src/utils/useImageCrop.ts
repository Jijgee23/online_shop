import { useState } from "react";

export interface CropQueueItem {
    src: string;
    name: string;
}

export function useImageCrop() {
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [cropQueue, setCropQueue] = useState<CropQueueItem[]>([]);

    const getImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const queued = files.map((f) => ({ src: URL.createObjectURL(f), name: f.name }));
        setCropQueue((prev) => [...prev, ...queued]);
        e.target.value = "";
    };

    const onCropDone = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
        setImages((prev) => [...prev, file]);
        URL.revokeObjectURL(cropQueue[0].src);
        setCropQueue((prev) => prev.slice(1));
    };

    const onCropCancel = () => {
        URL.revokeObjectURL(cropQueue[0].src);
        setCropQueue((prev) => prev.slice(1));
    };

    const removeImage = (idx: number) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
        setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    return {
        images,
        setImages,
        imagePreviews,
        setImagePreviews,
        cropQueue,
        getImage,
        onCropDone,
        onCropCancel,
        removeImage,
    };
}
