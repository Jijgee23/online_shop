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

// ─── Үлдэгдлийн тайлан ────────────────────────────────────────────────────────

const INV_TYPE_LABEL: Record<string, string> = {
    simple:  "Энгийн",
    variant: "Хувилбартай",
    stock:   "Өнгө/хэмжээ",
};

interface InventoryExportItem {
    productId: number;
    name: string;
    sku: string | null;
    categoryName: string | null;
    type: string;
    totalStock: number;
    variantCount: number;
    breakdown: { label: string; sku: string | null; stock: number }[];
}

interface InventoryExportData {
    threshold: number;
    summary: { totalProducts: number; totalUnits: number; lowStockCount: number; outOfStockCount: number };
    items: InventoryExportItem[];
}

export function exportInventoryToExcel(data: InventoryExportData) {
    const { summary, threshold, items } = data;

    const summaryRows: (string | number)[][] = [
        ["Тайлан",                "Барааны үлдэгдэл"],
        ["Бага үлдэгдлийн босго", threshold],
        [],
        ["Нийт бараа",            summary.totalProducts],
        ["Нийт үлдэгдэл (ширхэг)", summary.totalUnits],
        ["Бага үлдэгдэлтэй",      summary.lowStockCount],
        ["Дууссан",               summary.outOfStockCount],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet["!cols"] = [{ wch: 24 }, { wch: 20 }];

    // Бараагаар
    const itemHeaders = ["#", "Бараа", "SKU", "Ангилал", "Төрөл", "Нийт үлдэгдэл", "Хувилбарын тоо"];
    const itemRows = items.map((i, idx) => [
        idx + 1,
        i.name,
        i.sku ?? "",
        i.categoryName ?? "",
        INV_TYPE_LABEL[i.type] ?? i.type,
        i.totalStock,
        i.variantCount,
    ]);
    const itemSheet = XLSX.utils.aoa_to_sheet([itemHeaders, ...itemRows]);
    itemSheet["!cols"] = [5, 40, 20, 24, 16, 16, 16].map(wch => ({ wch }));

    // Хувилбараар (задаргаа)
    const varHeaders = ["Бараа", "Хувилбар", "SKU", "Үлдэгдэл"];
    const varRows: (string | number)[][] = [];
    for (const i of items) {
        for (const b of i.breakdown) {
            varRows.push([i.name, b.label, b.sku ?? "", b.stock]);
        }
    }
    const varSheet = XLSX.utils.aoa_to_sheet([varHeaders, ...varRows]);
    varSheet["!cols"] = [40, 28, 20, 14].map(wch => ({ wch }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "Хураангуй");
    XLSX.utils.book_append_sheet(wb, itemSheet,    "Бараагаар");
    if (varRows.length > 0) XLSX.utils.book_append_sheet(wb, varSheet, "Хувилбараар");

    XLSX.writeFile(wb, `inventory_report_${new Date().toISOString().split("T")[0]}.xlsx`);
}
