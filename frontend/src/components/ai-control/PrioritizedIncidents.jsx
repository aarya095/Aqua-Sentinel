import { useEffect, useState } from "react";
import IncidentAnalysisCard from "./IncidentAnalysisCard";
import { getLatestResponsePlan } from "../../api/api";

function PrioritizedIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPrioritizedIncidents() {
      try {
        setLoading(true);
        setError("");

        const data = await getLatestResponsePlan();

        setIncidents(data.plan_data?.incidents || []);
      } catch (err) {
        console.error("Failed to fetch prioritized incidents:", err);
        setError("Unable to load prioritized incidents.");
      } finally {
        setLoading(false);
      }
    }

    fetchPrioritizedIncidents();
  }, []);

  useEffect(() => {
    if (window.location.hash === "#prioritized-incidents") {
      requestAnimationFrame(() => {
        document
          .getElementById("prioritized-incidents")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      });
    }
  }, []);

  return (
    <section id="prioritized-incidents" className="mt-6 scroll-mt-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-wider text-white">
          PRIORITIZED INCIDENTS
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Incidents assessed and prioritized by the AI agent
        </p>
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-5 py-4">
          <p className="text-xs text-slate-500">
            Loading prioritized incidents...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-5 py-4">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && incidents.length === 0 && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-5 py-4">
          <p className="text-xs text-slate-500">
            No prioritized incidents available.
          </p>
        </div>
      )}

      {!loading && !error && incidents.length > 0 && (
        <div className="space-y-4">
          {incidents
          .sort((a, b) => b.priority_score - a.priority_score)
          .map((incident) => (
            <IncidentAnalysisCard
              key={incident.incident_id}
              incident={incident}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default PrioritizedIncidents;