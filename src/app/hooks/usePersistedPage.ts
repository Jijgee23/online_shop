"use client";

import { useCallback, useEffect, useState } from "react";


export function usePersistedPage(storageKey: string, resetKeys: unknown[] = []) {
    const [page, setPageState] = useState<number>(() => {
        if (typeof window === "undefined") return 1;
        const saved = localStorage.getItem(storageKey);
        return saved ? Number(saved) : 1;
    });

    // Persist whenever page changes
    useEffect(() => {
        localStorage.setItem(storageKey, String(page));
    }, [page, storageKey]);

    // Reset to 1 when any filter/search key changes
    const resetDep = JSON.stringify(resetKeys);
    useEffect(() => {
        setPageState(1);
        localStorage.setItem(storageKey, "1");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetDep]);

    const setPage = useCallback((p: number) => {
        setPageState(p);
        localStorage.setItem(storageKey, String(p));
    }, [storageKey]);

    return [page, setPage] as const;
}
