import { AdminProvider } from "../context/admin_context";
import type { ReactNode } from "react";

type AdminLayoutProps = {
    children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <AdminProvider >
            {children}
        </AdminProvider>
    )
}