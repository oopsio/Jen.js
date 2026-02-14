# This file is part of Jen.js.
# Copyright (C) 2026 oopsio
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

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
