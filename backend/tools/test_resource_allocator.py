from sqlalchemy import text
from database.session import SessionLocal

from tools.get_active_incidents import get_active_incidents
from tools.allocate_resources import allocate_pumps


def main():
    db = SessionLocal()

    try:
        # --------------------------------------------------
        # 1. Get active incidents from the real database
        # --------------------------------------------------

        incidents_raw = get_active_incidents(db)

        incidents = []

        for item in incidents_raw:
            incident = item["incident"]
            location = item["location"]

            incidents.append(
                {
                    "incident_id": incident["id"],
                    "priority": incident["severity"],
                    "latitude": location["latitude"],
                    "longitude": location["longitude"],
                }
            )

        # --------------------------------------------------
        # 2. Get all currently available pumps
        # --------------------------------------------------

        pumps_raw = db.execute(
            text(
                """
                SELECT
                    pump_id,
                    pump_code,
                    capacity_m3_hr,
                    ST_Y(geometry) AS latitude,
                    ST_X(geometry) AS longitude
                FROM pumps
                WHERE status = 'AVAILABLE'
                AND geometry IS NOT NULL
                ORDER BY pump_id
                """
            )
        ).mappings()

        pumps = []

        for row in pumps_raw:
            pumps.append(
                {
                    "pump_id": row["pump_id"],
                    "pump_code": row["pump_code"],
                    "capacity_m3_hr": (
                        float(row["capacity_m3_hr"])
                        if row["capacity_m3_hr"] is not None
                        else None
                    ),
                    "latitude": row["latitude"],
                    "longitude": row["longitude"],
                }
            )

        # --------------------------------------------------
        # 3. Print the data being sent to OR-Tools
        # --------------------------------------------------

        print("\n=== ACTIVE INCIDENTS ===")

        for incident in incidents:
            print(
                f"Incident {incident['incident_id']} | "
                f"{incident['priority']} | "
                f"({incident['latitude']}, "
                f"{incident['longitude']})"
            )

        print("\n=== AVAILABLE PUMPS ===")

        for pump in pumps:
            print(
                f"{pump['pump_code']} | "
                f"ID={pump['pump_id']} | "
                f"Capacity={pump['capacity_m3_hr']} | "
                f"({pump['latitude']}, "
                f"{pump['longitude']})"
            )

        # --------------------------------------------------
        # 4. Run OR-Tools
        # --------------------------------------------------

        allocations = allocate_pumps(
            incidents,
            pumps,
        )

        # --------------------------------------------------
        # 5. Display result
        # --------------------------------------------------

        print("\n=== OR-TOOLS ALLOCATION ===")

        for allocation in allocations:
            print(
                f"Incident {allocation['incident_id']} "
                f"→ {allocation['pump_id']}"
            )

    finally:
        db.close()


if __name__ == "__main__":
    main()