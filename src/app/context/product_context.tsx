

'use client';

import { ProductWithRelations } from "@/interface/product";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";


interface ProductContextType {
    products: ProductWithRelations[] | [],
    fetchProducts: () => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
}


const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {

    const [products, setProducts] = useState<ProductWithRelations[]>([])

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
            const res = await fetch(`api/admin/product/${id}`, { method: 'DELETE' })
            console.log(res.status)
            if (res.ok) {
                toast.success('Бараа амжилттай устгагдлаа')
                fetchProducts()
            }
        } catch (err) {

        }
    };

    useEffect(() => { fetchProducts() }, [])

    const value: ProductContextType = {
        products,
        fetchProducts,
        deleteProduct
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