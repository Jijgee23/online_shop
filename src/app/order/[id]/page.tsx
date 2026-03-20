"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, CreditCard, ShoppingBag } from "lucide-react";
import { useOrder } from "@/app/context/order_context";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { orders } = useOrder();
  
  // Тухайн ID-тай захиалгыг хайж олох
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
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-teal-500" />
                  Захиалсан бараанууд
                </h2>
                <span className="text-sm text-slate-400">ID: #{order.id}</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Энд таны OrderItem-ууд харагдана. 
                    Хэрэв та Prisma include: { items: { include: { product: true } } } хийсэн бол:
                */}
                {order.items?.map((item: any) => (
                  <div key={item.id} className="p-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center">
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.product?.name || "Бараа"}</h4>
                      <p className="text-sm text-slate-500">{item.quantity} ширхэг x ₮{item.product?.price?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">₮{(item.quantity * item.product?.price).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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