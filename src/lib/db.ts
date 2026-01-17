import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Get connection string from environment
const connectionString = process.env.DATABASE_URL!;

// Parse the database name from the connection string
function getDatabaseName(url: string): string {
  try {
    // Handle both postgres:// and postgresql:// formats
    const urlObj = new URL(url.replace(/^postgres:/, 'postgresql:'));
    // pathname is /database_name, so remove the leading slash
    return urlObj.pathname.slice(1) || 'template1';
  } catch {
    return 'template1';
  }
}

const databaseName = getDatabaseName(connectionString);

// Create pool with explicit connection string and parsed database
const pool = new Pool({
  connectionString,
  database: databaseName,
});

const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
