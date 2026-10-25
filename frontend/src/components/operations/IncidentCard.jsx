function IncidentCard({ incident, onSelect }) {
  const severityStyles = {
    CRITICAL: {
      badge: "bg-red-500/10 text-red-400 border-red-500/20",
      indicator: "bg-red-500",
    },
    HIGH: {
      badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      indicator: "bg-orange-500",
    },
    MODERATE: {
      badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      indicator: "bg-yellow-500",
    },
    LOW: {
      badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      indicator: "bg-yellow-500",
    },
  };

  const styles =
    severityStyles[incident.severity] || severityStyles.MODERATE;

  const handleSelect = () => {
    onSelect?.(incident);
  };

  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleSelect : undefined}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleSelect();
              }
            }
          : undefined
      }
      className={`
        group
        border-b border-slate-800
        px-4 py-3
        last:border-b-0
        transition-colors duration-150
        hover:bg-slate-800/40
        ${onSelect ? "cursor-pointer" : ""}
        focus:outline-none
        focus-visible:bg-slate-800/40
        focus-visible:ring-1
        focus-visible:ring-cyan-400/50
      `}
    >
      {/* Incident Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${styles.indicator}`}
          />

          <span className="text-sm font-semibold text-slate-100">
            #{incident.id}
          </span>

          <span
            className={`
              rounded-md border
              px-2 py-0.5
              text-[10px]
              font-semibold
              tracking-wide
              ${styles.badge}
            `}
          >
            {incident.severity}
          </span>
        </div>

        {onSelect && (
          <span
            className="
              text-sm text-cyan-400
              transition-transform duration-150
              group-hover:translate-x-1
            "
          >
            →
          </span>
        )}
      </div>

      {/* Incident Information */}
      <div className="mt-3 grid grid-cols-3 gap-4">
        <div>
          <p className="text-[11px] text-slate-500">
            Ward
          </p>

          <p className="mt-0.5 text-sm font-medium text-slate-200">
            {incident.ward}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-slate-500">
            Water level
          </p>

          <p className="mt-0.5 text-sm font-medium text-slate-200">
            {incident.waterLevel} m
          </p>
        </div>

        <div>
          <p className="text-[11px] text-slate-500">
            Affected population
          </p>

          <p className="mt-0.5 text-sm font-medium text-slate-200">
            {incident.affectedPopulation.toLocaleString()}
          </p>
        </div>
      </div>
    </article>
  );
}

export default IncidentCard;