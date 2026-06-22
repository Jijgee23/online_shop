/**
 * Backfill: хуучин бараа бүрт нэг default ProductStock мөр үүсгэнэ.
 *   color = null, size = null, stock = Product.stock, price = Product.price
 *
 * Idempotent: аль хэдийн ямар нэг ProductStock-той бараанд дахин үүсгэхгүй.
 *
 * Ажиллуулах:
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\",\"moduleResolution\":\"node\"}" scripts/backfill-product-stock.ts
 */
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // ProductStock мөргүй бараануудыг л авна (idempotent)
  const products = await prisma.product.findMany({
    where: { productStocks: { none: {} } },
    select: { id: true, stock: true, price: true, discountPrice: true, sku: true },
  })

  if (products.length === 0) {
    console.log('Бүх бараа аль хэдийн default ProductStock-той байна. Хийх зүйл алга.')
    return
  }

  console.log(`${products.length} бараанд default ProductStock үүсгэж байна...`)

  let created = 0
  for (const p of products) {
    await prisma.productStock.create({
      data: {
        productId: p.id,
        productColorId: null,
        productSizeId: null,
        stock: p.stock ?? 0,
        price: p.price,
        discountPrice: p.discountPrice,
        sku: p.sku ?? null,
      },
    })
    created++
  }

  console.log(`Амжилттай: ${created} default ProductStock мөр үүслээ.`)
}

main()
  .catch((e) => {
    console.error('Backfill алдаа:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
