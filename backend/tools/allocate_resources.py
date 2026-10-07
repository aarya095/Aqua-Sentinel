from ortools.sat.python import cp_model


PRIORITY_WEIGHT = {
    "CRITICAL": 1000,
    "HIGH": 500,
    "MODERATE": 200,
    "LOW": 50,
}


def allocate_pumps(incidents, pumps):
    model = cp_model.CpModel()

    assignments = {}

    for incident in incidents:
        incident_id = incident["incident_id"]

        for pump in pumps:
            pump_id = pump["pump_id"]

            assignments[(incident_id, pump_id)] = (
                model.NewBoolVar(
                    f"assign_{incident_id}_{pump_id}"
                )
            )

    # --------------------------------------------------
    # Constraint 1:
    # An incident can receive at most one pump.
    # --------------------------------------------------

    for incident in incidents:
        incident_id = incident["incident_id"]

        model.Add(
            sum(
                assignments[(incident_id, pump["pump_id"])]
                for pump in pumps
            ) <= 1
        )

    # --------------------------------------------------
    # Constraint 2:
    # A pump can be assigned to at most one incident.
    # --------------------------------------------------

    for pump in pumps:
        pump_id = pump["pump_id"]

        model.Add(
            sum(
                assignments[(incident["incident_id"], pump_id)]
                for incident in incidents
            ) <= 1
        )

    # --------------------------------------------------
    # Objective
    # --------------------------------------------------

    objective_terms = []

    for incident in incidents:
        incident_id = incident["incident_id"]

        priority = incident["priority"]
        priority_score = PRIORITY_WEIGHT.get(priority, 0)

        for pump in pumps:
            pump_id = pump["pump_id"]

            distance = abs(
                incident["latitude"] - pump["latitude"]
            ) + abs(
                incident["longitude"] - pump["longitude"]
            )

            # Higher priority is more important.
            # Smaller distance is better.
            score = priority_score * 1000 - int(distance * 1_000_000)

            objective_terms.append(
                score * assignments[(incident_id, pump_id)]
            )

    model.Maximize(sum(objective_terms))

    # --------------------------------------------------
    # Solve
    # --------------------------------------------------

    solver = cp_model.CpSolver()

    status = solver.Solve(model)

    if status not in (
        cp_model.OPTIMAL,
        cp_model.FEASIBLE,
    ):
        return []

    allocations = []

    for incident in incidents:
        incident_id = incident["incident_id"]

        assigned_pump = None

        for pump in pumps:
            pump_id = pump["pump_id"]

            if solver.Value(
                assignments[(incident_id, pump_id)]
            ):
                assigned_pump = pump_id
                break

        allocations.append(
            {
                "incident_id": incident_id,
                "pump_id": assigned_pump,
            }
        )

    return allocations