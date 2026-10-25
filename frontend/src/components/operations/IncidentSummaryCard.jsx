function IncidentSummaryCard({ activeIncidents, criticalIncidents }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Active Incidents
      </p>

      <p className="mt-4 text-3xl font-semibold text-slate-100">
        {activeIncidents}
      </p>

      <p className="mt-2 text-sm font-medium text-red-400">
        {criticalIncidents} Critical
      </p>
    </div>
  );
}

export default IncidentSummaryCard;