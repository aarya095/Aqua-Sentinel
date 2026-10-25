function ResourceAvailabilityCard({
  availablePumps,
  totalPumps,
  availableTeams,
  totalTeams,
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Resources
      </p>

      <div className="mt-4 space-y-2">
        <p className="text-lg font-semibold text-slate-100">
          {availablePumps}/{totalPumps}{" "}
          <span className="text-sm font-medium text-slate-400">
            Pumps
          </span>
        </p>

        <p className="text-lg font-semibold text-slate-100">
          {availableTeams}/{totalTeams}{" "}
          <span className="text-sm font-medium text-slate-400">
            Teams
          </span>
        </p>
      </div>

      <p className="mt-2 text-sm font-medium text-green-400">
        Available
      </p>
    </div>
  );
}

export default ResourceAvailabilityCard;