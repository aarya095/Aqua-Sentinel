import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  History as HistoryIcon,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  Waves,
  XCircle,
} from "lucide-react";

import { getResponsePlanHistory } from "../api/api";

const STATUS_FILTERS = [
  "ALL",
  "PROPOSED",
  "APPROVED",
  "REJECTED",
  "SUPERSEDED",
];

const STATUS_STYLES = {
  PROPOSED: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  APPROVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-400",
  SUPERSEDED: "border-slate-600 bg-slate-800 text-slate-400",
};

const PRIORITY_STYLES = {
  CRITICAL: "border-red-500/30 bg-red-500/10 text-red-400",
  HIGH: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  MODERATE: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  LOW: "border-slate-700 bg-slate-800 text-slate-400",
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium tracking-wide text-slate-500">
          {label}
        </p>

        <div className={`rounded-lg border border-slate-800 bg-slate-950 p-2 ${accent}`}>
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles =
    STATUS_STYLES[status] ||
    "border-slate-700 bg-slate-800 text-slate-400";

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold tracking-wider ${styles}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

function IncidentDetails({ incidents }) {
  if (!incidents.length) {
    return (
      <p className="text-sm text-slate-500">
        No incident details were saved in this response plan.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident, index) => {
        const priority =
          PRIORITY_STYLES[incident.priority] ||
          PRIORITY_STYLES.LOW;

        const actions = incident.recommended_actions || [];
        const reasoning = incident.reasoning || [];

        return (
          <article
            key={incident.incident_id ?? index}
            className="rounded-lg border border-slate-800 bg-slate-950/60 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">
                  Incident #{incident.incident_id ?? index + 1}
                </span>

                <span
                  className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${priority}`}
                >
                  {incident.priority || "UNSPECIFIED"}
                </span>
              </div>

              <div className="text-xs text-slate-500">
                Priority score:{" "}
                <span className="font-semibold text-white">
                  {incident.priority_score ?? "—"}
                </span>
              </div>
            </div>

            {incident.status && (
              <p className="mt-2 text-xs text-slate-400">
                Response mode: {incident.status}
              </p>
            )}

            <div className="mt-4">
              <p className="text-[10px] font-semibold tracking-widest text-slate-500">
                RECOMMENDED ACTIONS ({actions.length})
              </p>

              {actions.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {actions.map((action, actionIndex) => (
                    <div
                      key={`${action.action}-${action.resource_id ?? actionIndex}`}
                      className="rounded-md border border-slate-800 bg-slate-900/70 px-3 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-medium text-emerald-400">
                          {action.action || "Recommended action"}
                        </p>

                        {action.resource_id && (
                          <span className="rounded bg-slate-800 px-2 py-1 text-[10px] text-cyan-300">
                            {action.resource_id}
                          </span>
                        )}
                      </div>

                      {action.reason && (
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">
                          {action.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  No recommended actions recorded.
                </p>
              )}
            </div>

            <div className="mt-4 border-t border-slate-800 pt-3">
              <p className="text-[10px] font-semibold tracking-widest text-slate-500">
                PRIORITIZATION REASONING
              </p>

              {reasoning.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {reasoning.map((reason, reasonIndex) => (
                    <li
                      key={reasonIndex}
                      className="flex gap-2 text-xs leading-relaxed text-slate-400"
                    >
                      <span className="text-cyan-500">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  No reasoning recorded for this incident.
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPlan, setExpandedPlan] = useState(null);

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const data = await getResponsePlanHistory();

      setHistory(Array.isArray(data.history) ? data.history : []);
    } catch (err) {
      console.error("Failed to fetch response plan history:", err);
      setError(err.message || "Unable to load response history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const summary = useMemo(() => {
    return {
      total: history.length,
      approved: history.filter((plan) => plan.status === "APPROVED").length,
      rejected: history.filter((plan) => plan.status === "REJECTED").length,
      proposed: history.filter((plan) => plan.status === "PROPOSED").length,
    };
  }, [history]);

  const filteredHistory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return history.filter((plan) => {
      const matchesStatus =
        statusFilter === "ALL" || plan.status === statusFilter;

      const matchesSearch =
        !query ||
        String(plan.plan_id).includes(query) ||
        String(plan.status || "").toLowerCase().includes(query) ||
        formatDateTime(plan.created_at).toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [history, statusFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-cyan-400">
              <HistoryIcon size={18} />
              <span className="text-[10px] font-semibold tracking-[0.2em]">
                AQUASENTINEL / ARCHIVE
              </span>
            </div>

            <h1 className="mt-3 text-left text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Response History
            </h1>

            <p className="mt-2 max-w-2xl text-left text-sm leading-relaxed text-slate-500">
              Review previous AI assessments, prioritization decisions, and
              recommended resource allocations across AquaCity.
            </p>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh history
          </button>
        </div>

        {/* Summary cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Activity}
            label="TOTAL ANALYSES"
            value={summary.total}
            accent="text-cyan-400"
          />

          <SummaryCard
            icon={CheckCircle2}
            label="APPROVED PLANS"
            value={summary.approved}
            accent="text-emerald-400"
          />

          <SummaryCard
            icon={XCircle}
            label="REJECTED PLANS"
            value={summary.rejected}
            accent="text-red-400"
          />

          <SummaryCard
            icon={Clock3}
            label="AWAITING APPROVAL"
            value={summary.proposed}
            accent="text-amber-400"
          />
        </div>

        {/* History list */}
        <section className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="border-b border-slate-800 p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Saved response plans
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredHistory.length} of {history.length} records
                </p>
              </div>

              <div className="relative w-full lg:max-w-xs">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search plan ID or status..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => {
                const active = statusFilter === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md border px-3 py-2 text-[10px] font-semibold tracking-wider transition ${
                      active
                        ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                        : "border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    {status === "ALL" ? "ALL PLANS" : status}
                  </button>
                );
              })}
            </div>
          </div>

          {loading && (
            <div className="p-10 text-center">
              <RefreshCw
                size={22}
                className="mx-auto animate-spin text-cyan-400"
              />
              <p className="mt-3 text-sm text-slate-400">
                Loading saved response plans...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="m-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={17} />
                <p className="text-sm font-medium">
                  Could not load response history
                </p>
              </div>

              <p className="mt-2 text-xs text-slate-400">{error}</p>

              <button
                type="button"
                onClick={loadHistory}
                className="mt-3 text-xs font-medium text-cyan-400 hover:text-cyan-300"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredHistory.length === 0 && (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-500">
                <Waves size={21} />
              </div>

              <h3 className="mt-4 text-sm font-medium text-slate-300">
                {history.length === 0
                  ? "No response plans saved yet"
                  : "No matching response plans"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500">
                {history.length === 0
                  ? "Run an analysis from Operations. Once the AI agent saves a response plan, it will appear here."
                  : "Try another status filter or search term."}
              </p>
            </div>
          )}

          {!loading && !error && filteredHistory.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-slate-800 bg-slate-950/60">
                  <tr className="text-[10px] font-semibold tracking-widest text-slate-500">
                    <th className="px-5 py-4">PLAN</th>
                    <th className="px-5 py-4">CREATED</th>
                    <th className="px-5 py-4">INCIDENTS</th>
                    <th className="px-5 py-4">RESOURCES</th>
                    <th className="px-5 py-4">STATUS</th>
                    <th className="px-5 py-4 text-right">DETAILS</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80">
                  {filteredHistory.map((plan) => {
                    const incidents = plan.plan_data?.incidents || [];
                    const isExpanded = expandedPlan === plan.plan_id;

                    return (
                      <HistoryTableRows
                        key={plan.plan_id}
                        plan={plan}
                        incidents={incidents}
                        isExpanded={isExpanded}
                        onToggle={() =>
                          setExpandedPlan((current) =>
                            current === plan.plan_id ? null : plan.plan_id
                          )
                        }
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer note */}
        <div className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-slate-600">
          <ShieldAlert size={14} className="mt-0.5 shrink-0" />
          <p>
            Historical plans are read from saved records. Reviewing a plan does
            not rerun the AI analysis or change its approval status.
          </p>
        </div>
      </div>
    </div>
  );
}

function HistoryTableRows({
  plan,
  incidents,
  isExpanded,
  onToggle,
}) {
  return (
    <>
      <tr className="transition hover:bg-slate-800/20">
        <td className="px-5 py-4">
          <p className="text-sm font-semibold text-white">
            PLAN-{String(plan.plan_id).padStart(4, "0")}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            ID: {plan.plan_id}
          </p>
        </td>

        <td className="px-5 py-4">
          <p className="text-xs text-slate-300">
            {formatDate(plan.created_at)}
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            {formatDateTime(plan.created_at).split(", ").slice(-1)[0]}
          </p>
        </td>

        <td className="px-5 py-4">
          <p className="text-sm font-medium text-white">
            {plan.incidents_assessed ?? incidents.length}
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            {(plan.critical_priority_count || 0) +
              (plan.high_priority_count || 0)}{" "}
            high / critical
          </p>
        </td>

        <td className="px-5 py-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Waves size={13} />
              {plan.pumps_allocated || 0}
            </span>

            <span className="flex items-center gap-1.5 text-violet-300">
              <Users size={13} />
              {plan.teams_allocated || 0}
            </span>
          </div>

          <p className="mt-1 text-[10px] text-slate-600">
            Pumps / teams
          </p>
        </td>

        <td className="px-5 py-4">
          <StatusBadge status={plan.status} />
        </td>

        <td className="px-5 py-4 text-right">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-[11px] font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300"
          >
            {isExpanded ? "Hide" : "Inspect"}
            {isExpanded ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={6} className="border-t border-slate-800 bg-slate-950/50 p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-cyan-400">
                  HISTORICAL RESPONSE PLAN
                </p>

                <h3 className="mt-2 text-lg font-semibold text-white">
                  Plan #{plan.plan_id}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Created {formatDateTime(plan.created_at)}
                </p>
              </div>

              <div className="text-xs text-slate-400">
                <p>
                  Decision recorded:{" "}
                  <span className="text-slate-200">
                    {formatDateTime(plan.decided_at)}
                  </span>
                </p>
              </div>
            </div>

            {plan.status === "REJECTED" && plan.rejection_reason && (
              <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-[10px] font-semibold tracking-widest text-red-400">
                  REJECTION REASON
                </p>

                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {plan.rejection_reason}
                </p>
              </div>
            )}

            <IncidentDetails incidents={incidents} />
          </td>
        </tr>
      )}
    </>
  );
}

export default History;