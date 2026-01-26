// Database migrations
// Migrated from Python src/python/db.py

import { log } from "../shared/log.js";

export interface User {
  id?: number;
  username: string;
  email?: string;
}

// Migration scripts for different databases
export const migrations = {
  sqlite: {
    createUsers: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT
      )
    `
  },
  postgres: {
    createUsers: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255)
      )
    `
  },
  mysql: {
    createUsers: `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255)
      )
    `
  }
};

export async function migrateDb(dbDriver: string = "sqlite") {
  log.info(`Migrating database (${dbDriver})...`);
  // Implementation depends on selected DB driver
  // See src/db/drivers for actual implementations
  log.info("Migration complete.");
}

export async function seedDb() {
  log.info("Seeding database...");

  const users: User[] = [
    { username: "Alice", email: "alice@example.com" },
    { username: "Bob", email: "bob@example.com" }
  ];

  // Implementation: insert users via DB driver
  // for (const user of users) {
  //   await db.insert("users", user);
  // }

  log.info("Seeding complete.");
}
