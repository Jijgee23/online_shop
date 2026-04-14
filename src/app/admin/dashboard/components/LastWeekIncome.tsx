export default function LastWeekIncome({
    chart, dateFrom, dateTo,
}: {
    chart: { date: string; revenue: number }[];
    dateFrom?: string;
    dateTo?:   string;
}) {
    const title = (() => {
        if (!dateFrom && !dateTo) return "Сүүлийн 7 хоногийн орлого";
        const days = dateFrom && dateTo
            ? Math.round((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000) + 1
            : null;
        if (days === 1) return "Өнөөдрийн орлого";
        if (days) return `Сүүлийн ${days} хоногийн орлого`;
        return "Орлого";
    })();

    return (
        <div className="flex justify-between items-center mb-1">
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="text-slate-400 dark:text-zinc-500 text-xs mt-0.5">Хүргэгдсэн захиалгын нийт дүн</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-slate-400 dark:text-zinc-500">Нийт</p>
                <p className="text-lg font-bold text-teal-400">
                    ₮{chart.reduce((s, d) => s + Number(d.revenue), 0).toLocaleString()}
                </p>
            </div>
        </div>
    );
}