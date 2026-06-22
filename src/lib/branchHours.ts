// Салбарын ажлын цагийн хуваарь — нэгдсэн төрөл, утга, туслах функцууд.
// hours нь 7 элемент бүхий массив, Даваа..Ням дарааллаар.

export interface DayHours {
    open: boolean;
    from: string; // "HH:mm"
    to: string;   // "HH:mm"
}

export type BranchHours = DayHours[]; // length 7, Mon..Sun

export const DAY_NAMES = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];
export const DAY_SHORT = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];

export const defaultHours = (): BranchHours =>
    Array.from({ length: 7 }, (_, i) => ({ open: i < 5, from: "09:00", to: "18:00" }));

// Янз бүрийн утгыг (null / буруу бүтэц) 7 элемент бүхий хүчинтэй массив руу хөрвүүлэх.
export function normalizeHours(value: unknown): BranchHours | null {
    if (!Array.isArray(value) || value.length === 0) return null;
    const out: BranchHours = [];
    for (let i = 0; i < 7; i++) {
        const d = value[i] as Partial<DayHours> | undefined;
        out.push({
            open: Boolean(d?.open),
            from: typeof d?.from === "string" ? d.from : "09:00",
            to: typeof d?.to === "string" ? d.to : "18:00",
        });
    }
    return out;
}

// JS getDay() (0=Ням) → бидний Даваа=0 индекс рүү.
const todayIndex = (d: Date) => (d.getDay() + 6) % 7;

const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
};

export interface OpenStatus {
    open: boolean;
    today: DayHours | null;
}

// Тухайн агшинд салбар нээлттэй эсэх (шөнө дамнасан цагийг дэмжинэ).
export function openStatus(hours: BranchHours | null, now: Date = new Date()): OpenStatus {
    if (!hours) return { open: false, today: null };
    const today = hours[todayIndex(now)] ?? null;
    if (!today || !today.open) return { open: false, today };
    const cur = now.getHours() * 60 + now.getMinutes();
    const from = toMinutes(today.from);
    const to = toMinutes(today.to);
    const open = to > from ? cur >= from && cur < to : cur >= from || cur < to;
    return { open, today };
}

// Адил цагтай дараалсан өдрүүдийг бүлэглэн товч хуваарь үүсгэх.
// Жишээ: "Да–Баа 09:00–18:00", "Бя 10:00–16:00".
export function summarizeHours(hours: BranchHours | null): string[] {
    if (!hours) return [];
    const lines: string[] = [];
    let i = 0;
    while (i < 7) {
        const d = hours[i];
        if (!d?.open) { i++; continue; }
        let j = i;
        while (j + 1 < 7 && hours[j + 1]?.open && hours[j + 1].from === d.from && hours[j + 1].to === d.to) j++;
        const label = i === j ? DAY_SHORT[i] : `${DAY_SHORT[i]}–${DAY_SHORT[j]}`;
        lines.push(`${label} ${d.from}–${d.to}`);
        i = j + 1;
    }
    return lines;
}
