
import { useAuth } from "@/app/context/auth_context";
import Link from "next/link";
export function MainFooter() {

    const user = useAuth().user;
    const loggedIn = user !== null;

    return (<footer className="bg-slate-950 text-slate-400 pt-14 pb-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                {/* Brand */}
                <div>
                    <h2 className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-3">
                        IShop
                    </h2>
                    <p className="text-sm leading-relaxed max-w-xs">
                        Чанартай бүтээгдэхүүнийг хямд, хурдан, найдвартайгаар хүргэж байна.
                    </p>
                </div>

                {/* Nav Links */}
                {loggedIn && <div>
                    <h3 className="text-white font-semibold mb-4">Холбоосууд</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/product" className="hover:text-teal-400 transition-colors">Бүтээгдэхүүн</Link></li>
                        <li><Link href="/cart" className="hover:text-teal-400 transition-colors">Сагс</Link></li>
                        <li><Link href="/order" className="hover:text-teal-400 transition-colors">Захиалга</Link></li>
                        <li><Link href="/wishlist" className="hover:text-teal-400 transition-colors">Хүслийн жагсаалт</Link></li>
                    </ul>
                </div>}

                {/* Account Links */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Бүртгэл</h3>
                    <ul className="space-y-2 text-sm">
                        {!loggedIn && <li><Link href="/auth/login" className="hover:text-teal-400 transition-colors">Нэвтрэх</Link></li>}
                        {!loggedIn && <li><Link href="/auth/register" className="hover:text-teal-400 transition-colors">Бүртгүүлэх</Link></li>}
                        {loggedIn && <li><Link href="/profile" className="hover:text-teal-400 transition-colors">Профайл</Link></li>}
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
                &copy; {new Date().getFullYear()} IShop. Бүх эрх хуулиар хамгаалагдсан.
            </div>
        </div>
    </footer>)

}