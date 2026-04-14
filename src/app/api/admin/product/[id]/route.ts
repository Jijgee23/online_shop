import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },) {

    const { id } = await context.params;
    const product = await prisma.product.findUnique({ where: { id: Number(id) } })
    if (!product) return NextResponse.json({ message: 'Бараа олдсонгүй' }, { status: 404 })
    try {
        const formData = await req.formData();
        const productData = await ProductService.updateProdcut(Number(id), formData)
        if (productData.message) {
            return NextResponse.json({ message: productData.message }, { status: 400 })
        }
        if (productData.success) {
            return NextResponse.json({ message: 'Амжилттай', data: productData.data }, { status: 200 })
        }
        return NextResponse.json({ message: 'Амжилтгүй' }, { status: 500 })
    } catch (err) {
        return NextResponse.json({ message: 'Амжилтгүй' }, { status: 500 })
    }
}


export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> },) {
    const { id } = await context.params;
    try {
        const productDetail = await ProductService.productDetail(Number(id))
        if (!productDetail) {
            return NextResponse.json({ message: 'Бараа олдсонгүй' }, { status: 404 });
        }
        return NextResponse.json({ product: productDetail }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: 'Амжилтгүй', error: err }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },) {
    try {
        const { id } = await context.params;
        const deactivedProduct = await ProductService.deactive(Number(id))
        if (deactivedProduct?.message) return NextResponse.json({ message: deactivedProduct.message }, { status: 400 })
        return NextResponse.json({ procuct: deactivedProduct }, { status: 200 })
    } catch (err) {
        console.log(err)
        return NextResponse.json({ message: 'Амжилтгүй' }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },) {
    try {
        const { id } = await context.params;
        const updatedProduct = await ProductService.putBack(Number(id))
        if (!updatedProduct) return NextResponse.json({ message: 'Өгөгдөл шинэчилж чадсангүй' }, { status: 400 })
        return NextResponse.json({ product: updatedProduct }, { status: 200 })
    } catch (err) {
        console.log(err)
        return NextResponse.json({ message: 'Амжилтгүй' }, { status: 500 })
    }
}