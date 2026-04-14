'use client';
import { Category } from '@/interface/category';
import { createContext, useContext, useState, useEffect, ReactNode, JSX } from 'react';
import { useAuth } from './auth_context';
import { AwardIcon } from 'lucide-react';

interface CategoryContextType {
    categories: Category[],
    fetchCategories: () => void,
    loading: boolean,
    setCategories: (cats: Category[]) => void,
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const { isAdmin, user, checkUser } = useAuth()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const fetchCategories = async () => {
        setLoading(true)
        const url = isAdmin ? '/api/admin/category' : "api/category"
        const res = await fetch(url)
        if (res.ok) {
            const data = await res.json()
            setCategories(data)
            setLoading(false)
            return
        }
        setCategories([])
        setLoading(false)
    }
    useEffect(() => {
        checkUser()
        if (user) fetchCategories()
    }, [])

    const value: CategoryContextType = {
        categories,
        fetchCategories,
        loading,
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
