/**
 * Resizes an image File in the browser using a canvas before upload.
 * Maintains aspect ratio. Outputs as WebP for smaller file size.
 *
 * @param file     - Original image File
 * @param maxSize  - Max width OR height in pixels (default 800)
 * @param quality  - WebP quality 0–1 (default 0.85)
 */
export function resizeImage(file: File, maxSize = 800, quality = 0.85): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let { width, height } = img;

            // Scale down only if larger than maxSize
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height / width) * maxSize);
                    width = maxSize;
                } else {
                    width = Math.round((width / height) * maxSize);
                    height = maxSize;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Canvas context unavailable"));

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Canvas toBlob failed"));
                    const resized = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
                        type: "image/webp",
                        lastModified: Date.now(),
                    });
                    resolve(resized);
                },
                "image/webp",
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Image load failed"));
        };

        img.src = url;
    });
}
