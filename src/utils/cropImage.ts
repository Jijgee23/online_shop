export interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Extracts a cropped region from an image src and returns it as a File.
 * Output is WebP at 85% quality, then resized to maxSize.
 */
export async function cropImage(imageSrc: string, pixelCrop: Area, fileName: string, maxSize = 800): Promise<File> {
    const img = await loadImage(imageSrc);

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    ctx.drawImage(
        img,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        pixelCrop.width, pixelCrop.height
    );

    // Scale down if needed
    let { width, height } = canvas;
    if (width > maxSize || height > maxSize) {
        const scale = maxSize / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const scaled = document.createElement("canvas");
        scaled.width = width;
        scaled.height = height;
        scaled.getContext("2d")!.drawImage(canvas, 0, 0, width, height);
        return canvasToFile(scaled, fileName);
    }

    return canvasToFile(canvas, fileName);
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function canvasToFile(canvas: HTMLCanvasElement, fileName: string): Promise<File> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) return reject(new Error("toBlob failed"));
                resolve(new File([blob], fileName.replace(/\.[^.]+$/, ".webp"), {
                    type: "image/webp",
                    lastModified: Date.now(),
                }));
            },
            "image/webp",
            0.85
        );
    });
}
