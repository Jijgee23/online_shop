"use client"

import { UserStatus } from "@/generated/prisma";
import { Customer } from "@/interface/user";
import { getStatusName } from "@/utils/utils";
import { useRouter } from "next/navigation"; // Router нэмсэн

export default function CustomerTile(user: Customer) {
  const router = useRouter();

  // Хуудас шилжих функц
  const handleRowClick = () => {
    router.push(`/admin/customers/${user.id}`);
  };

  // Үйлдэл хийх товчнууд дээр дарахад Row-ийн click event-ийг ажиллуулахгүй байх (Propagation)
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <tr 
      key={user.id} 
      onClick={handleRowClick}
      className="hover:bg-zinc-800/50 transition-all group cursor-pointer border-b border-zinc-900/50 last:border-0"
    >
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          {/* Avatar-д hover эффект нэмсэн */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold text-white border border-zinc-700 group-hover:border-teal-500/50 transition-colors">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-white text-sm group-hover:text-teal-400 transition-colors">{user.name}</p>
            <p className="text-xs text-zinc-500 font-mono">ID: #USR-{user.id + 1000}</p>
          </div>
        </div>
      </td>
      
      <td className="px-8 py-5 text-sm">
        <p className="text-zinc-300">{user.email}</p>
        <p className="text-zinc-500 text-xs">{user.phone ?? 'Утас байхгүй'}</p>
      </td>
      
      <td className="px-8 py-5 text-center">
        <p className="text-white font-mono text-sm font-bold">{user.totalOrders}</p>
        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">₮{(user.totalSpent ?? 0).toLocaleString()}</p>
      </td>
      
      <td className="px-8 py-5">
        <span className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-colors ${
          user.status === UserStatus.ACTIVE ? "bg-teal-500/10 border-teal-500/20 text-teal-400" :
          user.status === UserStatus.NEW ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
          "bg-red-500/10 border-red-500/20 text-red-500"
        }`}>
          {getStatusName(user.status)}
        </span>
      </td>
      
      <td className="px-8 py-5 text-right" onClick={handleActionClick}>
        <div className="flex justify-end gap-2">
          {/* Edit Button */}
          <button className="p-2 hover:bg-zinc-700 rounded-lg transition-all text-zinc-400 hover:text-white active:scale-90">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          
          {/* Delete/Block Button */}
          <button className="p-2 hover:bg-red-500/20 rounded-lg transition-all text-zinc-500 hover:text-red-500 active:scale-90">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}