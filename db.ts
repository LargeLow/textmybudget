import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For serverless environments, use connection pooling
neonConfig.poolQueryViaFetch = true;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is missing");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let pool: Pool | null = null;
let dbInstance: any = null;

function getDb() {
  if (!dbInstance) {
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 1, // Limit connections for serverless
    });
    dbInstance = drizzle({ client: pool, schema });
  }
  return dbInstance;
}

export const db = getDb();