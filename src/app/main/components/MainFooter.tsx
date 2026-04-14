
import { useAuth } from "@/app/context/auth_context";
import { useSettings } from "@/app/context/settings_context";
import Link from "next/link";
import Image from "next/image";

export function MainFooter() {
    const user = useAuth().user;
    const loggedIn = user !== null;
    const { settings } = useSettings();

    return (
        <footer className="bg-slate-950 text-slate-400 pt-14 pb-8 border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

                    {/* Brand */}
                    <div className="md:col-span-1">
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-3">
                            {settings.storeName || "IShop"}
                        </h2>
                        <p className="text-sm leading-relaxed max-w-xs mb-5">
                            {settings.storeDesc || "Чанартай бүтээгдэхүүнийг хямд, хурдан, найдвартайгаар хүргэж байна."}
                        </p>
                        {/* Social icons */}
                        {(settings.facebookUrl || settings.instagramUrl) && (
                            <div className="flex items-center gap-3">
                                {settings.instagramUrl && (
                                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:scale-110 transition-transform">
                                        <Image alt="Instagram" width={28} height={28} src="/icons/instagram.png" className="rounded-full object-contain" />
                                    </a>
                                )}
                                {settings.facebookUrl && (
                                    <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:scale-110 transition-transform">
                                        <Image alt="Facebook" width={28} height={28} src="/icons/fb.png" className="rounded-full object-cover" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Nav Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Холбоосууд</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/product" className="hover:text-teal-400 transition-colors">Бүтээгдэхүүн</Link></li>
                            {loggedIn && <>
                                <li><Link href="/cart" className="hover:text-teal-400 transition-colors">Сагс</Link></li>
                                <li><Link href="/order" className="hover:text-teal-400 transition-colors">Захиалга</Link></li>
                                <li><Link href="/wishlist" className="hover:text-teal-400 transition-colors">Хүслийн жагсаалт</Link></li>
                            </>}
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Бүртгэл</h3>
                        <ul className="space-y-2 text-sm">
                            {!loggedIn && <>
                                <li><Link href="/auth/login" className="hover:text-teal-400 transition-colors">Нэвтрэх</Link></li>
                                <li><Link href="/auth/register" className="hover:text-teal-400 transition-colors">Бүртгүүлэх</Link></li>
                            </>}
                            {loggedIn && <li><Link href="/profile" className="hover:text-teal-400 transition-colors">Профайл</Link></li>}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Холбоо барих</h3>
                        <ul className="space-y-3 text-sm">
                            {settings.phone && (
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-0.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </span>
                                    <a href={`tel:${settings.phone}`} className="hover:text-teal-400 transition-colors">{settings.phone}</a>
                                </li>
                            )}
                            {settings.email && (
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-0.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                    <a href={`mailto:${settings.email}`} className="hover:text-teal-400 transition-colors">{settings.email}</a>
                                </li>
                            )}
                            {settings.address && (
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-0.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </span>
                                    <span>{settings.address}</span>
                                </li>
                            )}
                            {!settings.phone && !settings.email && !settings.address && (
                                <li className="text-slate-600 text-xs">Мэдээлэл оруулаагүй байна</li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
                    &copy; {new Date().getFullYear()} {settings.storeName || "IShop"}. Бүх эрх хуулиар хамгаалагдсан.
                </div>
            </div>
        </footer>
    );
}