from sqlalchemy import text
from sqlalchemy.orm import Session


# Scoring configuration

WATER_LEVEL_MAX = 24
RAINFALL_MAX = 18
RISING_WATER_MAX = 15
AFFECTED_POPULATION_MAX = 12
CRITICAL_INFRASTRUCTURE_MAX = 10
DRAINAGE_MAX = 8


def score_priority_level(score: int) -> str:
    """
    Convert deterministic priority score into a priority level.

    MVP thresholds:
        0-19   -> LOW
        20-39  -> MODERATE
        40-59  -> HIGH
        60-87  -> CRITICAL
    """

    if score >= 60:
        return "CRITICAL"

    if score >= 40:
        return "HIGH"

    if score >= 20:
        return "MODERATE"

    return "LOW"


# Individual factor scoring

def calculate_water_level_score(water_level: float | None) -> int:
    """
    Score current water level.

    MVP thresholds:
        < 0.50 m  -> 0
        0.50-0.99 -> 8
        1.00-1.49 -> 16
        >= 1.50   -> 24
    """

    if water_level is None:
        return 0

    if water_level >= 1.50:
        return WATER_LEVEL_MAX

    if water_level >= 1.00:
        return 16

    if water_level >= 0.50:
        return 8

    return 0


def calculate_rainfall_score(
    rainfall_mm_hr: float | None,
) -> int:
    """
    Score current rainfall intensity.

    MVP thresholds:
        < 20 mm/hr       -> 0
        20-39.99 mm/hr   -> 6
        40-59.99 mm/hr   -> 12
        >= 60 mm/hr      -> 18
    """

    if rainfall_mm_hr is None:
        return 0

    if rainfall_mm_hr >= 60:
        return RAINFALL_MAX

    if rainfall_mm_hr >= 40:
        return 12

    if rainfall_mm_hr >= 20:
        return 6

    return 0


def calculate_rising_water_score(
    rate_of_change: float | None,
) -> int:
    """
    Score the rate at which water level is increasing.

    MVP thresholds:
        <= 0.00 m/min -> 0
        > 0.00         -> 5
        >= 0.02        -> 10
        >= 0.05        -> 15
    """

    if rate_of_change is None:
        return 0

    if rate_of_change >= 0.05:
        return RISING_WATER_MAX

    if rate_of_change >= 0.02:
        return 10

    if rate_of_change > 0:
        return 5

    return 0


def calculate_population_score(
    affected_population: int | None,
) -> int:
    """
    Score affected population.

    MVP thresholds:
        < 100 people      -> 0
        100-499           -> 4
        500-999           -> 8
        >= 1000           -> 12
    """

    if affected_population is None:
        return 0

    if affected_population >= 1000:
        return AFFECTED_POPULATION_MAX

    if affected_population >= 500:
        return 8

    if affected_population >= 100:
        return 4

    return 0


def calculate_drainage_score(
    condition: str | None,
    blocked_percentage: float | None,
    capacity_m3_hr: float | None,
    current_flow_m3_hr: float | None,
) -> int:
    """
    Score drainage stress.

    The score considers:
        - drainage condition
        - percentage blocked
        - current flow relative to capacity

    Maximum = 8 points.
    """

    score = 0

    # Condition component
    if condition:
        condition = condition.upper()

        if condition in {"POOR", "CRITICAL"}:
            score += 4
        elif condition in {"FAIR", "MODERATE"}:
            score += 2

    # Blockage component
    if blocked_percentage is not None:
        if blocked_percentage >= 75:
            score += 2
        elif blocked_percentage >= 50:
            score += 1

    # Capacity utilization component
    if (
        capacity_m3_hr is not None
        and capacity_m3_hr > 0
        and current_flow_m3_hr is not None
    ):
        utilization = (
            current_flow_m3_hr / capacity_m3_hr
        ) * 100

        if utilization >= 90:
            score += 2
        elif utilization >= 75:
            score += 1

    return min(score, DRAINAGE_MAX)


def calculate_infrastructure_score(
    critical_facility_count: int,
) -> int:
    """
    Score nearby critical infrastructure.

    MVP policy:
        0 critical facilities -> 0
        1 critical facility  -> 10

    The score is capped at 10 because the presence of
    critical infrastructure is treated as a factor rather
    than increasing linearly with facility count.
    """

    if critical_facility_count > 0:
        return CRITICAL_INFRASTRUCTURE_MAX

    return 0


def assess_and_prioritize_incident(
    db: Session,
    incident_id: int,
):
    """
    Deterministically assess and prioritize an incident.

    The tool:
        1. Retrieves incident conditions.
        2. Retrieves latest water-level information.
        3. Retrieves latest rainfall for the incident ward.
        4. Retrieves linked drainage information.
        5. Finds nearby critical infrastructure.
        6. Calculates deterministic factor scores.
        7. Produces a total priority score.
        8. Maps the score to a priority level.

    The LLM does not calculate the score.
    """

    # Retrieve incident context

    incident_query = text(
        """
        SELECT
            i.incident_id,
            i.status,
            i.severity,
            i.affected_population,

            h.hotspot_id,
            h.hotspot_code,
            h.ward_id,
            h.drain_id,
            h.geometry

        FROM incidents i

        JOIN hotspots h
            ON h.hotspot_id = i.hotspot_id

        WHERE i.incident_id = :incident_id
        """
    )

    incident = db.execute(
        incident_query,
        {
            "incident_id": incident_id,
        },
    ).mappings().first()

    if incident is None:
        return {
            "found": False,
            "incident_id": incident_id,
            "message": "Incident not found.",
        }

    # Latest water-level measurement

    water_query = text(
        """
        SELECT
            water_level_m,
            rate_of_change_m_per_min,
            timestamp

        FROM water_levels

        WHERE hotspot_id = :hotspot_id

        ORDER BY timestamp DESC

        LIMIT 1
        """
    )

    water = db.execute(
        water_query,
        {
            "hotspot_id": incident["hotspot_id"],
        },
    ).mappings().first()

    water_level = (
        float(water["water_level_m"])
        if water and water["water_level_m"] is not None
        else None
    )

    rate_of_change = (
        float(water["rate_of_change_m_per_min"])
        if water
        and water["rate_of_change_m_per_min"] is not None
        else None
    )

    # Latest rainfall for the incident's ward

    rainfall_query = text(
        """
        SELECT
            rainfall_mm_hr,
            timestamp,
            source

        FROM rainfall

        WHERE ward_id = :ward_id

        ORDER BY timestamp DESC

        LIMIT 1
        """
    )

    rainfall = db.execute(
        rainfall_query,
        {
            "ward_id": incident["ward_id"],
        },
    ).mappings().first()

    rainfall_mm_hr = (
        float(rainfall["rainfall_mm_hr"])
        if rainfall
        and rainfall["rainfall_mm_hr"] is not None
        else None
    )

    # Drainage condition

    drainage_query = text(
        """
        SELECT
            drain_id,
            drain_code,
            drain_type,
            capacity_m3_hr,
            condition,
            blocked_percentage,
            current_flow_m3_hr

        FROM drainage

        WHERE drain_id = :drain_id
        """
    )

    drainage = db.execute(
        drainage_query,
        {
            "drain_id": incident["drain_id"],
        },
    ).mappings().first()

    if drainage:
        capacity_m3_hr = (
            float(drainage["capacity_m3_hr"])
            if drainage["capacity_m3_hr"] is not None
            else None
        )

        current_flow_m3_hr = (
            float(drainage["current_flow_m3_hr"])
            if drainage["current_flow_m3_hr"] is not None
            else None
        )

        blocked_percentage = (
            float(drainage["blocked_percentage"])
            if drainage["blocked_percentage"] is not None
            else None
        )

        drainage_condition = drainage["condition"]

    else:
        capacity_m3_hr = None
        current_flow_m3_hr = None
        blocked_percentage = None
        drainage_condition = None

    # Find nearby critical infrastructure

    infrastructure_query = text(
        """
        SELECT
            f.facility_id,
            f.facility_code,
            f.name,
            f.facility_type,
            f.priority,

            ST_Distance(
                f.geometry::geography,
                h.geometry::geography
            ) / 1000.0 AS distance_km

        FROM facilities f

        JOIN hotspots h
            ON h.hotspot_id = :hotspot_id

        WHERE f.geometry IS NOT NULL
          AND h.geometry IS NOT NULL

          AND f.priority = 'CRITICAL'

          AND ST_DWithin(
              f.geometry::geography,
              h.geometry::geography,
              :radius_m
          )

        ORDER BY distance_km ASC
        """
    )

    infrastructure_result = db.execute(
        infrastructure_query,
        {
            "hotspot_id": incident["hotspot_id"],
            "radius_m": 2_000,
        },
    ).mappings()

    critical_facilities = [
        {
            "facility_id": row["facility_id"],
            "facility_code": row["facility_code"],
            "name": row["name"],
            "type": row["facility_type"],
            "priority": row["priority"],
            "distance_km": round(
                float(row["distance_km"]),
                2,
            ),
        }
        for row in infrastructure_result
    ]

    critical_facility_count = len(
        critical_facilities
    )

    # Calculate deterministic scores

    water_score = calculate_water_level_score(
        water_level
    )

    rainfall_score = calculate_rainfall_score(
        rainfall_mm_hr
    )

    rising_water_score = calculate_rising_water_score(
        rate_of_change
    )

    population_score = calculate_population_score(
        incident["affected_population"]
    )

    infrastructure_score = calculate_infrastructure_score(
        critical_facility_count
    )

    drainage_score = calculate_drainage_score(
        drainage_condition,
        blocked_percentage,
        capacity_m3_hr,
        current_flow_m3_hr,
    )

    # Calculate total

    priority_score = (
        water_score
        + rainfall_score
        + rising_water_score
        + population_score
        + infrastructure_score
        + drainage_score
    )

    priority_level = score_priority_level(
        priority_score
    )

    # Generate factual explanations

    explanation = []

    if water_score > 0:
        explanation.append(
            f"Current water level is {water_level:.2f} m "
            f"and contributes {water_score} points."
        )

    if rainfall_score > 0:
        explanation.append(
            f"Current rainfall is "
            f"{rainfall_mm_hr:.2f} mm/hr "
            f"and contributes {rainfall_score} points."
        )

    if rising_water_score > 0:
        explanation.append(
            f"Water level is changing at "
            f"{rate_of_change:.4f} m/min "
            f"and contributes {rising_water_score} points."
        )

    if population_score > 0:
        explanation.append(
            f"Affected population is "
            f"{incident['affected_population']} "
            f"and contributes {population_score} points."
        )

    if infrastructure_score > 0:
        explanation.append(
            f"{critical_facility_count} critical "
            f"facility/facilities are located within "
            f"2 km of the incident."
        )

    if drainage_score > 0:
        explanation.append(
            "Drainage conditions indicate increased "
            "system stress."
        )

    if not explanation:
        explanation.append(
            "No elevated scoring factors were identified "
            "from the available database data."
        )


    return {
        "found": True,

        "incident_id": incident_id,

        "severity": incident["severity"],

        "priority_score": priority_score,

        "priority_level": priority_level,

        "factors": {
            "water_level": water_score,
            "rainfall": rainfall_score,
            "rising_water": rising_water_score,
            "affected_population": population_score,
            "critical_infrastructure": infrastructure_score,
            "drainage_condition": drainage_score,
        },

        "measurements": {
            "water_level_m": water_level,
            "rainfall_mm_hr": rainfall_mm_hr,
            "rate_of_change_m_per_min": rate_of_change,
            "affected_population": incident[
                "affected_population"
            ],
            "drainage_condition": drainage_condition,
            "blocked_percentage": blocked_percentage,
            "drainage_capacity_m3_hr": capacity_m3_hr,
            "drainage_flow_m3_hr": current_flow_m3_hr,
        },

        "critical_infrastructure": critical_facilities,

        "explanation": explanation,
    }

if __name__ == "__main__":
    from database.session import SessionLocal
    db = SessionLocal()
    result = assess_and_prioritize_incident(db, incident_id=15)
    print(result)