from database.session import SessionLocal
from tools.allocate_resources import allocate_resources


def main():
    db = SessionLocal()

    try:
        result = allocate_resources(db)

        print("\n=== RESOURCE ALLOCATION ===")

        for allocation in result["allocations"]:
            print(
                f"Incident {allocation['incident_id']} "
                f"→ {allocation['pump_code']} "
                f"({allocation['status']})"
            )

            if allocation["distance_km"] is not None:
                print(
                    f"   Distance: "
                    f"{allocation['distance_km']} km"
                )

    finally:
        db.close()


if __name__ == "__main__":
    main()