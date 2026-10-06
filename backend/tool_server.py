from fastapi import FastAPI

app = FastAPI(title="AquaSentinel Dummy Tool Server")


# Tool 1: Water Level
@app.get("/water-level/{zone_id}")
def get_water_level(zone_id: int):
    data = {
        1: {"zone_id": 1, "water_level_m": 0.35, "trend": "STABLE"},
        5: {"zone_id": 5, "water_level_m": 0.82, "trend": "RISING"},
        10: {"zone_id": 10, "water_level_m": 0.61, "trend": "RISING"},
    }

    return data.get(
        zone_id,
        {"zone_id": zone_id, "water_level_m": 0.20, "trend": "STABLE"}
    )


# Tool 2: Rainfall
@app.get("/rainfall/{zone_id}")
def get_rainfall(zone_id: int):
    data = {
        1: {"zone_id": 1, "rainfall_mm_hr": 25, "forecast_mm": 40},
        5: {"zone_id": 5, "rainfall_mm_hr": 85, "forecast_mm": 120},
        10: {"zone_id": 10, "rainfall_mm_hr": 60, "forecast_mm": 90},
    }

    return data.get(
        zone_id,
        {"zone_id": zone_id, "rainfall_mm_hr": 10, "forecast_mm": 20}
    )


# Tool 3: Critical Infrastructure
@app.get("/infrastructure/{zone_id}")
def get_critical_infrastructure(zone_id: int):
    data = {
        1: ["School A", "Clinic A"],
        5: ["City Hospital", "Central School", "Fire Station 5"],
        10: ["Hospital B", "Emergency Shelter"],
    }

    return {
        "zone_id": zone_id,
        "facilities": data.get(zone_id, [])
    }


# Tool 4: Available Pumps
@app.get("/pumps")
def get_available_pumps():
    return {
        "available_pumps": [
            {
                "pump_id": "P-101",
                "capacity_lpm": 5000,
                "location": "Depot A"
            },
            {
                "pump_id": "P-102",
                "capacity_lpm": 3000,
                "location": "Depot B"
            },
            {
                "pump_id": "P-103",
                "capacity_lpm": 7000,
                "location": "Depot C"
            }
        ]
    }


# Tool 5: Response Teams
@app.get("/response-teams")
def get_response_teams():
    return {
        "available_teams": [
            {
                "team_id": "T-01",
                "members": 6,
                "location": "Ward 12"
            },
            {
                "team_id": "T-02",
                "members": 4,
                "location": "Ward 15"
            },
            {
                "team_id": "T-03",
                "members": 8,
                "location": "Ward 20"
            }
        ]
    }