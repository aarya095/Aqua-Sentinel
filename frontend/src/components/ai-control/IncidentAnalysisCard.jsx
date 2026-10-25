import { useState } from "react";

function IncidentAnalysisCard({ incident }) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  const priorityStyles = {
    CRITICAL: {
      text: "text-red-400",
      border: "border-red-500/40",
      background: "bg-red-500/10",
      glow: "bg-red-500",
    },
    HIGH: {
      text: "text-orange-400",
      border: "border-orange-500/40",
      background: "bg-orange-500/10",
      glow: "bg-orange-500",
    },
    MODERATE: {
      text: "text-yellow-400",
      border: "border-yellow-500/40",
      background: "bg-yellow-500/10",
      glow: "bg-yellow-500",
    },
    LOW: {
      text: "text-slate-400",
      border: "border-slate-600",
      background: "bg-slate-800",
      glow: "bg-slate-500",
    },
  };

  const statusStyles = {
    ACTIVE_RESPONSE: {
      label: "Active Response",
      text: "text-emerald-400",
    },
    MONITOR: {
      label: "Monitor",
      text: "text-slate-400",
    },
  };

  const priority =
    priorityStyles[incident.priority] || priorityStyles.LOW;

  const status =
    statusStyles[incident.status] || statusStyles.MONITOR;

  const recommendedActions = incident.recommended_actions || [];
  const reasoning = incident.reasoning || [];

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-xl
        border border-slate-800
        bg-slate-900/80
        shadow-lg shadow-black/10
        transition-all duration-200
        hover:border-slate-700
        hover:shadow-xl hover:shadow-black/20
      "
    >
      {/* ============================================================
          INCIDENT SUMMARY
      ============================================================ */}
      <div className="relative px-5 py-4">
        {/* Priority accent */}
        <div
          className={`absolute left-0 top-0 h-full w-1 ${priority.glow}`}
        />

        <div className="flex items-center justify-between gap-4">
          {/* Incident identity */}
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-xl font-semibold tracking-tight text-white">
              #{incident.incident_id}
            </span>

            <span
              className={`
                rounded-md border
                px-2 py-0.5
                text-[10px]
                font-semibold
                tracking-[0.12em]
                ${priority.text}
                ${priority.border}
                ${priority.background}
              `}
            >
              {incident.priority}
            </span>
          </div>

          {/* Priority score */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] font-medium tracking-[0.14em] text-slate-500">
                SCORE
              </p>

              <p className="mt-0.5 text-xl font-semibold leading-none text-white">
                {incident.priority_score ?? "—"}
              </p>
            </div>

            <div
              className={`h-8 w-1 rounded-full ${priority.glow} opacity-70`}
            />
          </div>
        </div>

        {/* Summary information */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-800 pt-3">
          {/* Response */}
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-600">
              Response
            </p>

            <p className="mt-1 text-xs font-medium text-slate-300">
              {recommendedActions.length}{" "}
              {recommendedActions.length === 1 ? "action" : "actions"}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-600">
              Status
            </p>

            <p className={`mt-1 text-xs font-medium ${status.text}`}>
              {status.label}
            </p>
          </div>

          {/* Analysis */}
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-slate-600">
              Analysis
            </p>

            <button
              type="button"
              onClick={() => setShowFullAnalysis((current) => !current)}
              className="
                mt-1
                text-xs
                font-medium
                text-cyan-400
                transition-colors
                hover:text-cyan-300
              "
              aria-expanded={showFullAnalysis}
            >
              {showFullAnalysis ? "Hide details" : "View details"}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          EXPANDABLE ANALYSIS
      ============================================================ */}
      {showFullAnalysis && (
        <div className="border-t border-slate-800 px-5 py-4">
          {/* Recommended Response */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold tracking-[0.14em] text-slate-300">
                RECOMMENDED RESPONSE
              </h3>

              <span className="text-[9px] font-medium tracking-wider text-slate-600">
                {recommendedActions.length}{" "}
                {recommendedActions.length === 1 ? "ACTION" : "ACTIONS"}
              </span>
            </div>

            {recommendedActions.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {recommendedActions.map((action, index) => (
                  <RecommendationCard
                    key={`${action.action}-${action.resource_id || index}`}
                    action={action}
                    index={index}
                    status={incident.status}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                No recommended actions.
              </p>
            )}
          </div>

          {/* Prioritization Reasoning */}
          <div className="mt-5 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />

              <h3 className="text-[11px] font-semibold tracking-[0.14em] text-slate-300">
                WHY THIS INCIDENT WAS PRIORITIZED
              </h3>
            </div>

            {reasoning.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {reasoning.map((reason, index) => (
                  <li
                    key={index}
                    className="flex gap-2 text-left text-xs leading-relaxed text-slate-400"
                  >
                    <span className="mt-0.5 text-slate-600">•</span>

                    <span className="text-left">
                      {reason}
                      </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                No reasoning provided.
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

/* ================================================================
   RECOMMENDATION CARD
================================================================ */

function RecommendationCard({ action, index, status }) {
  // Incident-level status is authoritative.
  // Do not infer response mode from action.action.
  const isMonitor = status === "MONITOR";

  return (
    <div
      className={`
        group/action
        relative
        overflow-hidden
        rounded-lg
        border
        px-4 py-3
        transition-all duration-150
        ${
          isMonitor
            ? "border-slate-800 bg-slate-950/30 hover:border-slate-700 hover:bg-slate-900"
            : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900"
        }
      `}
    >
      {/* Top accent */}
      <div
        className={`
          absolute left-0 top-0 h-full w-0.5
          transition-opacity
          ${
            isMonitor
              ? "bg-slate-600 opacity-50"
              : "bg-emerald-500 opacity-60"
          }
        `}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold tracking-tight text-white">
            {action.resource_id || "—"}
          </p>

          <p className="mt-0.5 text-[9px] font-medium tracking-[0.14em] text-slate-500">
            {getResourceLabel(action)}
          </p>
        </div>

        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-800 text-[9px] text-slate-600">
          {index + 1}
        </span>
      </div>

      <div className="mt-3">
        <p
          className={`text-xs font-medium ${
            isMonitor ? "text-slate-300" : "text-emerald-400"
          }`}
        >
          {action.action}
        </p>

        <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
          {action.reason}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   HELPERS
================================================================ */

function getResourceLabel(action) {
  if (!action.resource_id) {
    return "NO RESOURCE";
  }

  if (action.resource_id.startsWith("P")) {
    return "PUMP";
  }

  if (action.resource_id.startsWith("T")) {
    return "RESPONSE TEAM";
  }

  return "RESOURCE";
}

export default IncidentAnalysisCard;