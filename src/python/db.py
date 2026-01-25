import sqlite3
import os
# For PostgreSQL/MySQL/MongoDB you can import their clients

DB_PATH = "data/database.db"

def migrate_db():
    print("Migrating database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT
    )
    """)
    conn.commit()
    conn.close()
    print("Migration complete.")

def seed_db():
    print("Seeding database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (username, email) VALUES (?, ?)", ("Alice", "alice@example.com"))
    cursor.execute("INSERT INTO users (username, email) VALUES (?, ?)", ("Bob", "bob@example.com"))
    conn.commit()
    conn.close()
    print("Seeding complete.")
