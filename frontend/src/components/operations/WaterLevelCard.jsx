function WaterLevelCard({
  waterLevel,
  trend,
  rateOfChange,
}) {
  const arrow =
    rateOfChange > 0
      ? "↑"
      : rateOfChange < 0
        ? "↓"
        : "—";

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Water Level
      </p>

      <p className="mt-4 text-3xl font-semibold text-slate-100">
        {waterLevel}{" "}
        <span className="text-base font-medium text-slate-400">
          m
        </span>
      </p>

      <p className="mt-2 text-sm font-medium text-orange-400">
        {arrow} {Math.abs(rateOfChange)} m/min
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {trend}
      </p>
    </div>
  );
}

export default WaterLevelCard;  