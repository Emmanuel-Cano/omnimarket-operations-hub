import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const g = globalThis as unknown as { prisma?: PrismaClient }

function create() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('Falta DATABASE_URL (copia .env.example a .env)')
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}

export const prisma = g.prisma ?? create()
if (process.env.NODE_ENV !== 'production') g.prisma = prisma
