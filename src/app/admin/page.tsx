"use client"

import { useState } from "react";
import { useAdmin, PageKey } from "../context/admin_context";
import { useAuth } from "../context/auth_context";
import ProfileSection from "../components/ProfileSection";

export default function AdminDashboard() {

  const { activePage, setActivePage, isMobileSidebarOpen, setIsMobileSidebarOpen, pages } = useAdmin()

  const handlePageChange = (page: PageKey) => {
    setActivePage(page);
    setIsMobileSidebarOpen(false);
  };



  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex">

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 border-r border-zinc-800 flex flex-col p-6 space-y-8 bg-zinc-900/20 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isMobileSidebarOpen ? 'lg:flex' : 'hidden lg:flex'}`}>
        {/* Mobile Close Button */}

        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden self-end mb-4 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="font-bold text-white text-xl tracking-tighter">ISHOP <span className="text-teal-500">ADMIN</span></div>
        <ProfileSection/>
        <nav className="space-y-2">
          {(["Хянах самбар", "Захиалгууд", "Бүтээгдэхүүнүүд", "Шинэ бүтээгдэхүүнүүд", "Ангилал", "Харилцагчид", "Тохиргоо"] as const).map((item) => (
            <button
              key={item}
              onClick={() => handlePageChange(item)}
              className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${item === activePage ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-zinc-800'
                }`}
            >
              {item}
            </button>
          ))}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="font-bold text-white text-lg tracking-tighter">ISHOP <span className="text-teal-500">ADMIN</span></div>

        </div>

        {pages[activePage]}

      </main>

    </div>
  )
}