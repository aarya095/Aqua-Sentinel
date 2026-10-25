import IncidentSummaryCard from "./IncidentSummaryCard";
import RainfallCard from "./RainfallCard";
import WaterLevelCard from "./WaterLevelCard";
import ResourceAvailabilityCard from "./ResourceAvailabilityCard";

function SituationSummary({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <IncidentSummaryCard
        activeIncidents={summary.incidents.active}
        criticalIncidents={summary.incidents.critical}
      />

      <RainfallCard
        rainfall={summary.rainfall.value_mm_hr}
        change={summary.rainfall.change_percent}
      />

      <WaterLevelCard
        waterLevel={summary.water_level.value_m}
        trend={summary.water_level.trend}
        rateOfChange={summary.water_level.rate_of_change_m_per_min}
      />

      <ResourceAvailabilityCard
        availablePumps={summary.resources.pumps.available}
        totalPumps={summary.resources.pumps.total}
        availableTeams={summary.resources.teams.available}
        totalTeams={summary.resources.teams.total}
      />
    </div>
  );
}

export default SituationSummary;