from datetime import datetime, timedelta

from sqlalchemy import text
from sqlalchemy.orm import Session


def get_active_incidents(
    db: Session,
    lookback_minutes: int = 60,
) -> list[dict]:
    """
    Retrieve currently active waterlogging incidents and their
    latest available environmental/contextual information.
    """

    query = text("""
        WITH latest_water AS (
            SELECT DISTINCT ON (wl.hotspot_id)
                wl.hotspot_id,
                wl.timestamp AS water_timestamp,
                wl.water_level_m,
                wl.rate_of_change_m_per_min
            FROM water_levels wl
            ORDER BY wl.hotspot_id, wl.timestamp DESC
        ),

        latest_rainfall AS (
            SELECT DISTINCT ON (r.ward_id)
                r.ward_id,
                r.timestamp AS rainfall_timestamp,
                r.rainfall_mm_hr,
                r.source AS rainfall_source
            FROM rainfall r
            ORDER BY r.ward_id, r.timestamp DESC
        ),

        recent_reports AS (
            SELECT
                cr.hotspot_id,
                COUNT(*) AS recent_report_count
            FROM citizen_reports cr
            WHERE cr.timestamp >= :lookback_time
            GROUP BY cr.hotspot_id
        ),

        latest_report AS (
            SELECT DISTINCT ON (cr.hotspot_id)
                cr.hotspot_id,
                cr.timestamp AS report_timestamp,
                cr.severity AS report_severity,
                cr.confidence AS report_confidence,
                cr.status AS report_status,
                cr.description AS report_description
            FROM citizen_reports cr
            ORDER BY cr.hotspot_id, cr.timestamp DESC
        )

        SELECT
            i.incident_id,
            i.status AS incident_status,
            i.severity AS incident_severity,
            i.affected_population,
            i.started_at,
            i.created_at,

            h.hotspot_id,
            h.hotspot_code,
            h.elevation_m,

            w.ward_id,
            w.ward_code,
            w.name AS ward_name,

            ST_Y(i.geometry) AS latitude,
            ST_X(i.geometry) AS longitude,

            lw.water_timestamp,
            lw.water_level_m,
            lw.rate_of_change_m_per_min,

            lr.rainfall_timestamp,
            lr.rainfall_mm_hr,
            lr.rainfall_source,

            COALESCE(rr.recent_report_count, 0)
                AS recent_report_count,

            lrep.report_timestamp,
            lrep.report_severity,
            lrep.report_confidence,
            lrep.report_status,
            lrep.report_description,

            d.drain_id,
            d.drain_code,
            d.drain_type,
            d.condition AS drain_condition,
            d.blocked_percentage,
            d.current_flow_m3_hr,
            d.capacity_m3_hr

        FROM incidents i

        LEFT JOIN hotspots h
            ON h.hotspot_id = i.hotspot_id

        LEFT JOIN wards w
            ON w.ward_id = h.ward_id

        LEFT JOIN latest_water lw
            ON lw.hotspot_id = h.hotspot_id

        LEFT JOIN latest_rainfall lr
            ON lr.ward_id = h.ward_id

        LEFT JOIN recent_reports rr
            ON rr.hotspot_id = h.hotspot_id

        LEFT JOIN latest_report lrep
            ON lrep.hotspot_id = h.hotspot_id

        LEFT JOIN drainage d
            ON d.drain_id = h.drain_id

        WHERE i.status = 'ACTIVE'

        ORDER BY
            CASE i.severity
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH' THEN 2
                WHEN 'MODERATE' THEN 3
                WHEN 'LOW' THEN 4
                ELSE 5
            END,
            lw.rate_of_change_m_per_min DESC NULLS LAST,
            i.started_at ASC;
    """)

    lookback_time = datetime.utcnow() - timedelta(
        minutes=lookback_minutes
    )

    result = db.execute(
        query,
        {
            "lookback_time": lookback_time
        }
    )

    incidents = []

    for row in result.mappings():
        incidents.append({
            "incident": {
                "id": row["incident_id"],
                "status": row["incident_status"],
                "severity": row["incident_severity"],
                "affected_population": row["affected_population"],
                "started_at": row["started_at"],
                "created_at": row["created_at"],
            },

            "location": {
                "hotspot_id": row["hotspot_id"],
                "hotspot_code": row["hotspot_code"],
                "ward_id": row["ward_id"],
                "ward_code": row["ward_code"],
                "ward_name": row["ward_name"],
                "latitude": row["latitude"],
                "longitude": row["longitude"],
                "elevation_m": row["elevation_m"],
            },

            "water": {
                "timestamp": row["water_timestamp"],
                "level_m": row["water_level_m"],
                "rate_of_change_m_per_min": row[
                    "rate_of_change_m_per_min"
                ],
            },

            "rainfall": {
                "timestamp": row["rainfall_timestamp"],
                "mm_per_hour": row["rainfall_mm_hr"],
                "source": row["rainfall_source"],
            },

            "citizen_reports": {
                "recent_count": row["recent_report_count"],
                "latest_timestamp": row["report_timestamp"],
                "latest_severity": row["report_severity"],
                "latest_confidence": row["report_confidence"],
                "latest_status": row["report_status"],
                "latest_description": row["report_description"],
            },

            "drainage": {
                "drain_id": row["drain_id"],
                "drain_code": row["drain_code"],
                "type": row["drain_type"],
                "condition": row["drain_condition"],
                "blocked_percentage": row["blocked_percentage"],
                "current_flow_m3_hr": row["current_flow_m3_hr"],
                "capacity_m3_hr": row["capacity_m3_hr"],
            },
        })

    return incidents

if __name__ == "__main__":
    from database.session import SessionLocal
    db = SessionLocal()
    result = get_active_incidents(db)
    print(result)