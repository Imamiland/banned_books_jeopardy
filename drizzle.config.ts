import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL ?? 'file:local.db';

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',

  dbCredentials: {
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN
  },

  verbose: true,
  strict: true,
  dialect: 'sqlite'
});
