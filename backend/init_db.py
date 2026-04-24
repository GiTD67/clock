"""One-time script to create all database tables. Run once after first deploy."""
import psycopg2
import os

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise SystemExit("DATABASE_URL not set")

conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = True
cur = conn.cursor()

tables = [
    """
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      job_role TEXT,
      manager_name TEXT,
      is_fulltime INTEGER DEFAULT 1,
      pay REAL,
      salary REAL,
      hourly_rate REAL,
      pto_accrual_rate REAL,
      streak_count INTEGER DEFAULT 0,
      streak_last_date TEXT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS clock_sessions (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER,
      clock_in TEXT,
      clock_out TEXT,
      duration_minutes INTEGER,
      break_minutes INTEGER DEFAULT 0,
      notes TEXT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS time_entries (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER,
      date TEXT,
      project TEXT,
      task TEXT,
      start_time TEXT,
      end_time TEXT,
      duration_minutes INTEGER,
      description TEXT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS jobs (
      job_id SERIAL PRIMARY KEY,
      description TEXT,
      hiring_manager_id INTEGER,
      date_posted TEXT,
      date_expiry TEXT,
      salary TEXT,
      location TEXT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS timesheet_submissions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      total_hours REAL NOT NULL,
      submitted_at TEXT NOT NULL DEFAULT (NOW()::text),
      UNIQUE (user_id, period_start)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS timesheets (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL,
      pay_period_start TEXT NOT NULL,
      pay_period_end TEXT NOT NULL,
      total_hours REAL DEFAULT 0,
      regular_hours REAL DEFAULT 0,
      overtime_hours REAL DEFAULT 0,
      break_minutes INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      submitted_at TEXT,
      approved_at TEXT,
      approved_by INTEGER,
      notes TEXT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS pto_balances (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL UNIQUE,
      balance_hours REAL DEFAULT 0,
      last_updated TEXT
    )
    """,
]

for sql in tables:
    cur.execute(sql)
    print(f"Created/verified table")

cur.close()
conn.close()
print("All tables created successfully!")
