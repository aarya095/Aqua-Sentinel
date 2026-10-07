from tools.allocate_resources import allocate_pumps


incidents = [
    {
        "incident_id": "12",
        "priority": "HIGH",
        "latitude": 19.045,
        "longitude": 72.895,
    },
    {
        "incident_id": "11",
        "priority": "HIGH",
        "latitude": 19.050,
        "longitude": 72.900,
    },
    {
        "incident_id": "13",
        "priority": "HIGH",
        "latitude": 19.040,
        "longitude": 72.890,
    },
    {
        "incident_id": "16",
        "priority": "HIGH",
        "latitude": 19.060,
        "longitude": 72.910,
    },
]


pumps = [
    {
        "pump_id": "P001",
        "latitude": 19.046,
        "longitude": 72.896,
    },
    {
        "pump_id": "P003",
        "latitude": 19.041,
        "longitude": 72.891,
    },
    {
        "pump_id": "P004",
        "latitude": 19.061,
        "longitude": 72.911,
    },
]


result = allocate_pumps(incidents, pumps)

print(result)