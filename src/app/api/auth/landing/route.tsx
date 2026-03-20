"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export async function LandingPage() {
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/landing", {
      method: "GET",
    });

    if (res.ok) {
      router.push("/landing");
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <form onSubmit={handleSignup} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-zinc-800">Бүртгүүлэх</h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Нэр"
            className="w-full p-3 border rounded-lg focus:outline-teal-500 text-zinc-800"
           
          />
          <input
            type="email"
            placeholder="Имэйл"
            className="w-full p-3 border rounded-lg focus:outline-teal-500 text-zinc-800"
          
            required
          />
          <input
            type="password"
            placeholder="Нууц үг"
            className="w-full p-3 border rounded-lg focus:outline-teal-500 text-zinc-800"
           
            required
          />
          <button className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700">
            Бүртгүүлэх
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-zinc-600">
          Бүртгэлтэй юу? <a href="/login" className="text-teal-600 hover:underline">Нэвтрэх</a>
        </p>
      </form>
    </div>
  );
}