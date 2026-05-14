import { ProductService } from "@/services/product.service";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },) {
    try {
        const { id } = await context.params;
        const result = await ProductService.permanentDelete(Number(id))
        if ('message' in result) return NextResponse.json({ message: result.message }, { status: 400 })
        return NextResponse.json({ product: result }, { status: 200 })
    } catch (err) {
        console.log(err)
        return NextResponse.json({ message: 'Амжилтгүй' }, { status: 500 })
    }
}