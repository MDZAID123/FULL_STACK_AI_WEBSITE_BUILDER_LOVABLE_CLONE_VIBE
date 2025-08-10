import {PrismaClient} from "@/generated/prisma";


const globalForPrisma=global as unknown as {
    prisma:PrismaClient
}

export const prisma=globalForPrisma.prisma || new PrismaClient()
// every time in next js hotreloading happens new prisma client get spin up which is not 
// correct logically


if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma=prisma

