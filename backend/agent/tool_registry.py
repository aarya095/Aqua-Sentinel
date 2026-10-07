TOOL_REGISTRY = [
   {
        "type": "function",
        "function": {
            "name": "get_active_incidents",
            "description": (
                "Retrieve all currently active waterlogging incidents in AquaCity. "
                "Use this tool to determine which incidents are currently active "
                "and require investigation or reassessment."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "investigate_incident",
            "description": (
                "Investigate an active waterlogging incident and retrieve its "
                "current environmental, drainage, geographic, population, "
                "road-access, and infrastructure context."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "incident_id": {
                        "type": "string",
                        "description": "The ID of the incident to investigate."
                    }
                },
                "required": ["incident_id"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "find_nearby_infrastructure",
            "description": (
                "Find critical infrastructure near a waterlogging incident. "
                "Use this to determine whether hospitals, schools, emergency "
                "facilities, or other important facilities may be affected."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "incident_id": {
                        "type": "string",
                        "description": "The incident to search around."
                    },
                    "radius_km": {
                        "type": "number",
                        "description": 
                            "Search radius around the incident in kilometers."
                        ,
                        "default": 2
                    }
                },
                "required": ["incident_id"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "get_available_resources",
            "description": (
                "Find currently available pumps and response teams that could "
                "potentially be assigned to an active waterlogging incident. "
                "Results include resource status, location, distance, and "
                "relevant capabilities."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "incident_id": {
                        "type": "string",
                        "description": (
                            "The incident for which suitable resources are needed."
                        )
                    }
                },
                "required": ["incident_id"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "assess_and_prioritize_incident",
            "description": (
                "Calculate the severity and priority of a waterlogging incident "
                "using current incident conditions and predefined backend rules. "
                "Returns a priority score, priority level, contributing factors, "
                "and an explanation."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "incident_id": {
                        "type": "string",
                        "description": "The incident to assess and prioritize."
                    }
                },
                "required": ["incident_id"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "find_nearby_hotspots",
            "description": (
                "Find historical waterlogging hotspots near a current incident. "
                "Use this to determine whether the incident is occurring near "
                "a location with a known history of waterlogging. The search is "
                "based on the incident's actual geographic location."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "incident_id": {
                        "type": "string",
                        "description": (
                            "The current incident to search around."
                        )
                    },
                    "radius_km": {
                        "type": "number",
                        "description": (
                            "Search radius around the incident in kilometers."
                        ),
                        "default": 0.5
                    }
                },
                "required": ["incident_id"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "allocate_resources",
            "description": (
                "Allocate currently available pumps across all active incidents "
                "using deterministic optimization. The allocator considers "
                "incident priority and geographic distance and ensures that "
                "each pump is assigned to at most one incident. Use this tool "
                "after incidents have been assessed and resource availability "
                "has been investigated. Do not manually assign pumps when this "
                "tool is available."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
]