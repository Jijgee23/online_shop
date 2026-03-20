"use client";
import { useState, useEffect } from "react";
import {  Customer }  from '@/interface/user'
import CustomerTable from "./components/table/table";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // fetch users from backend
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/customer');
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        const customerData = Array.isArray(json.data) ? json.data : [];
        setCustomers(customerData);
      } catch (err) {
        console.error('Error fetching customers', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredCustomers = (customers || []).filter(c => 
    c && c.name && c.email && (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Хэрэглэгчид</h2>
          <p className="text-zinc-500 text-sm">Нийт бүртгэлтэй хэрэглэгчдийн мэдээлэл болон идэвх.</p>
        </div>
        
        <div className="relative group w-full md:w-80">
          <input
            type="text"
            placeholder="Нэр эсвэл имэйлээр хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all shadow-xl"
          />
          <svg className="w-5 h-5 absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Нийт хэрэглэгч</p>
          <p className="text-3xl font-bold text-white">{filteredCustomers.length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Шинэ (Сүүлийн 7 хоног)</p>
          <p className="text-3xl font-bold text-teal-400">{filteredCustomers.length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Идэвхгүй</p>
          <p className="text-3xl font-bold text-zinc-600">{filteredCustomers.length}</p>
        </div>
      </div>

      Харилцагчид
      <div className="h-5"></div>
      {loading ? (
        <div className="text-white p-6">Loading users...</div>
      ) : (
          <CustomerTable customers={filteredCustomers}/>
      )}
    </>
  );
}