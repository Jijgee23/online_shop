import { AdminProvider } from "../context/admin_context";
import type { ReactNode } from "react";
import { ProductProvider } from "../context/product_context";

type AdminLayoutProps = {
    children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <AdminProvider >
          <ProductProvider>
              {children}
          </ProductProvider>
        </AdminProvider>
    )
}