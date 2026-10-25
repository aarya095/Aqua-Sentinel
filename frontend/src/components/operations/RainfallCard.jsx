function RainfallCard({ rainfall, change }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Rainfall
      </p>

      <p className="mt-4 text-3xl font-semibold text-slate-100">
        {rainfall}{" "}
        <span className="text-base font-medium text-slate-400">
          mm/hr
        </span>
      </p>

      <p className="mt-2 text-sm font-medium text-orange-400">
        ↑ {change}%
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Heavy
      </p>
    </div>
  );
}

export default RainfallCard;