import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const districts = [
    'Баянзүрх', 'Баянгол', 'Сонгинохайрхан', 'Чингэлтэй',
    'Сүхбаатар', 'Хан-Уул', 'Налайх', 'Багануур', 'Багахангай'
  ]

  for (const name of districts) {
    await prisma.district.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('✅ Дүүргүүд амжилттай нэмэгдлээ')

  await prisma.category.upsert({
    where: { slug: 'busad' },
    update: {},
    create: {
      name: 'Бусад',
      slug: 'busad',
      state: 'ACTIVE',
      featured: false,
    },
  })
  console.log('✅ "Бусад" ангилал амжилттай нэмэгдлээ')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
