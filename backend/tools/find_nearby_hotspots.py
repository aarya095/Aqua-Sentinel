# find_nearby_hotspots.py

from sqlalchemy import text
from sqlalchemy.orm import Session


def find_nearby_hotspots(
    db: Session,
    incident_id: int,
    radius_km: float = 0.5,
):
    """
    Find historical waterlogging hotspots near a current incident.

    The search is based on the incident's actual geometry and does not
    require the incident to be linked to a hotspot.
    """

    radius_m = radius_km * 1000

    query = text(
        """
        SELECT
            h.hotspot_id,
            h.hotspot_code,
            h.historical_severity,
            h.elevation_m,

            w.ward_id,
            w.ward_code,
            w.name AS ward_name,

            ST_Distance(
                i.geometry::geography,
                h.geometry::geography
            ) AS distance_m

        FROM incidents i

        JOIN hotspots h
            ON ST_DWithin(
                i.geometry::geography,
                h.geometry::geography,
                :radius_m
            )

        LEFT JOIN wards w
            ON w.ward_id = h.ward_id

        WHERE i.incident_id = :incident_id
          AND i.geometry IS NOT NULL

        ORDER BY distance_m ASC
        """
    )

    result = db.execute(
        query,
        {
            "incident_id": incident_id,
            "radius_m": radius_m,
        },
    ).mappings().all()

    if not result:
        return {
            "found": True,
            "incident_id": incident_id,
            "radius_km": radius_km,
            "hotspots_found": 0,
            "nearby_hotspots": [],
        }

    nearby_hotspots = []

    for row in result:
        nearby_hotspots.append(
            {
                "hotspot_id": row["hotspot_id"],
                "hotspot_code": row["hotspot_code"],
                "historical_severity": row["historical_severity"],
                "elevation_m": row["elevation_m"],
                "ward_id": row["ward_id"],
                "ward_code": row["ward_code"],
                "ward_name": row["ward_name"],
                "distance_m": round(float(row["distance_m"]), 2),
            }
        )

    return {
        "found": True,
        "incident_id": incident_id,
        "radius_km": radius_km,
        "hotspots_found": len(nearby_hotspots),
        "nearby_hotspots": nearby_hotspots,
    }

if __name__ == "__main__":
    from database.session import SessionLocal
    db = SessionLocal()
    result = find_nearby_hotspots(db, incident_id=11)
    print(result)