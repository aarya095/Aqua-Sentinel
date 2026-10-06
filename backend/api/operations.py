from fastapi import APIRouter, Depends, HTTPException

from pydantic import BaseModel

from sqlalchemy import text
from sqlalchemy.orm import Session

from database.session import SessionLocal


router = APIRouter(
    prefix="/api/operations",
    tags=["Operations"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/summary")
def get_operations_summary(db: Session = Depends(get_db)):

    # ---------------------------------------------------------
    # 1. ACTIVE INCIDENTS
    # ---------------------------------------------------------

    incident_query = text("""
        SELECT
            COUNT(*) AS active_incidents,
            COUNT(*) FILTER (
                WHERE severity = 'CRITICAL'
            ) AS critical_incidents
        FROM incidents
        WHERE status = 'ACTIVE';
    """)

    incident_result = db.execute(incident_query).mappings().one()

    active_incidents = incident_result["active_incidents"]
    critical_incidents = incident_result["critical_incidents"]


    # ---------------------------------------------------------
    # 2. RAINFALL
    #
    # Take the latest reading from every ward and calculate
    # the city-wide average.
    #
    # Also compare it with the previous reading from each ward.
    # ---------------------------------------------------------

    rainfall_query = text("""
        WITH ranked_rainfall AS (
            SELECT
                ward_id,
                rainfall_mm_hr,
                timestamp,
                ROW_NUMBER() OVER (
                    PARTITION BY ward_id
                    ORDER BY timestamp DESC
                ) AS rn
            FROM rainfall
        ),

        latest AS (
            SELECT
                rainfall_mm_hr
            FROM ranked_rainfall
            WHERE rn = 1
        ),

        previous AS (
            SELECT
                rainfall_mm_hr
            FROM ranked_rainfall
            WHERE rn = 2
        )

        SELECT
            ROUND(AVG(latest.rainfall_mm_hr), 2) AS current_rainfall,
            ROUND(AVG(previous.rainfall_mm_hr), 2) AS previous_rainfall
        FROM latest
        LEFT JOIN previous
            ON TRUE;
    """)

    rainfall_result = db.execute(
        rainfall_query
    ).mappings().one()

    current_rainfall = rainfall_result["current_rainfall"]
    previous_rainfall = rainfall_result["previous_rainfall"]

    if (
        current_rainfall is not None
        and previous_rainfall is not None
        and previous_rainfall != 0
    ):
        rainfall_change_percent = round(
            (
                (float(current_rainfall) - float(previous_rainfall))
                / float(previous_rainfall)
            ) * 100,
            1
        )
    else:
        rainfall_change_percent = None


    # ---------------------------------------------------------
    # 3. WATER LEVEL
    #
    # Take the latest measurement from every hotspot and
    # calculate the average current water level.
    #
    # The database already stores rate_of_change_m_per_min,
    # so we can derive whether the overall situation is rising,
    # falling or stable.
    # ---------------------------------------------------------

    water_level_query = text("""
        WITH ranked_levels AS (
            SELECT
                hotspot_id,
                water_level_m,
                rate_of_change_m_per_min,
                timestamp,
                ROW_NUMBER() OVER (
                    PARTITION BY hotspot_id
                    ORDER BY timestamp DESC
                ) AS rn
            FROM water_levels
        )

        SELECT
            ROUND(AVG(water_level_m), 2) AS current_water_level,
            ROUND(AVG(rate_of_change_m_per_min), 4) AS avg_rate_of_change
        FROM ranked_levels
        WHERE rn = 1;
    """)

    water_level_result = db.execute(
        water_level_query
    ).mappings().one()

    current_water_level = water_level_result["current_water_level"]
    avg_rate_of_change = water_level_result["avg_rate_of_change"]

    if avg_rate_of_change is None:
        water_level_trend = "Stable"
    elif float(avg_rate_of_change) > 0:
        water_level_trend = "Rising"
    elif float(avg_rate_of_change) < 0:
        water_level_trend = "Falling"
    else:
        water_level_trend = "Stable"


    # ---------------------------------------------------------
    # 4. RESOURCE AVAILABILITY
    # ---------------------------------------------------------

    resource_query = text("""
        SELECT
            (
                SELECT COUNT(*)
                FROM pumps
                WHERE status = 'AVAILABLE'
            ) AS available_pumps,

            (
                SELECT COUNT(*)
                FROM pumps
            ) AS total_pumps,

            (
                SELECT COUNT(*)
                FROM response_teams
                WHERE status = 'AVAILABLE'
            ) AS available_teams,

            (
                SELECT COUNT(*)
                FROM response_teams
            ) AS total_teams;
    """)

    resource_result = db.execute(
        resource_query
    ).mappings().one()


    # ---------------------------------------------------------
    # FINAL RESPONSE
    # ---------------------------------------------------------

    return {
        "incidents": {
            "active": active_incidents,
            "critical": critical_incidents
        },

        "rainfall": {
            "value_mm_hr": float(current_rainfall)
                if current_rainfall is not None
                else None,
            "change_percent": rainfall_change_percent
        },

        "water_level": {
            "value_m": float(current_water_level)
                if current_water_level is not None
                else None,
            "trend": water_level_trend,
            "rate_of_change_m_per_min": float(avg_rate_of_change)
                if avg_rate_of_change is not None
                else None
        },

        "resources": {
            "pumps": {
                "available": resource_result["available_pumps"],
                "total": resource_result["total_pumps"]
            },
            "teams": {
                "available": resource_result["available_teams"],
                "total": resource_result["total_teams"]
            }
        }
    }

@router.get("/incidents")
def get_active_incidents(db: Session = Depends(get_db)):
    query = text("""
        SELECT
            i.incident_id,
            i.severity,
            w.ward_id,
            w.name AS ward,
            i.affected_population,
            wl.water_level_m
        FROM incidents i
        JOIN hotspots h
            ON i.hotspot_id = h.hotspot_id
        JOIN wards w
            ON h.ward_id = w.ward_id
        LEFT JOIN LATERAL (
            SELECT water_level_m
            FROM water_levels
            WHERE hotspot_id = i.hotspot_id
            ORDER BY timestamp DESC
            LIMIT 1
        ) wl ON TRUE
        WHERE i.status = 'ACTIVE'
        ORDER BY
            CASE i.severity
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH' THEN 2
                WHEN 'MODERATE' THEN 3
                WHEN 'LOW' THEN 4
            END,
            i.affected_population DESC;
    """)

    result = db.execute(query).mappings().all()

    incidents = []

    for row in result:
        incidents.append({
            "id": row["incident_id"],
            "severity": row["severity"],
            "ward": row["ward"],
            "waterLevel": row["water_level_m"],
            "affectedPopulation": row["affected_population"],
        })

    return incidents

@router.get("/latest-response-plan")
def get_latest_response_plan(db: Session = Depends(get_db)):

    query = text("""
        SELECT
            plan_id,
            status,
            created_at,
            decided_at,
            plan_data,
            rejection_reason
        FROM response_plans
        ORDER BY created_at DESC
        LIMIT 1
    """)

    result = db.execute(query).mappings().first()

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="No response plan found"
        )

    plan_data = result["plan_data"]
    incidents = plan_data.get("incidents", [])

    high_priority_count = sum(
        1
        for incident in incidents
        if incident.get("priority") == "HIGH"
    )

    pumps_allocated = sum(
        1
        for incident in incidents
        for action in incident.get("recommended_actions", [])
        if action.get("action") == "Allocate pump"
        and action.get("resource_id") is not None
    )

    teams_allocated = sum(
        1
        for incident in incidents
        for action in incident.get("recommended_actions", [])
        if action.get("action") == "Allocate response team"
        and action.get("resource_id") is not None
    )

    return {
        "plan_id": result["plan_id"],
        "status": result["status"],
        "created_at": result["created_at"],
        "decided_at": result["decided_at"],
        "plan_data": plan_data,
        "incidents_assessed": len(incidents),
        "high_priority_count": high_priority_count,
        "pumps_allocated": pumps_allocated,
        "teams_allocated": teams_allocated,
        "rejection_reason": result["rejection_reason"]
    }

class RejectPlanRequest(BaseModel):
    reason: str

@router.patch("/response-plans/{plan_id}/approve")
def approve_response_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
    query = text("""
        UPDATE response_plans
        SET
            status = 'APPROVED',
            decided_at = CURRENT_TIMESTAMP
        WHERE plan_id = :plan_id
          AND status = 'PROPOSED'
        RETURNING
            plan_id,
            status,
            created_at,
            decided_at,
            plan_data,
            rejection_reason
    """)

    result = db.execute(
        query,
        {
            "plan_id": plan_id
        }
    ).mappings().first()

    if result is None:
        db.rollback()

        check_query = text("""
            SELECT status
            FROM response_plans
            WHERE plan_id = :plan_id
        """)

        existing_plan = db.execute(
            check_query,
            {
                "plan_id": plan_id
            }
        ).mappings().first()

        if existing_plan is None:
            raise HTTPException(
                status_code=404,
                detail="Response plan not found"
            )

        raise HTTPException(
            status_code=409,
            detail=f"Response plan is already {existing_plan['status']}"
        )

    db.commit()

    return {
        "message": "Response plan approved successfully",
        "plan": dict(result)
    }

@router.patch("/response-plans/{plan_id}/reject")
def reject_response_plan(
    plan_id: int,
    request: RejectPlanRequest,
    db: Session = Depends(get_db)
):
    reason = request.reason.strip()

    if not reason:
        raise HTTPException(
            status_code=400,
            detail="Rejection reason is required"
        )

    query = text("""
        UPDATE response_plans
        SET
            status = 'REJECTED',
            decided_at = CURRENT_TIMESTAMP,
            rejection_reason = :reason
        WHERE plan_id = :plan_id
          AND status = 'PROPOSED'
        RETURNING
            plan_id,
            status,
            created_at,
            decided_at,
            plan_data,
            rejection_reason
    """)

    result = db.execute(
        query,
        {
            "plan_id": plan_id,
            "reason": reason
        }
    ).mappings().first()

    if result is None:
        db.rollback()

        check_query = text("""
            SELECT status
            FROM response_plans
            WHERE plan_id = :plan_id
        """)

        existing_plan = db.execute(
            check_query,
            {
                "plan_id": plan_id
            }
        ).mappings().first()

        if existing_plan is None:
            raise HTTPException(
                status_code=404,
                detail="Response plan not found"
            )

        raise HTTPException(
            status_code=409,
            detail=f"Response plan is already {existing_plan['status']}"
        )

    db.commit()

    return {
        "message": "Response plan rejected successfully",
        "plan": dict(result)
    }