import { PrismaClient } from '@prisma/client'

declare global {
    var prisma: PrismaClient | undefined
}

console.log(`Current Global Prisma: ${global.prisma}`)

export const prisma = global.prisma || new PrismaClient({log: ['query'],})

//if (process.env.NODE_ENV !== 'production') global.prisma = prisma
global.prisma = prisma
