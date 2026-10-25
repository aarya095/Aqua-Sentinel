import { useEffect, useState } from "react";
import { getOperationsSummary } from "../api/api";

import OperationsHeader from "../components/operations/OperationsHeader";
import SituationSummary from "../components/operations/SituationSummary";
import ActiveIncidentsPanel from "../components/operations/ActiveIncidentsPanel";
import AIResponseStatus from "../components/operations/AIResponseStatus";
import CityMap from "../components/operations/CityMap";
import NewAnalysisPanel from "../components/operations/NewAnalysisPanel";

function Operations() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Incremented whenever a new analysis completes.
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAnalysisCompleted = () => {
    setRefreshKey((previous) => previous + 1);
  };

  useEffect(() => {
    async function loadOperationsSummary() {
      try {
        const data = await getOperationsSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load operations summary:", err);
        setError("Failed to load operations data.");
      } finally {
        setLoading(false);
      }
    }

    loadOperationsSummary();
  }, []);

  if (loading) {
    return (
      <div>
        <OperationsHeader />

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading operations data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <OperationsHeader />

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <OperationsHeader />

      <div className="mt-6">
        <SituationSummary summary={summary} />
      </div>

      <div>
        <CityMap />

        <NewAnalysisPanel
          onAnalysisCompleted={handleAnalysisCompleted}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActiveIncidentsPanel />

        <AIResponseStatus refreshKey={refreshKey} />
      </div>
    </div>
  );
}

export default Operations;