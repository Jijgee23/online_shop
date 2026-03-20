"use client";

export default function AdminDashboardPage() {
  const stats = [
    { name: "Нийт борлуулалт", value: "₮12.4M", change: "+12.5%", icon: "💰" },
    { name: "Шинэ захиалга", value: "48", change: "+5.2%", icon: "📦" },
    { name: "Хэрэглэгчид", value: "1,240", change: "+18%", icon: "👥" },
    { name: "Барааны үлдэгдэл", value: "342", change: "-2%", icon: "🏬" },
  ];

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Сайн байна уу, Админ!</h2>
          <p className="text-zinc-500">Өнөөдрийн байдлаар таны дэлгүүрийн үзүүлэлтүүд.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold">A</div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.name}</h3>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders / Content Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Сүүлийн захиалгууд</h3>
          <button className="text-xs text-teal-400 font-bold hover:underline">Бүгдийг харах</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/50 text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-4">Дугаар</th>
                <th className="px-8 py-4">Хэрэглэгч</th>
                <th className="px-8 py-4">Төлөв</th>
                <th className="px-8 py-4 text-right">Үнийн дүн</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                  <td className="px-8 py-5 font-mono text-zinc-400">#ORD-2024-00{i}</td>
                  <td className="px-8 py-5 font-bold text-white">Bat-Erdene T.</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded-full">Хүлээгдэж буй</span>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-white">₮{(i * 125000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
