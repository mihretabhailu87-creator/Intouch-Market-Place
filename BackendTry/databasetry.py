
import sqlite3 as sql
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
DATABASE_PATH = BASE_DIR / "list.db"
conn = sql.connect(DATABASE_PATH)
cur = conn.cursor()

cur.execute("""
    SELECT *
    FROM users
""")

print("TABLES:", cur.fetchall())

conn.close()