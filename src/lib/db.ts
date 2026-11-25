import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error'], // لا تسجّل كل استعلام في الإنتاج — فعّل 'query' فقط عند التصحيح
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db