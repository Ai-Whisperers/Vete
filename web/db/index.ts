import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" mode if using pooling
// But for Supabase direct connection, it might be fine.
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
