from datetime import datetime, timedelta

from sqlalchemy import text
from sqlalchemy.orm import Session


def investigate_incident(
    db: Session,
    incident_id: int,
    report_lookback_minutes: int = 60,
    facility_radius_m: int = 1000,
):
    """
    Investigate a single incident by collecting relevant
    environmental, geographic, drainage, road, citizen-report,
    and nearby-facility information.
    """

    lookback_time = datetime.now() - timedelta(
        minutes=report_lookback_minutes
    )

    query = text(
        """
        WITH incident_context AS (
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
                h.historical_severity,
                h.geometry AS hotspot_geometry,

                w.ward_id,
                w.ward_code,
                w.name AS ward_name,
                w.population AS ward_population,

                r.road_id,
                r.road_code,
                r.name AS road_name,
                r.road_type,
                r.width_m,

                d.drain_id,
                d.drain_code,
                d.drain_type,
                d.capacity_m3_hr,
                d.condition AS drainage_condition,
                d.blocked_percentage,
                d.current_flow_m3_hr

            FROM incidents i

            JOIN hotspots h
                ON h.hotspot_id = i.hotspot_id

            LEFT JOIN wards w
                ON w.ward_id = h.ward_id

            LEFT JOIN roads r
                ON r.road_id = h.road_id

            LEFT JOIN drainage d
                ON d.drain_id = h.drain_id

            WHERE i.incident_id = :incident_id
        ),

        latest_water AS (
            SELECT DISTINCT ON (wl.hotspot_id)
                wl.hotspot_id,
                wl.timestamp,
                wl.water_level_m,
                wl.rate_of_change_m_per_min
            FROM water_levels wl
            WHERE wl.hotspot_id = (
                SELECT hotspot_id
                FROM incident_context
            )
            ORDER BY
                wl.hotspot_id,
                wl.timestamp DESC
        ),

        previous_water AS (
            SELECT
                wl.timestamp,
                wl.water_level_m,
                wl.rate_of_change_m_per_min
            FROM water_levels wl
            WHERE wl.hotspot_id = (
                SELECT hotspot_id
                FROM incident_context
            )
            ORDER BY wl.timestamp DESC
            OFFSET 1
            LIMIT 1
        ),

        latest_rainfall AS (
            SELECT
                rf.timestamp,
                rf.rainfall_mm_hr,
                rf.source
            FROM rainfall rf
            WHERE rf.ward_id = (
                SELECT ward_id
                FROM incident_context
            )
            ORDER BY rf.timestamp DESC
            LIMIT 1
        ),

        recent_reports AS (
            SELECT
                COUNT(*) AS report_count
            FROM citizen_reports cr
            WHERE cr.hotspot_id = (
                SELECT hotspot_id
                FROM incident_context
            )
            AND cr.timestamp >= :lookback_time
        ),

        latest_report AS (
            SELECT
                cr.timestamp,
                cr.severity,
                cr.confidence,
                cr.status,
                cr.description
            FROM citizen_reports cr
            WHERE cr.hotspot_id = (
                SELECT hotspot_id
                FROM incident_context
            )
            ORDER BY cr.timestamp DESC
            LIMIT 1
        )

        SELECT
            ic.*,

            lw.timestamp AS water_timestamp,
            lw.water_level_m,
            lw.rate_of_change_m_per_min,

            pw.timestamp AS previous_water_timestamp,
            pw.water_level_m AS previous_water_level_m,
            pw.rate_of_change_m_per_min AS previous_rate_of_change_m_per_min,

            lr.timestamp AS rainfall_timestamp,
            lr.rainfall_mm_hr,
            lr.source AS rainfall_source,

            rr.report_count AS recent_report_count,

            lrep.timestamp AS latest_report_timestamp,
            lrep.severity AS latest_report_severity,
            lrep.confidence AS latest_report_confidence,
            lrep.status AS latest_report_status,
            lrep.description AS latest_report_description

        FROM incident_context ic

        LEFT JOIN latest_water lw
            ON TRUE

        LEFT JOIN previous_water pw
            ON TRUE

        LEFT JOIN latest_rainfall lr
            ON TRUE

        CROSS JOIN recent_reports rr

        LEFT JOIN latest_report lrep
            ON TRUE
        """
    )

    result = db.execute(
        query,
        {
            "incident_id": incident_id,
            "lookback_time": lookback_time,
        },
    ).mappings().first()

    if result is None:
        return {
            "found": False,
            "incident_id": incident_id,
            "message": "Incident not found.",
        }

    row = dict(result)

    # ----------------------------------------
    # Calculate drainage utilization
    # ----------------------------------------

    capacity = row["capacity_m3_hr"]
    current_flow = row["current_flow_m3_hr"]

    if capacity is not None and capacity > 0 and current_flow is not None:
        drainage_utilization = (
            float(current_flow) / float(capacity)
        ) * 100
    else:
        drainage_utilization = None

    # ----------------------------------------
    # Calculate change in water level
    # ----------------------------------------

    current_water = row["water_level_m"]
    previous_water = row["previous_water_level_m"]

    if current_water is not None and previous_water is not None:
        water_level_change = (
            float(current_water) - float(previous_water)
        )
    else:
        water_level_change = None

    # ----------------------------------------
    # Build structured result
    # ----------------------------------------

    return {
        "found": True,

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
            "elevation_m": row["elevation_m"],
        },

        "water": {
            "timestamp": row["water_timestamp"],
            "level_m": row["water_level_m"],
            "rate_of_change_m_per_min": row[
                "rate_of_change_m_per_min"
            ],
            "previous_timestamp": row[
                "previous_water_timestamp"
            ],
            "previous_level_m": row[
                "previous_water_level_m"
            ],
            "change_since_previous_m": water_level_change,
        },

        "rainfall": {
            "timestamp": row["rainfall_timestamp"],
            "mm_per_hour": row["rainfall_mm_hr"],
            "source": row["rainfall_source"],
        },

        "drainage": {
            "drain_id": row["drain_id"],
            "drain_code": row["drain_code"],
            "type": row["drain_type"],
            "condition": row["drainage_condition"],
            "blocked_percentage": row["blocked_percentage"],
            "current_flow_m3_hr": row["current_flow_m3_hr"],
            "capacity_m3_hr": row["capacity_m3_hr"],
            "utilization_percentage": drainage_utilization,
        },

        "road": {
            "road_id": row["road_id"],
            "road_code": row["road_code"],
            "name": row["road_name"],
            "type": row["road_type"],
            "width_m": row["width_m"],
        },

        "citizen_reports": {
            "recent_count": row["recent_report_count"],
            "lookback_minutes": report_lookback_minutes,
            "latest": {
                "timestamp": row["latest_report_timestamp"],
                "severity": row["latest_report_severity"],
                "confidence": row["latest_report_confidence"],
                "status": row["latest_report_status"],
                "description": row["latest_report_description"],
            },
        },
    }

if __name__ == "__main__":
    from database.session import SessionLocal
    db = SessionLocal()
    result = investigate_incident(db, incident_id=11)
    print(result)