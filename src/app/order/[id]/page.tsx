"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useOrder } from "@/app/context/order_context";
import Header from "@/app/components/Header";
import AddressInfo from "../components/AddressInfo";
import OrderItems from "../components/OrderItems";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { orders } = useOrder();

  const order = orders.find((o) => o.id === Number(id));

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-slate-950">
        <p className="text-slate-500 mb-4">Захиалга олдсонгүй.</p>
        <button onClick={() => router.back()} className="text-teal-500 font-bold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Буцах
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-6">

        {/* Back Button & Title */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-teal-500 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Захиалгын жагсаалт руу буцах</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <OrderItems key={order.id} {...order}></OrderItems>
            <AddressInfo key={order.address?.id} {...order}></AddressInfo>
          </div>

          {/* Right: Summary & Status */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Төлөв байдал</h3>
              <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-2xl border border-teal-100 dark:border-teal-800">
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                <span className="text-teal-700 dark:text-teal-400 font-bold text-sm">
                  {order.status === 'DELIVERED' ? 'Амжилттай хүргэгдсэн' : 'Боловсруулагдаж байна'}
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-slate-900 dark:bg-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-teal-500/10">
              <h3 className="text-teal-200 dark:text-teal-100 text-sm font-medium mb-1">Нийт төлсөн дүн</h3>
              <p className="text-3xl font-extrabold">₮{order.totalPrice?.toLocaleString()}</p>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-teal-100">
                <CreditCard className="w-4 h-4" />
                <span>Дансаар шилжүүлсэн</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}