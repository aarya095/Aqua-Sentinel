import { useEffect, useState } from "react";
import { getActiveIncidents } from "../../api/api";

import IncidentCard from "./IncidentCard";

function ActiveIncidentsPanel() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadIncidents() {
      try {
        const data = await getActiveIncidents();
        setIncidents(data);
      } catch (err) {
        console.error("Failed to load active incidents:", err);
        setError("Failed to load incidents.");
      } finally {
        setLoading(false);
      }
    }

    loadIncidents();
  }, []);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-100">
            Active Incidents
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Incidents requiring operational attention
          </p>
        </div>

        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
          {incidents.length} active
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="px-4 py-6 text-sm text-slate-500">
          Loading incidents...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="px-4 py-6 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && incidents.length === 0 && (
        <div className="px-4 py-6 text-sm text-slate-500">
          No active incidents.
        </div>
      )}

      {/* Incident List */}
      {!loading && !error && incidents.length > 0 && (
        <div>
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ActiveIncidentsPanel;