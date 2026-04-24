from datetime import datetime

from flask import Blueprint, jsonify, request

from db import get_db

bp = Blueprint("pto", __name__)


@bp.route("/api/pto/<int:employee_id>", methods=["GET"])
def get_pto_balance(employee_id):
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM pto_balances WHERE employee_id = %s", (employee_id,)
        ).fetchone()
    if not row:
        return jsonify({"employee_id": employee_id, "balance_hours": 0.0, "last_updated": None})
    return jsonify(dict(row))


@bp.route("/api/pto/<int:employee_id>/accrue", methods=["POST"])
def accrue_pto(employee_id):
    data = request.get_json() or {}
    hours = float(data.get("hours", 0))
    if hours <= 0:
        return jsonify({"error": "hours must be positive"}), 400
    now = datetime.utcnow().isoformat()
    with get_db() as db:
        existing = db.execute(
            "SELECT * FROM pto_balances WHERE employee_id = %s", (employee_id,)
        ).fetchone()
        if existing:
            new_balance = (existing["balance_hours"] or 0.0) + hours
            db.execute(
                "UPDATE pto_balances SET balance_hours = %s, last_updated = %s WHERE employee_id = %s",
                (new_balance, now, employee_id),
            )
        else:
            db.execute(
                "INSERT INTO pto_balances (employee_id, balance_hours, last_updated) VALUES (%s, %s, %s)",
                (employee_id, hours, now),
            )
        db.commit()
        row = db.execute(
            "SELECT * FROM pto_balances WHERE employee_id = %s", (employee_id,)
        ).fetchone()
    return jsonify(dict(row))


@bp.route("/api/pto/<int:employee_id>/adjust", methods=["POST"])
def adjust_pto(employee_id):
    data = request.get_json() or {}
    if "balance_hours" not in data:
        return jsonify({"error": "balance_hours required"}), 400
    balance = float(data["balance_hours"])
    now = datetime.utcnow().isoformat()
    with get_db() as db:
        existing = db.execute(
            "SELECT id FROM pto_balances WHERE employee_id = %s", (employee_id,)
        ).fetchone()
        if existing:
            db.execute(
                "UPDATE pto_balances SET balance_hours = %s, last_updated = %s WHERE employee_id = %s",
                (balance, now, employee_id),
            )
        else:
            db.execute(
                "INSERT INTO pto_balances (employee_id, balance_hours, last_updated) VALUES (%s, %s, %s)",
                (employee_id, balance, now),
            )
        db.commit()
        row = db.execute(
            "SELECT * FROM pto_balances WHERE employee_id = %s", (employee_id,)
        ).fetchone()
    return jsonify(dict(row))
