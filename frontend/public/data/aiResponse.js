const aiResponse = {
  incidents: [
    {
      incident_id: "13",
      priority: "HIGH",
      recommended_actions: [
        {
          action: "Allocate pump",
          resource_id: "P003",
          reason:
            "Nearest available pump (0.54 km) matches high priority (score 47) and rising water level.",
        },
        {
          action: "Allocate response team",
          resource_id: "T003",
          reason:
            "Nearest available water response team (0.39 km) for critical facility proximity.",
        },
      ],
      reasoning: [
        "Priority score 47 (highest among active incidents).",
        "Water level 0.67 m and rising (+0.003 m/min) increase urgency.",
        "Critical water treatment plant within 2 km.",
        "Available pump P003 and response team T003 are unassigned and closest.",
      ],
    },
    {
      incident_id: "16",
      priority: "HIGH",
      recommended_actions: [
        {
          action: "Allocate response team",
          resource_id: "T001",
          reason:
            "Available water response team (5.46 km) and incident has high priority due to nearby hospital.",
        },
        {
          action: "Monitor",
          resource_id: null,
          reason:
            "All pumps are already allocated to higher-priority incidents; continue observation.",
        },
      ],
      reasoning: [
        "Priority score 43, moderate water level 0.55 m with slight rise.",
        "Critical hospital within 2 km.",
        "No unassigned pump remains; monitoring is appropriate until resources free up.",
      ],
    },
    {
      incident_id: "12",
      priority: "HIGH",
      recommended_actions: [
        {
          action: "Allocate pump",
          resource_id: "P001",
          reason:
            "Available pump (5.15 km) not assigned elsewhere for incident with priority score 42.",
        },
        {
          action: "Allocate response team",
          resource_id: "T002",
          reason:
            "Nearest emergency response team (0.48 km) supports rapid assistance near critical fire station.",
        },
      ],
      reasoning: [
        "Priority score 42, critical fire station 0.32 km away.",
        "High rainfall (95.57 mm/hr) and affected population 2100.",
        "Pump P001 and team T002 are free after allocations to incidents 13 and 11.",
      ],
    },
    {
      incident_id: "11",
      priority: "HIGH",
      recommended_actions: [
        {
          action: "Allocate pump",
          resource_id: "P004",
          reason:
            "Nearest available pump (3.46 km) for incident with priority score 42 and poor drainage.",
        },
        {
          action: "Allocate response team",
          resource_id: "T004",
          reason:
            "Nearest medical response team (1.18 km) assists near the general hospital.",
        },
      ],
      reasoning: [
        "Priority score 42, very high rainfall (162.89 mm/hr).",
        "Drainage condition poor, water level 0.34 m decreasing.",
        "Critical hospital within 0.31 km; pump P004 and team T004 are unassigned.",
      ],
    },
  ],

  requires_human_approval: true,
};

export default aiResponse;