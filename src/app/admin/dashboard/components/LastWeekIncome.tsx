

export default function LastWeekIncome({ chart }: { chart: { date: string, revenue: number }[] }) {

    return (<div className="flex justify-between items-center mb-1">
        <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Сүүлийн 7 хоногийн орлого</h3>
            <p className="text-slate-400 dark:text-zinc-500 text-xs mt-0.5">Хүргэгдсэн захиалгын нийт дүн</p>
        </div>
        <div className="text-right">
            <p className="text-xs text-slate-400 dark:text-zinc-500">Нийт</p>
            <p className="text-lg font-bold text-teal-400">
                ₮{chart.reduce((s, d) => s + Number(d.revenue), 0).toLocaleString()}
            </p>
        </div>
    </div>)
}