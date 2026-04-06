import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

let _router: AppRouterInstance | null = null;

export function setRouter(router: AppRouterInstance) {
    _router = router;
}

export function goto(route: string) {
    _router?.push(route);
}
