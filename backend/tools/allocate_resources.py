from sqlalchemy import text
from sqlalchemy.orm import Session
from ortools.sat.python import cp_model


# Higher priority incidents receive stronger allocation preference.
PRIORITY_WEIGHT = {
    "CRITICAL": 1000,
    "HIGH": 500,
    "MODERATE": 200,
    "LOW": 50,
}


def allocate_resources(db: Session):
    """
    Allocate available pumps across all active incidents.

    This tool performs deterministic resource allocation using OR-Tools.
    The LLM should not decide which physical pump goes to which incident.

    Returns:
        {
            "incidents": [...],
            "pumps": [...],
            "allocations": [...]
        }
    """

    # ---------------------------------------------------------
    # 1. Get active incidents
    # ---------------------------------------------------------

    incident_query = text("""
        SELECT
            i.incident_id,
            i.severity,
            ST_Y(i.geometry) AS latitude,
            ST_X(i.geometry) AS longitude
        FROM incidents i
        WHERE i.status = 'ACTIVE'
          AND i.geometry IS NOT NULL
        ORDER BY
            CASE i.severity
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH' THEN 2
                WHEN 'MODERATE' THEN 3
                WHEN 'LOW' THEN 4
                ELSE 5
            END,
            i.incident_id
    """)

    incident_rows = db.execute(incident_query).mappings().all()

    incidents = [
        {
            "incident_id": row["incident_id"],
            "priority": row["severity"],
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
        }
        for row in incident_rows
    ]

    if not incidents:
        return {
            "incidents": [],
            "pumps": [],
            "allocations": [],
        }

    # ---------------------------------------------------------
    # 2. Get currently available pumps
    # ---------------------------------------------------------

    pump_query = text("""
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
    """)

    pump_rows = db.execute(pump_query).mappings().all()

    pumps = [
        {
            "pump_id": row["pump_id"],
            "pump_code": row["pump_code"],
            "capacity_m3_hr": float(row["capacity_m3_hr"]),
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
        }
        for row in pump_rows
    ]

    if not pumps:
        return {
            "incidents": incidents,
            "pumps": [],
            "allocations": [
                {
                    "incident_id": incident["incident_id"],
                    "pump_id": None,
                    "pump_code": None,
                    "distance_km": None,
                    "status": "UNASSIGNED",
                }
                for incident in incidents
            ],
        }

    # ---------------------------------------------------------
    # 3. Calculate actual geographic distances using PostGIS
    # ---------------------------------------------------------

    distance_query = text("""
        SELECT
            i.incident_id,
            p.pump_id,
            ST_Distance(
                i.geometry::geography,
                p.geometry::geography
            ) / 1000.0 AS distance_km
        FROM incidents i
        CROSS JOIN pumps p
        WHERE i.status = 'ACTIVE'
          AND i.geometry IS NOT NULL
          AND p.status = 'AVAILABLE'
          AND p.geometry IS NOT NULL
    """)

    distance_rows = db.execute(distance_query).mappings().all()

    distances = {}

    for row in distance_rows:
        key = (
            row["incident_id"],
            row["pump_id"],
        )

        distances[key] = float(row["distance_km"])

    # ---------------------------------------------------------
    # 4. Create OR-Tools model
    # ---------------------------------------------------------

    model = cp_model.CpModel()

    assignments = {}

    for incident in incidents:
        incident_id = incident["incident_id"]

        for pump in pumps:
            pump_id = pump["pump_id"]

            assignments[(incident_id, pump_id)] = model.NewBoolVar(
                f"assign_{incident_id}_{pump_id}"
            )

    # ---------------------------------------------------------
    # 5. Constraint:
    #    Each incident can receive at most one pump.
    # ---------------------------------------------------------

    for incident in incidents:
        incident_id = incident["incident_id"]

        model.Add(
            sum(
                assignments[(incident_id, pump["pump_id"])]
                for pump in pumps
            ) <= 1
        )

    # ---------------------------------------------------------
    # 6. Constraint:
    #    Each pump can serve at most one incident.
    # ---------------------------------------------------------

    for pump in pumps:
        pump_id = pump["pump_id"]

        model.Add(
            sum(
                assignments[(incident["incident_id"], pump_id)]
                for incident in incidents
            ) <= 1
        )

    # ---------------------------------------------------------
    # 7. Objective
    #
    #    Prioritize:
    #       1. Incident priority
    #       2. Shorter geographic distance
    #
    #    Priority dominates distance.
    # ---------------------------------------------------------

    objective_terms = []

    for incident in incidents:
        incident_id = incident["incident_id"]
        priority = incident["priority"]

        priority_score = PRIORITY_WEIGHT.get(priority, 0)

        for pump in pumps:
            pump_id = pump["pump_id"]

            distance_km = distances.get(
                (incident_id, pump_id)
            )

            if distance_km is None:
                continue

            # Priority is intentionally much more important
            # than geographic distance.
            #
            # Example:
            # CRITICAL > HIGH > MODERATE > LOW
            #
            # Within the same priority, the closer pump wins.

            score = (
                priority_score * 1_000_000
                - int(distance_km * 1_000)
            )

            objective_terms.append(
                score * assignments[(incident_id, pump_id)]
            )

    if not objective_terms:
        return {
            "incidents": incidents,
            "pumps": pumps,
            "allocations": [
                {
                    "incident_id": incident["incident_id"],
                    "pump_id": None,
                    "pump_code": None,
                    "distance_km": None,
                    "status": "UNASSIGNED",
                }
                for incident in incidents
            ],
        }

    model.Maximize(sum(objective_terms))

    # ---------------------------------------------------------
    # 8. Solve
    # ---------------------------------------------------------

    solver = cp_model.CpSolver()

    status = solver.Solve(model)

    if status not in (
        cp_model.OPTIMAL,
        cp_model.FEASIBLE,
    ):
        return {
            "incidents": incidents,
            "pumps": pumps,
            "allocations": [
                {
                    "incident_id": incident["incident_id"],
                    "pump_id": None,
                    "pump_code": None,
                    "distance_km": None,
                    "status": "UNASSIGNED",
                }
                for incident in incidents
            ],
        }

    # ---------------------------------------------------------
    # 9. Build structured allocation result
    # ---------------------------------------------------------

    allocations = []

    for incident in incidents:
        incident_id = incident["incident_id"]

        assigned_pump = None

        for pump in pumps:
            pump_id = pump["pump_id"]

            if solver.Value(
                assignments[(incident_id, pump_id)]
            ):
                assigned_pump = pump
                break

        if assigned_pump:
            pump_id = assigned_pump["pump_id"]

            allocations.append(
                {
                    "incident_id": incident_id,
                    "pump_id": pump_id,
                    "pump_code": assigned_pump["pump_code"],
                    "distance_km": round(
                        distances[(incident_id, pump_id)],
                        2,
                    ),
                    "status": "ASSIGNED",
                }
            )

        else:
            allocations.append(
                {
                    "incident_id": incident_id,
                    "pump_id": None,
                    "pump_code": None,
                    "distance_km": None,
                    "status": "UNASSIGNED",
                }
            )

    return {
        "incidents": incidents,
        "pumps": pumps,
        "allocations": allocations,
    }