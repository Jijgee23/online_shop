

export default function DividerLine({ label }: { label: string }) {
    return (<div className="relative mb-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-zinc-800" /></div>
        <div className="relative flex justify-center">
            <span className="bg-slate-50 dark:bg-black px-4 text-slate-400 dark:text-zinc-600 text-xs font-bold uppercase tracking-widest">{label}</span>
        </div>
    </div>)
}