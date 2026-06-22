import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Upload-ууд nginx-ээр /uploads/-аас түгээгддэг тул optimizer-т гадаад host зөвшөөрнө.
    // src нь imgUrl()-ээр NEXT_PUBLIC_IMAGE_URL-тэй absolute болсон байх ёстой.
    remotePatterns: [
      { protocol: "https", hostname: "ishop.macs.mn", pathname: "/uploads/**" },
      { protocol: "https", hostname: "www.ishop.macs.mn", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
