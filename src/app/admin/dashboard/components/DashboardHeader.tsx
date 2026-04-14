import { PageKey } from "@/app/context/admin_context";
import DateRangePicker from "@/ui/DateRangePicker";

interface DashboardHeaderProps {
    today: String;
    setActivePage: (page: PageKey) => void;
    onDateChange: (dateFrom: string, dateTo: string) => void;
    dateFrom: string;
    dateTo:   string;
}

export default function DashboardHeader({ today, setActivePage, onDateChange, dateFrom, dateTo }: DashboardHeaderProps) {
    return (
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-10">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Сайн байна уу, Админ!</h2>
                <p className="text-slate-400 dark:text-zinc-500 text-sm">{today} — дэлгүүрийн тойм</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onChange={onDateChange} />
                <button
                    onClick={() => setActivePage("Захиалгууд")}
                    className="px-4 py-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm font-bold rounded-xl hover:bg-teal-500/20 transition-colors"
                >
                    Захиалгууд
                </button>
                <button
                    onClick={() => setActivePage("Шинэ бүтээгдэхүүнүүд")}
                    className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                >
                    + Бараа нэмэх
                </button>
            </div>
        </header>
    );
}