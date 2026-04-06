"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setRouter } from "@/utils/router";

export default function RouterInitializer() {
    const router = useRouter();
    useEffect(() => { setRouter(router); }, [router]);
    return null;
}
