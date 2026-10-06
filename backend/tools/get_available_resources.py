from sqlalchemy import text
from sqlalchemy.orm import Session


def get_available_resources(
    db: Session,
    incident_id: int,
):
    """
    Find currently available pumps and response teams
    that can potentially be deployed to an incident.
    """

    query = text(
        """
        WITH incident_location AS (
            SELECT
                h.geometry
            FROM incidents i
            JOIN hotspots h
                ON h.hotspot_id = i.hotspot_id
            WHERE i.incident_id = :incident_id
        )

        SELECT
            'PUMP' AS resource_type,
            p.pump_id AS resource_id,
            p.pump_code AS resource_code,
            p.capacity_m3_hr,
            NULL::varchar AS team_type,
            p.status,
            p.current_ward_id,

            ST_Distance(
                p.geometry::geography,
                il.geometry::geography
            ) / 1000.0 AS distance_km

        FROM pumps p
        CROSS JOIN incident_location il

        WHERE p.status = 'AVAILABLE'
          AND p.geometry IS NOT NULL
          AND il.geometry IS NOT NULL

        UNION ALL

        SELECT
            'RESPONSE_TEAM' AS resource_type,
            t.team_id AS resource_id,
            t.team_code AS resource_code,
            NULL::numeric AS capacity_m3_hr,
            t.team_type,
            t.status,
            t.current_ward_id,

            ST_Distance(
                t.geometry::geography,
                il.geometry::geography
            ) / 1000.0 AS distance_km

        FROM response_teams t
        CROSS JOIN incident_location il

        WHERE t.status = 'AVAILABLE'
          AND t.geometry IS NOT NULL
          AND il.geometry IS NOT NULL

        ORDER BY
            resource_type,
            distance_km ASC
        """
    )

    result = db.execute(
        query,
        {
            "incident_id": incident_id,
        },
    ).mappings()

    pumps = []
    response_teams = []

    for row in result:

        if row["resource_type"] == "PUMP":
            pumps.append(
                {
                    "pump_id": row["resource_id"],
                    "pump_code": row["resource_code"],
                    "capacity_m3_hr": (
                        float(row["capacity_m3_hr"])
                        if row["capacity_m3_hr"] is not None
                        else None
                    ),
                    "distance_km": round(
                        float(row["distance_km"]),
                        2,
                    ),
                    "status": row["status"],
                }
            )

        else:
            response_teams.append(
                {
                    "team_id": row["resource_id"],
                    "team_code": row["resource_code"],
                    "type": row["team_type"],
                    "distance_km": round(
                        float(row["distance_km"]),
                        2,
                    ),
                    "status": row["status"],
                }
            )

    return {
        "found": True,
        "incident_id": incident_id,
        "pumps": pumps,
        "response_teams": response_teams,
    }

if __name__ == "__main__":
    from database.session import SessionLocal
    db = SessionLocal()
    result = get_available_resources(db, incident_id=11)
    print(result)