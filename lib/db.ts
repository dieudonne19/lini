import { PrismaNeon } from "@prisma/adapter-neon"

import { PrismaClient } from "@/lib/generated/prisma/client"

// Reuse one client across hot reloads in development, so connections are not multiplied.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// The Neon adapter talks over WebSocket on port 443: port 5432 is blocked on some networks.
function createClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error("DATABASE_URL is not set")
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
