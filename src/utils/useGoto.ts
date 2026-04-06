import { useRouter } from "next/navigation";

export function useGoto() {
    const router = useRouter();
    return (route: string) => router.push(route);
}
