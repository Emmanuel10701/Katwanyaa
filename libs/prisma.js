import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// ✅ CHANGE MADE HERE: Pass the database URL directly to the constructor
export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL, 
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}