import { useEffect, useState } from "react";
import { getLatestResponsePlan } from "../../api/api";

function AssessmentSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await getLatestResponsePlan();

        // The latest AI-generated response plan is stored
        // under plan_data.
        const incidents = data.plan_data?.incidents || [];

        const highPriority = incidents.filter(
          (incident) => incident.priority === "HIGH"
        ).length;

        const pumpsAllocated = incidents.reduce(
          (count, incident) =>
            count +
            (incident.recommended_actions || []).filter(
              (action) =>
                action.resource_id &&
                action.resource_id.startsWith("P")
            ).length,
          0
        );

        const teamsAllocated = incidents.reduce(
          (count, incident) =>
            count +
            (incident.recommended_actions || []).filter(
              (action) =>
                action.resource_id &&
                action.resource_id.startsWith("T")
            ).length,
          0
        );

        setSummary({
          incidentsAssessed: incidents.length,
          highPriority,
          pumpsAllocated,
          teamsAllocated,
        });
      } catch (error) {
        console.error("Failed to load assessment summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-5">
          <h2 className="text-sm font-semibold tracking-wider text-white">
            ASSESSMENT SUMMARY
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Results from the current city-wide assessment
          </p>
        </div>

        <p className="text-sm text-slate-500">
          Loading assessment results...
        </p>
      </section>
    );
  }

  if (!summary) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-5">
          <h2 className="text-sm font-semibold tracking-wider text-white">
            ASSESSMENT SUMMARY
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Results from the current city-wide assessment
          </p>
        </div>

        <p className="text-sm text-slate-500">
          No assessment results available.
        </p>
      </section>
    );
  }

  const summaryItems = [
    {
      value: summary.incidentsAssessed,
      label: "INCIDENTS ASSESSED",
    },
    {
      value: summary.highPriority,
      label: "HIGH PRIORITY",
    },
    {
      value: summary.pumpsAllocated,
      label: "PUMPS ALLOCATED",
    },
    {
      value: summary.teamsAllocated,
      label: "TEAMS ALLOCATED",
    },
  ];

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-5">
        <h2 className="text-sm font-semibold tracking-wider text-white">
          ASSESSMENT SUMMARY
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Results from the current city-wide assessment
        </p>
      </div>

      <div className="divide-y divide-slate-800">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between py-3"
          >
            <span className="text-xs font-medium tracking-wider text-slate-400">
              {item.label}
            </span>

            <span className="text-2xl font-semibold text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AssessmentSummary;