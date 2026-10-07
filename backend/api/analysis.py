import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from agent.agent import AquaSentinelAgent
from database.session import SessionLocal


router = APIRouter(
    prefix="/api/analysis",
    tags=["Analysis"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/run")
def run_new_analysis(db: Session = Depends(get_db)):
    """
    Run a new city-wide AquaSentinel analysis and
    store the generated response plan as PROPOSED.
    """

    try:
        # Create a new agent instance.
        agent = AquaSentinelAgent()

        # Tell the agent to perform a complete city-wide assessment.
        agent_response = agent.run(
            """
            Perform a new city-wide assessment of the current AquaSentinel situation.

            Analyze all currently active waterlogging incidents using the available
            tools. Investigate, assess, prioritize, analyze relevant infrastructure
            and available resources, and generate a coordinated response plan.

            This is a new analysis based on the current database state.

            Return ONLY the final response JSON specified by the system prompt.
            """
        )

        # The agent is expected to return valid JSON.
        try:
            plan_data = json.loads(agent_response)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="AI agent returned invalid JSON."
            )

        # Make sure the response follows the expected top-level structure.
        if not isinstance(plan_data, dict):
            raise HTTPException(
                status_code=500,
                detail="AI agent response must be a JSON object."
            )

        if "incidents" not in plan_data:
            raise HTTPException(
                status_code=500,
                detail="AI agent response is missing 'incidents'."
            )

        if "requires_human_approval" not in plan_data:
            raise HTTPException(
                status_code=500,
                detail="AI agent response is missing 'requires_human_approval'."
            )

        # Store the complete agent response in response_plans.plan_data.
        insert_query = text("""
            INSERT INTO response_plans (
                status,
                plan_data
            )
            VALUES (
                'PROPOSED',
                CAST(:plan_data AS JSONB)
            )
            RETURNING
                plan_id,
                status,
                created_at
        """)

        result = db.execute(
            insert_query,
            {
                "plan_data": json.dumps(plan_data)
            }
        )

        new_plan = result.mappings().one()

        db.commit()

        return {
            "success": True,
            "message": "New response plan generated successfully.",
            "plan_id": new_plan["plan_id"],
            "status": new_plan["status"],
            "created_at": new_plan["created_at"],
            "plan_data": plan_data
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response plan: {str(e)}"
        )