import * as XLSX from "xlsx";

type ReportType = "products" | "districts" | "payment_method" | "category";

interface ReportMeta {
    dateFrom: string;
    dateTo: string;
    userId: number | null;
    totalRevenue: number;
    totalOrders: number;
}

interface ReportResult {
    meta: ReportMeta;
    type: ReportType;
    items: any[];
}

const REPORT_LABEL: Record<ReportType, string> = {
    products:       "Бүтээгдэхүүнээр",
    districts:      "Дүүргээр",
    payment_method: "Төлбөрийн аргаар",
    category:       "Ангилалаар",
};

function buildRows(result: ReportResult): { headers: string[]; rows: (string | number)[][]; colWidths: number[] } {
    const { type, items } = result;

    if (type === "products") {
        return {
            headers:   ["#", "Бүтээгдэхүүн", "SKU", "Орлого (₮)", "Тоо ширхэг", "Захиалга"],
            colWidths: [5,    40,             20,    16,            14,            12],
            rows: items.map(i => [
                i.rank,
                i.name,
                i.sku ?? "",
                i.totalRevenue,
                i.totalQuantity,
                i.orderCount,
            ]),
        };
    }

    if (type === "districts") {
        return {
            headers:   ["Дүүрэг", "Захиалгын тоо", "Нийт орлого (₮)", "Дундаж дүн (₮)"],
            colWidths: [28,        16,               20,                 20],
            rows: items.map(i => [
                i.districtName,
                i.orderCount,
                i.totalRevenue,
                i.orderCount > 0 ? Math.round(i.totalRevenue / i.orderCount) : 0,
            ]),
        };
    }

    if (type === "payment_method") {
        const totalAll = items.reduce((s, i) => s + i.totalAmount, 0);
        return {
            headers:   ["Төрөл", "Захиалгын тоо", "Нийт дүн (₮)", "Эзлэх хувь (%)"],
            colWidths: [22,       16,               18,              16],
            rows: items.map(i => [
                i.label,
                i.orderCount,
                i.totalAmount,
                totalAll > 0 ? Number(((i.totalAmount / totalAll) * 100).toFixed(2)) : 0,
            ]),
        };
    }

    // category
    return {
        headers:   ["Ангилал", "Бүтээгдэхүүн", "Нийт орлого (₮)", "Тоо ширхэг"],
        colWidths: [28,         16,              20,                 14],
        rows: items.map(i => [
            i.name,
            i.productCount,
            i.totalRevenue,
            i.totalQuantity,
        ]),
    };
}

export function exportReportToExcel(result: ReportResult, customerName?: string | null) {
    const { meta, type } = result;
    const reportLabel = REPORT_LABEL[type];
    const avgOrder = meta.totalOrders > 0 ? Math.round(meta.totalRevenue / meta.totalOrders) : 0;

    const summaryRows: (string | number)[][] = [
        ["Тайлан",          reportLabel],
        ["Эхлэх огноо",     meta.dateFrom],
        ["Дуусах огноо",    meta.dateTo],
        ["Хэрэглэгч",       customerName || "Бүгд"],
        [],
        ["Нийт орлого",     meta.totalRevenue],
        ["Захиалгын тоо",   meta.totalOrders],
        ["Дундаж захиалга", avgOrder],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet["!cols"] = [{ wch: 22 }, { wch: 26 }];

    const { headers, rows, colWidths } = buildRows(result);
    const dataSheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    dataSheet["!cols"] = colWidths.map(wch => ({ wch }));

    const range = XLSX.utils.decode_range(dataSheet["!ref"]!);
    for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddr = XLSX.utils.encode_cell({ r: 0, c });
        const cell = dataSheet[cellAddr];
        if (cell) cell.s = { font: { bold: true } };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "Хураангуй");
    XLSX.utils.book_append_sheet(wb, dataSheet,    "Тайлан");

    const safeLabel = reportLabel.replace(/[^a-zA-Z0-9а-яА-ЯөүӨҮёЁ]+/g, "_");
    const fileName  = `report_${safeLabel}_${meta.dateFrom}_${meta.dateTo}.xlsx`;

    XLSX.writeFile(wb, fileName);
}
