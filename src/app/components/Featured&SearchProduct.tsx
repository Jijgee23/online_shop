import Link from "next/link";
import { Dispatch, SetStateAction } from "react";



export default function FeaturedSearchProduct(props: { searchQuery: string, setSearchQuery: Dispatch<SetStateAction<string>> }) {
    return (
        <section className="relative pt-32 pb-24 overflow-hidden bg-slate-900 dark:bg-slate-950 border-b border-slate-800">
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-teal-500/20 blur-[120px] rounded-full mix-blend-screen"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
                <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
                    Таны хүссэн <br className="md:hidden" />
                    <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">бүтээгдэхүүн</span>
                </h2>
                <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Чанартай, хямд үнэтэй бүтээгдэхүүнүүдийг нэг дороос. Өөртөө болон хайртай дотны хүмүүстээ зориулан ухаалаг сонголт хийгээрэй.
                </p>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-full p-2 shadow-xl border border-slate-100 dark:border-slate-800">
                        <div className="pl-4 pr-2 text-slate-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            type="text"
                            value={props.searchQuery}
                            onChange={(e) => props.setSearchQuery(e.target.value)}
                            placeholder="Хайх бүтээгдэхүүнээ энд бичнэ үү..."
                            className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-slate-900 dark:text-white w-full"
                        />
                        <Link href={`/product?search=${props.searchQuery}`}>
                            <button className="bg-slate-900 dark:bg-teal-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-slate-800 dark:hover:bg-teal-400 transition-colors">
                                Хайх
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}