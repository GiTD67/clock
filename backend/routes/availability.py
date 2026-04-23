"""Work availability, direct deposit, and work schedule template endpoints."""
from flask import Blueprint, jsonify, request
from db import get_db

bp = Blueprint("availability", __name__)


def _ensure_tables():
    with get_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS work_availability (
              id SERIAL PRIMARY KEY,
              user_id INTEGER NOT NULL,
              day_of_week INTEGER NOT NULL,
              start_time TEXT DEFAULT '09:00',
              end_time TEXT DEFAULT '17:00',
              is_available BOOLEAN DEFAULT TRUE,
              UNIQUE(user_id, day_of_week)
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS direct_deposit (
              id SERIAL PRIMARY KEY,
              user_id INTEGER UNIQUE NOT NULL,
              bank_name TEXT,
              routing_number TEXT,
              account_number TEXT,
              account_type TEXT DEFAULT 'checking'
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS work_schedule_template (
              id SERIAL PRIMARY KEY,
              user_id INTEGER UNIQUE NOT NULL,
              target_hours_per_day REAL DEFAULT 8,
              work_start_time TEXT DEFAULT '09:00',
              work_end_time TEXT DEFAULT '17:00'
            )
        """)


_ensure_tables()


@bp.route("/api/availability/<int:user_id>", methods=["GET"])
def get_availability(user_id):
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM work_availability WHERE user_id = ? ORDER BY day_of_week",
            (user_id,),
        ).fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route("/api/availability/<int:user_id>", methods=["POST"])
def save_availability(user_id):
    data = request.get_json() or {}
    days = data.get("days", [])
    with get_db() as db:
        for day in days:
            dow = day.get("day_of_week")
            db.execute(
                """INSERT INTO work_availability (user_id, day_of_week, start_time, end_time, is_available)
                   VALUES (?, ?, ?, ?, ?)
                   ON CONFLICT (user_id, day_of_week) DO UPDATE SET
                     start_time = EXCLUDED.start_time,
                     end_time = EXCLUDED.end_time,
                     is_available = EXCLUDED.is_available""",
                (user_id, dow, day.get("start_time", "09:00"), day.get("end_time", "17:00"), day.get("is_available", True)),
            )
        db.commit()
    return jsonify({"ok": True})


@bp.route("/api/direct-deposit/<int:user_id>", methods=["GET"])
def get_direct_deposit(user_id):
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM direct_deposit WHERE user_id = ?", (user_id,)
        ).fetchone()
    if not row:
        return jsonify({"user_id": user_id, "bank_name": None, "routing_number": None, "account_number": None, "account_type": "checking"})
    r = dict(row)
    if r.get("account_number") and len(r["account_number"]) > 4:
        r["account_number_masked"] = "****" + r["account_number"][-4:]
    else:
        r["account_number_masked"] = r.get("account_number")
    r.pop("account_number", None)
    return jsonify(r)


@bp.route("/api/direct-deposit/<int:user_id>", methods=["POST"])
def save_direct_deposit(user_id):
    data = request.get_json() or {}
    with get_db() as db:
        db.execute(
            """INSERT INTO direct_deposit (user_id, bank_name, routing_number, account_number, account_type)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT (user_id) DO UPDATE SET
                 bank_name = EXCLUDED.bank_name,
                 routing_number = EXCLUDED.routing_number,
                 account_number = EXCLUDED.account_number,
                 account_type = EXCLUDED.account_type""",
            (user_id, data.get("bank_name"), data.get("routing_number"), data.get("account_number"), data.get("account_type", "checking")),
        )
        db.commit()
    return jsonify({"ok": True})


@bp.route("/api/work-schedule/<int:user_id>", methods=["GET"])
def get_work_schedule(user_id):
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM work_schedule_template WHERE user_id = ?", (user_id,)
        ).fetchone()
    if not row:
        return jsonify({"user_id": user_id, "target_hours_per_day": 8.0, "work_start_time": "09:00", "work_end_time": "17:00"})
    return jsonify(dict(row))


@bp.route("/api/work-schedule/<int:user_id>", methods=["POST"])
def save_work_schedule(user_id):
    data = request.get_json() or {}
    with get_db() as db:
        db.execute(
            """INSERT INTO work_schedule_template (user_id, target_hours_per_day, work_start_time, work_end_time)
               VALUES (?, ?, ?, ?)
               ON CONFLICT (user_id) DO UPDATE SET
                 target_hours_per_day = EXCLUDED.target_hours_per_day,
                 work_start_time = EXCLUDED.work_start_time,
                 work_end_time = EXCLUDED.work_end_time""",
            (user_id, float(data.get("target_hours_per_day", 8)), data.get("work_start_time", "09:00"), data.get("work_end_time", "17:00")),
        )
        db.commit()
    return jsonify({"ok": True})
