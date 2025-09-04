import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';

const sqlite = new Database('./movie_bot.db');
export const db = drizzle(sqlite, { schema });

export async function initializeDatabase() {
  try {
    // Test the connection
    await db.select().from(schema.userSettings).limit(1);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
} 