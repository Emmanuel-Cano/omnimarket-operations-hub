import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { resetDatabase } from '../src/lib/server/seed-data'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
resetDatabase(prisma)
  .then(r => console.log(`Seed OK: ${r.orders} pedidos`))
  .finally(() => prisma.$disconnect())
