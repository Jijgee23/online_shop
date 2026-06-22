"use client"

import { useAuth } from "../context/auth_context";
import { useRouter } from "next/navigation";

export default function ProfileSection() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) return null;

    return (
        <button
            onClick={() => router.push("/profile")}
            title={user.name}
            aria-label="Профайл"
            className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ring-2 ring-transparent hover:ring-teal-400/50 transition-all"
        >
            {user.name?.charAt(0).toUpperCase()}
        </button>
    );
}
