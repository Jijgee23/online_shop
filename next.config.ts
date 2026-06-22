import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Upload-ууд nginx-ээр /uploads/-аас (гадна /var/www) түгээгддэг тул Next-ийн
    // серверийн optimizer диск дээрх public/-ээс уншиж чадахгүй. Мөн preview (blob:)
    // зургийг optimize хийх боломжгүй. Тиймээс optimizer-ийг унтрааж, браузер зургийг
    // шууд (nginx cache-тэй) ачаална.
    unoptimized: true,
  },
};

export default nextConfig;
