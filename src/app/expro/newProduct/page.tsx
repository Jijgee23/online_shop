// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function AddProductPage() {
//   const [formData, setFormData] = useState({
//     name: "",
//     category: "",
//     price: "",
//     stock: "",
//     description: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleChange = (e: { target: { name: any; value: any; }; }) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: { preventDefault: () => void; }) => {
//     e.preventDefault();
//     setLoading(true);
//     // Энд таны API дуудлага хийгдэнэ (Жишээ нь: /api/products/add)
//     setTimeout(() => {
//       setLoading(false);
//       alert("Бараа амжилттай бүртгэгдлээ!");
//       router.push("/pages/products");
//     }, 1500);
//   };

//   return (
//     <div className="min-h-screen relative bg-slate-950 px-4 py-12 overflow-hidden font-sans">
//       {/* Background Orbs */}
//       <div className="fixed top-0 -right-20 w-96 h-96 bg-teal-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
//       <div className="fixed bottom-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse delay-700"></div>

//       <div className="max-w-4xl mx-auto relative z-10">
//         {/* Back Button & Title */}
//         <div className="flex items-center justify-between mb-10">
//           <Link
//             href="/admin/dashboard"
//             className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors group"
//           >
//             <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-teal-500/50">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
//               </svg>
//             </div>
//             <span className="font-medium">Буцах</span>
//           </Link>
//           <h1 className="text-3xl font-extrabold text-white tracking-tight">
//             Шинэ <span className="text-teal-400">Бараа Бүртгэх</span>
//           </h1>
//         </div>

//         <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           {/* Left Side: Image Upload Placeholder */}
//           <div className="lg:col-span-1">
//             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 text-center sticky top-10">
//               <h3 className="text-white font-bold mb-6">Барааны зураг</h3>
//               <div className="relative group cursor-pointer">
//                 <div className="aspect-square rounded-3xl border-2 border-dashed border-slate-700 group-hover:border-teal-500/50 bg-slate-900/50 flex flex-col items-center justify-center transition-all">
//                   <svg className="w-12 h-12 text-slate-500 group-hover:text-teal-400 mb-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                   </svg>
//                   <span className="text-xs text-slate-500 font-medium px-4">Зураг чирж оруулна уу эсвэл сонгоно уу</span>
//                 </div>
//                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
//               </div>
//               <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest">PNG, JPG, WEBP (Max 5MB)</p>
//             </div>
//           </div>

//           {/* Right Side: Form Details */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-6">
              
//               {/* Product Name */}
//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Барааны нэр</label>
//                 <input
//                   type="text"
//                   name="name"
//                   required
//                   placeholder="Жишээ: Wireless Headphones V2"
//                   className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Category */}
//                 <div className="space-y-2">
//                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Ангилал</label>
//                   <select
//                     name="category"
//                     className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all appearance-none cursor-pointer"
//                     onChange={handleChange}
//                   >
//                     <option value="">Сонгох...</option>
//                     <option value="electronics">Электроник</option>
//                     <option value="clothing">Хувцас</option>
//                     <option value="watch">Цаг</option>
//                   </select>
//                 </div>

//                 {/* Price */}
//                 <div className="space-y-2">
//                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Үнэ (₮)</label>
//                   <input
//                     type="number"
//                     name="price"
//                     placeholder="0.00"
//                     className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
//                     onChange={handleChange}
//                   />
//                 </div>
//               </div>

//               {/* Description */}
//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Тайлбар</label>
//                 <textarea
//                   name="description"
//                 //   rows="5"
//                   placeholder="Барааны дэлгэрэнгүй мэдээллийг энд бичнэ үү..."
//                   className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all resize-none"
//                   onChange={handleChange}
//                 ></textarea>
//               </div>

//               {/* Submit Button */}
//               <div className="pt-4 flex flex-col sm:flex-row gap-4">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50"
//                 >
//                   {loading ? (
//                     <span className="flex items-center justify-center gap-3">
//                       <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Бүртгэж байна...
//                     </span>
//                   ) : (
//                     "Барааг хадгалах"
//                   )}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => router.back()}
//                   className="px-10 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
//                 >
//                   Цуцлах
//                 </button>
//               </div>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }