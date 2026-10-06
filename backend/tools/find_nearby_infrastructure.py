from sqlalchemy import text
from sqlalchemy.orm import Session


def find_nearby_infrastructure(
    db: Session,
    incident_id: int,
    radius_km: float = 2.0,
):
    """
    Find facilities located within a given radius of an incident.
    """

    if radius_km <= 0:
        return {
            "found": False,
            "incident_id": incident_id,
            "message": "radius_km must be greater than 0.",
        }

    radius_m = radius_km * 1000

    query = text(
        """
        SELECT
            f.facility_id,
            f.facility_code,
            f.name,
            f.facility_type,
            f.priority,
            f.capacity,

            ST_Distance(
                f.geometry::geography,
                h.geometry::geography
            ) / 1000.0 AS distance_km

        FROM incidents i

        JOIN hotspots h
            ON h.hotspot_id = i.hotspot_id

        JOIN facilities f
            ON f.geometry IS NOT NULL
            AND h.geometry IS NOT NULL

        WHERE i.incident_id = :incident_id

        AND ST_DWithin(
            f.geometry::geography,
            h.geometry::geography,
            :radius_m
        )

        ORDER BY
            distance_km ASC
        """
    )

    result = db.execute(
        query,
        {
            "incident_id": incident_id,
            "radius_m": radius_m,
        },
    ).mappings()

    facilities = [
        {
            "facility_id": row["facility_id"],
            "facility_code": row["facility_code"],
            "name": row["name"],
            "type": row["facility_type"],
            "priority": row["priority"],
            "capacity": row["capacity"],
            "distance_km": round(
                float(row["distance_km"]),
                2,
            ),
        }
        for row in result
    ]

    return {
        "found": True,
        "incident_id": incident_id,
        "radius_km": radius_km,
        "facility_count": len(facilities),
        "facilities": facilities,
    }

if __name__ == "__main__":
    from database.session import SessionLocal
    db = SessionLocal()
    result = find_nearby_infrastructure(db, incident_id=11)
    print(result)