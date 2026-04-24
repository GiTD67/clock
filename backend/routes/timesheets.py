from datetime import datetime

from flask import Blueprint, jsonify, request

from db import get_db

bp = Blueprint("timesheets", __name__)


@bp.route("/api/timesheets", methods=["GET"])
def list_timesheets():
    employee_id = request.args.get("employee_id")
    status = request.args.get("status")
    with get_db() as db:
        sql = "SELECT * FROM timesheets"
        params = []
        where = []
        if employee_id:
            where.append("employee_id = %s")
            params.append(employee_id)
        if status:
            where.append("status = %s")
            params.append(status)
        if where:
            sql += " WHERE " + " AND ".join(where)
        sql += " ORDER BY submitted_at DESC"
        rows = db.execute(sql, params or None).fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route("/api/timesheets", methods=["POST"])
def submit_timesheet():
    data = request.get_json() or {}
    employee_id = data.get("employee_id")
    pay_period_start = data.get("pay_period_start")
    pay_period_end = data.get("pay_period_end")
    if not employee_id or not pay_period_start or not pay_period_end:
        return jsonify({"error": "employee_id, pay_period_start, pay_period_end required"}), 400
    now = datetime.utcnow().isoformat()
    with get_db() as db:
        existing = db.execute(
            "SELECT id FROM timesheets WHERE employee_id = %s AND pay_period_start = %s",
            (employee_id, pay_period_start),
        ).fetchone()
        if existing:
            db.execute(
                """UPDATE timesheets SET
                   total_hours = %s, regular_hours = %s, overtime_hours = %s,
                   break_minutes = %s, status = 'pending', submitted_at = %s
                   WHERE id = %s""",
                (
                    data.get("total_hours", 0),
                    data.get("regular_hours", 0),
                    data.get("overtime_hours", 0),
                    data.get("break_minutes", 0),
                    now,
                    existing["id"],
                ),
            )
            db.commit()
            row = db.execute("SELECT * FROM timesheets WHERE id = %s", (existing["id"],)).fetchone()
        else:
            row = db.execute(
                """INSERT INTO timesheets
                   (employee_id, pay_period_start, pay_period_end, total_hours, regular_hours,
                    overtime_hours, break_minutes, status, submitted_at)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending', %s) RETURNING *""",
                (
                    employee_id,
                    pay_period_start,
                    pay_period_end,
                    data.get("total_hours", 0),
                    data.get("regular_hours", 0),
                    data.get("overtime_hours", 0),
                    data.get("break_minutes", 0),
                    now,
                ),
            ).fetchone()
            db.commit()
    return jsonify(dict(row)), 201


@bp.route("/api/timesheets/<int:ts_id>", methods=["GET"])
def get_timesheet(ts_id):
    with get_db() as db:
        row = db.execute("SELECT * FROM timesheets WHERE id = %s", (ts_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(dict(row))


@bp.route("/api/timesheets/<int:ts_id>", methods=["PUT"])
def update_timesheet(ts_id):
    data = request.get_json() or {}
    allowed = {"status", "approved_by", "notes"}
    fields = {k: v for k, v in data.items() if k in allowed}
    if not fields:
        return jsonify({"error": "no updatable fields"}), 400
    if fields.get("status") in ("approved", "rejected"):
        fields["approved_at"] = datetime.utcnow().isoformat()
    set_clause = ", ".join(f"{k} = %s" for k in fields)
    values = list(fields.values()) + [ts_id]
    with get_db() as db:
        db.execute(f"UPDATE timesheets SET {set_clause} WHERE id = %s", values)
        db.commit()
        row = db.execute("SELECT * FROM timesheets WHERE id = %s", (ts_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(dict(row))
