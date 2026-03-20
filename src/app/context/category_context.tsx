'use client';
import { Category } from '@/interface/category';
import { createContext, useContext, useState, useEffect, ReactNode, JSX } from 'react';

interface CategoryContextType {
    categories: Category[],
    setCategories: (cats: Category[]) => void,
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {

    const [categories, setCategories] = useState<Category[]>([])
    const fetchCategoies = async () => {
        const res = await fetch("api/category")
        if (res.ok) {
            setCategories(await res.json())
            return
        }
        setCategories([])
    }
    useEffect(() => {
        fetchCategoies()
    }, [])

    const value: CategoryContextType = {
        categories,
        setCategories
    }

    return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error("useCategory must be used within CategoryProvider");
    }
    return context;
}