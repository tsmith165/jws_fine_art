import '@/lib/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './db/schema.ts',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.NEON_DATABASE_URL!,
    },
    out: './drizzle',
    verbose: true,
    strict: true,
});
