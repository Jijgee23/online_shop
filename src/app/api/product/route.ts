import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;

    // Параметрүүдийг цэгцлэх
    const params = {
      categoryId: p.get("category") ? Number(p.get("category")) : undefined,
      search: p.get("search") || "",
      priceMin: p.get("priceMin") ? Number(p.get("priceMin")) : undefined,
      priceMax: p.get("priceMax") ? Number(p.get("priceMax")) : undefined,
      inStock: p.get("inStock") === "1",
      sort: p.get("sort") || "newest",
      page: Math.max(1, Number(p.get("page")) || 1), // 1-ээс бага байж болохгүй
      pageSize: Math.min(100, Number(p.get("pageSize")) || 20), // Max 100-аар хязгаарлах
    };

    const { products, total } = await ProductService.fetchProducts(params);

    return NextResponse.json({
      data: products,
      pagination: {
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(total / params.pageSize),
      }
    });
  } catch (err) {
    console.error("Product API Error:", err);
    return NextResponse.json({ error: "Бүтээгдэхүүний жагсаалт авахад алдаа гарлаа" }, { status: 500 });
  }
}