"""PTO bank, accrual, and request management."""
from datetime import datetime
from flask import Blueprint, jsonify, request
from db import get_db

bp = Blueprint("pto", __name__)


def _ensure_tables():
    with get_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS pto_balances (
              id SERIAL PRIMARY KEY,
              user_id INTEGER UNIQUE NOT NULL,
              total_hours REAL DEFAULT 0,
              last_updated TEXT
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS pto_requests (
              id SERIAL PRIMARY KEY,
              user_id INTEGER NOT NULL,
              hours REAL NOT NULL,
              reason TEXT,
              start_date TEXT,
              end_date TEXT,
              status TEXT DEFAULT 'pending',
              manager_notes TEXT,
              created_at TEXT
            )
        """)


_ensure_tables()


@bp.route("/api/pto/balance/<int:user_id>", methods=["GET"])
def get_balance(user_id):
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM pto_balances WHERE user_id = ?", (user_id,)
        ).fetchone()
    if not row:
        return jsonify({"user_id": user_id, "total_hours": 0.0, "last_updated": None})
    return jsonify(dict(row))


@bp.route("/api/pto/accrue", methods=["POST"])
def accrue_pto():
    """Call on clock-out to add accrued PTO hours."""
    data = request.get_json() or {}
    user_id = data.get("user_id")
    hours_worked = float(data.get("hours_worked", 0))
    accrual_rate = float(data.get("accrual_rate", 1 / 30))
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    accrued = hours_worked * accrual_rate
    now = datetime.utcnow().isoformat()
    with get_db() as db:
        existing = db.execute(
            "SELECT * FROM pto_balances WHERE user_id = ?", (user_id,)
        ).fetchone()
        if existing:
            new_total = (existing["total_hours"] or 0) + accrued
            db.execute(
                "UPDATE pto_balances SET total_hours = ?, last_updated = ? WHERE user_id = ?",
                (new_total, now, user_id),
            )
        else:
            db.execute(
                "INSERT INTO pto_balances (user_id, total_hours, last_updated) VALUES (?, ?, ?)",
                (user_id, accrued, now),
            )
        db.commit()
        row = db.execute(
            "SELECT * FROM pto_balances WHERE user_id = ?", (user_id,)
        ).fetchone()
    return jsonify(dict(row))


@bp.route("/api/pto/deduct", methods=["POST"])
def deduct_pto():
    """Deduct approved PTO hours from balance."""
    data = request.get_json() or {}
    user_id = data.get("user_id")
    hours = float(data.get("hours", 0))
    if not user_id or hours <= 0:
        return jsonify({"error": "user_id and positive hours required"}), 400
    now = datetime.utcnow().isoformat()
    with get_db() as db:
        existing = db.execute(
            "SELECT * FROM pto_balances WHERE user_id = ?", (user_id,)
        ).fetchone()
        if not existing:
            return jsonify({"error": "no PTO balance found"}), 404
        new_total = max(0, (existing["total_hours"] or 0) - hours)
        db.execute(
            "UPDATE pto_balances SET total_hours = ?, last_updated = ? WHERE user_id = ?",
            (new_total, now, user_id),
        )
        db.commit()
        row = db.execute(
            "SELECT * FROM pto_balances WHERE user_id = ?", (user_id,)
        ).fetchone()
    return jsonify(dict(row))


@bp.route("/api/pto/requests", methods=["GET"])
def list_requests():
    user_id = request.args.get("user_id")
    with get_db() as db:
        if user_id:
            rows = db.execute(
                "SELECT * FROM pto_requests WHERE user_id = ? ORDER BY created_at DESC",
                (user_id,),
            ).fetchall()
        else:
            rows = db.execute(
                "SELECT * FROM pto_requests ORDER BY created_at DESC"
            ).fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route("/api/pto/requests", methods=["POST"])
def create_request():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    hours_raw = data.get("hours")
    if not user_id or not hours_raw:
        return jsonify({"error": "user_id, hours required"}), 400
    try:
        hours = float(hours_raw)
    except (TypeError, ValueError):
        return jsonify({"error": "hours must be a number"}), 400
    now = datetime.utcnow().isoformat()
    with get_db() as db:
        row = db.execute(
            """INSERT INTO pto_requests (user_id, hours, reason, start_date, end_date, status, created_at)
               VALUES (?, ?, ?, ?, ?, 'pending', ?) RETURNING *""",
            (user_id, hours, data.get("reason"), data.get("start_date"), data.get("end_date"), now),
        ).fetchone()
        db.commit()
    return jsonify(dict(row)), 201


@bp.route("/api/pto/requests/<int:req_id>", methods=["PUT"])
def update_request(req_id):
    data = request.get_json() or {}
    status = data.get("status")
    manager_notes = data.get("manager_notes")
    if not status:
        return jsonify({"error": "status required"}), 400
    with get_db() as db:
        db.execute(
            "UPDATE pto_requests SET status = ?, manager_notes = ? WHERE id = ?",
            (status, manager_notes, req_id),
        )
        db.commit()
        row = db.execute(
            "SELECT * FROM pto_requests WHERE id = ?", (req_id,)
        ).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(dict(row))
