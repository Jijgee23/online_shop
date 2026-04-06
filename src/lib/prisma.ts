import { PrismaClient, Prisma } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Decimal утгуудыг JSON-д number болгон серилизлах
(Prisma.Decimal.prototype as any).toJSON = function () {
  return this.toNumber();
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
export const prisma = new PrismaClient({ adapter });