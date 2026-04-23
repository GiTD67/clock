"""Shift swap requests and timesheet submission/approval."""
from datetime import datetime
from flask import Blueprint, jsonify, request
from db import get_db

bp = Blueprint("shift_swaps", __name__)


def _ensure_tables():
    with get_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS shift_swaps (
              id SERIAL PRIMARY KEY,
              requester_id INTEGER NOT NULL,
              target_id INTEGER,
              shift_date TEXT NOT NULL,
              shift_name TEXT,
              reason TEXT,
              status TEXT DEFAULT 'open',
              created_at TEXT
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS timesheet_submissions (
              id SERIAL PRIMARY KEY,
              user_id INTEGER NOT NULL,
              period_start TEXT NOT NULL,
              period_end TEXT NOT NULL,
              status TEXT DEFAULT 'submitted',
              submitted_at TEXT,
              approved_at TEXT,
              manager_notes TEXT,
              total_hours REAL
            )
        """)


_ensure_tables()


@bp.route("/api/shift-swaps", methods=["GET"])
def list_swaps():
    user_id = request.args.get("user_id")
    with get_db() as db:
        if user_id:
            rows = db.execute(
                "SELECT * FROM shift_swaps WHERE requester_id = ? OR target_id = ? ORDER BY created_at DESC",
                (user_id, user_id),
            ).fetchall()
        else:
            rows = db.execute(
                "SELECT * FROM shift_swaps ORDER BY created_at DESC"
            ).fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route("/api/shift-swaps", methods=["POST"])
def create_swap():
    data = request.get_json() or {}
    requester_id = data.get("requester_id")
    shift_date = data.get("shift_date")
    if not requester_id or not shift_date:
        return jsonify({"error": "requester_id, shift_date required"}), 400
    now = datetime.utcnow().isoformat()
    with get_db() as db:
        row = db.execute(
            """INSERT INTO shift_swaps (requester_id, target_id, shift_date, shift_name, reason, status, created_at)
               VALUES (?, ?, ?, ?, ?, 'open', ?) RETURNING *""",
            (requester_id, data.get("target_id"), shift_date, data.get("shift_name"), data.get("reason"), now),
        ).fetchone()
        db.commit()
    return jsonify(dict(row)), 201


@bp.route("/api/shift-swaps/<int:swap_id>", methods=["PUT"])
def update_swap(swap_id):
    data = request.get_json() or {}
    status = data.get("status", "accepted")
    with get_db() as db:
        db.execute(
            "UPDATE shift_swaps SET status = ? WHERE id = ?", (status, swap_id)
        )
        db.commit()
        row = db.execute(
            "SELECT * FROM shift_swaps WHERE id = ?", (swap_id,)
        ).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(dict(row))


@bp.route("/api/timesheet-submissions", methods=["GET"])
def list_submissions():
    user_id = request.args.get("user_id")
    with get_db() as db:
        if user_id:
            rows = db.execute(
                "SELECT * FROM timesheet_submissions WHERE user_id = ? ORDER BY submitted_at DESC",
                (user_id,),
            ).fetchall()
        else:
            rows = db.execute(
                "SELECT * FROM timesheet_submissions ORDER BY submitted_at DESC"
            ).fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route("/api/timesheet-submissions", methods=["POST"])
def create_submission():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    period_start = data.get("period_start")
    period_end = data.get("period_end")
    if not user_id or not period_start or not period_end:
        return jsonify({"error": "user_id, period_start, period_end required"}), 400
    now = datetime.utcnow().isoformat()
    with get_db() as db:
        row = db.execute(
            """INSERT INTO timesheet_submissions (user_id, period_start, period_end, status, submitted_at, total_hours)
               VALUES (?, ?, ?, 'submitted', ?, ?) RETURNING *""",
            (user_id, period_start, period_end, now, data.get("total_hours")),
        ).fetchone()
        db.commit()
    return jsonify(dict(row)), 201


@bp.route("/api/timesheet-submissions/<int:sub_id>", methods=["PUT"])
def update_submission(sub_id):
    data = request.get_json() or {}
    status = data.get("status")
    manager_notes = data.get("manager_notes")
    if not status:
        return jsonify({"error": "status required"}), 400
    now = datetime.utcnow().isoformat()
    with get_db() as db:
        db.execute(
            "UPDATE timesheet_submissions SET status = ?, manager_notes = ?, approved_at = ? WHERE id = ?",
            (status, manager_notes, now if status in ("approved", "rejected") else None, sub_id),
        )
        db.commit()
        row = db.execute(
            "SELECT * FROM timesheet_submissions WHERE id = ?", (sub_id,)
        ).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(dict(row))
