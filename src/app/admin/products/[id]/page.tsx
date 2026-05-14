"use client";

import { useParams } from "next/navigation";
import { useAdmin } from "@/app/context/admin_context";
import ProductForm from "../components/ProductForm";

export default function EditProductPage() {
    const params = useParams();
    const { editingProductId } = useAdmin();

    // When rendered inside the admin SPA (sidebar layout), use context id.
    // When accessed directly via URL, fall back to route params.
    const id = editingProductId ?? (params?.id as string);

    return <ProductForm mode="edit" productId={id} />;
}
