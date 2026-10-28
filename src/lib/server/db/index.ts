import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const url = env.DATABASE_URL ?? 'file:local.db';
const authToken = env.DATABASE_AUTH_TOKEN;

if (!dev && !authToken && !url.startsWith('file:')) {
  throw new Error('DATABASE_AUTH_TOKEN is required for remote databases');
}

const client = createClient({ url, authToken });
export const db = drizzle(client);
