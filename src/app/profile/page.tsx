"use client";

import { useAuth } from "../context/auth_context";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  MapPin,
  Package,
  Settings,
  LogOut,
  ShieldCheck,
  Navigation,
  Monitor
} from "lucide-react";
import Header from "../components/Header";
import MenuCard from "@/ui/MenuCard";

export default function UserProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <button
          onClick={() => router.push('/auth/login')}
          className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition"
        >
          Нэвтрэх
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-24">
        {/* Profile Header Card */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-zinc-800 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-teal-500 to-blue-500 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                  <User className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                  {/* Бодит зураг байвал: <img src={user.image} className="object-cover w-full h-full" /> */}
                </div>
              </div>
              {/* <button className="absolute bottom-1 right-1 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:scale-110 transition">
                <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </button> */}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                  {user.name || "Хэрэглэгч"}
                </h1>
                <ShieldCheck className="w-6 h-6 text-teal-500" />
              </div>
              <div className="space-y-2">
                <p className="flex items-center justify-center md:justify-start gap-2 text-slate-500 dark:text-slate-400">
                  <Mail className="w-4 h-4" /> {user.email}
                </p>
                <p className="flex items-center justify-center md:justify-start gap-2 text-slate-500 dark:text-slate-400">
                  <MapPin className="w-4 h-4" /> Улаанбаатар, Монгол
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/profile/edit')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Засах
            </button>
          </div>
        </section>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MenuCard icon={<Package className="w-6 h-6" />}  title="Миний захиалгууд"   desc="Захиалгын түүх харах"       color="blue"   onClick={() => router.push('/order')} />
          <MenuCard icon={<Navigation className="w-6 h-6" />} title="Миний хаягууд"     desc="Захиалгын хаягууд харах"    color="blue"   onClick={() => router.push('/address')} />
          <MenuCard icon={<Monitor className="w-6 h-6" />}  title="Миний төхөөрөмжүүд" desc="Бүртгэлтэй төхөөрөмжүүд"  color="teal"   onClick={() => router.push('/devices')} />
          <MenuCard icon={<Settings className="w-6 h-6" />} title="Тохиргоо"           desc="Нууц үг, аюулгүй байдал"   color="purple" onClick={() => router.push('/settings')} />
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full mt-12 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-red-50 dark:border-red-900 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition"
        >
          <LogOut className="w-5 h-5" />
          Системээс гарах
        </button>
      </main>
    </div>
  );
}