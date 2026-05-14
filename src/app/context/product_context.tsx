'use client';

import { Product } from "@/interface/product";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";


interface ProductContextType {
    products: Product[] | [],
    fetchProducts: () => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    restoreProduct: (id: number) => Promise<void>;
    permantentDelete: (id: number) => Promise<void>;
    bulkDeactivate: (ids: number[]) => Promise<void>;
    bulkPermanentDelete: (ids: number[]) => Promise<void>;
    bulkSetCategory: (ids: number[], categoryId: number) => Promise<void>;
    refetchSignal: number;
}


const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {

    const [products, setProducts] = useState<Product[]>([])
    const [refetchSignal, setRefetchSignal] = useState(0)

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/admin/product");
            const data = await res.json();
            if (data && Array.isArray(data)) {
                setProducts(data);
            } else if (data && Array.isArray(data.data)) {
                setProducts(data.data);
            } else {
                setProducts([]);
            }
        } catch (err) {
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/product/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Бараа амжилттай устгагдлаа');
                setRefetchSignal(s => s + 1);
            }
        } catch (err) { }
    };

    const restoreProduct = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/product/${id}`, { method: 'PUT' });
            if (res.ok) {
                toast.success('Бараа амжилттай сэргээгдлээ');
                setRefetchSignal(s => s + 1);
            }
        } catch (err) { }
    };
    const permantentDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/product/${id}/permant_delete`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Бараа амжилттай устгагдлаа');
                setRefetchSignal(s => s + 1);
            }
        } catch (err) { }
    }

    const bulkDeactivate = async (ids: number[]) => {
        try {   
            const res = await fetch('/api/admin/product/bulk', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, action: 'deactivate' }),
            });
            if (res.ok) {
                toast.success(`${ids.length} бараа идэвхгүй болгогдлоо`);
                setRefetchSignal(s => s + 1);
            }
        } catch (err) { }
    };

    const bulkPermanentDelete = async (ids: number[]) => {
        try {
            const res = await fetch('/api/admin/product/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            });
            if (res.ok) {
                toast.success(`${ids.length} бараа бүр мөсөн устгагдлаа`);
                setRefetchSignal(s => s + 1);
            }
        } catch (err) { }
    };

    const bulkSetCategory = async (ids: number[], categoryId: number) => {
        try {
            const res = await fetch('/api/admin/product/bulk', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, action: 'setCategory', categoryId }),
            });
            if (res.ok) {
                toast.success(`${ids.length} барааны ангилал шинэчлэгдлээ`);
                setRefetchSignal(s => s + 1);
            }
        } catch (err) { }
    };

    useEffect(() => { fetchProducts() }, [])

    const value: ProductContextType = {
        products,
        fetchProducts,
        deleteProduct,
        restoreProduct,
        permantentDelete,
        bulkDeactivate,
        bulkPermanentDelete,
        bulkSetCategory,
        refetchSignal,
    }
    return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within ProductProvider');
    }
    return context;
}
