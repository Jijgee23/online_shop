"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";

export default function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: dark ? "#18181b" : "#ffffff",
          color: dark ? "#ffffff" : "#18181b",
          borderRadius: "1rem",
          border: dark ? "1px solid #27272a" : "1px solid #e4e4e7",
        },
      }}
    />
  );
}
