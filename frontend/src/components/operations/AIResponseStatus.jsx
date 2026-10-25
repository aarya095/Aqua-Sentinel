import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestResponsePlan } from "../../api/api";
import PrioritizedIncidents from "../../components/ai-control/PrioritizedIncidents";

function AIResponseStatus() {
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    async function fetchLatestPlan() {
      try {
        setLoading(true);
        setError("");

        const data = await getLatestResponsePlan();
        setPlan(data);
      } catch (err) {
        // 404 simply means no response plan exists yet.
        if (err.message === "Failed to fetch latest response plan") {
          setPlan(null);
        } else {
          console.error("Failed to fetch latest response plan:", err);
          setError("Unable to load AI response status.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLatestPlan();
  }, []);

  /*
   * Determine the UI state from the persisted plan.
   *
   * No plan       -> READY
   * PROPOSED      -> WAITING FOR APPROVAL
   * APPROVED      -> PLAN APPROVED
   * REJECTED      -> PLAN REJECTED
   *
   * isAnalyzing temporarily takes priority while the agent is running.
   */

  let agentStatus = "READY";

  if (isAnalyzing) {
    agentStatus = "ANALYZING";
  } else if (plan?.status === "PROPOSED") {
    agentStatus = "WAITING FOR APPROVAL";
  } else if (plan?.status === "APPROVED") {
    agentStatus = "PLAN APPROVED";
  } else if (plan?.status === "REJECTED") {
    agentStatus = "PLAN REJECTED";
  }

  const statusConfig = {
    READY: {
      label: "READY",
      indicator: "bg-slate-400",
      text: "text-slate-300",
    },

    ANALYZING: {
      label: "ANALYZING",
      indicator: "bg-blue-500",
      text: "text-blue-400",
    },

    "WAITING FOR APPROVAL": {
      label: "WAITING FOR APPROVAL",
      indicator: "bg-orange-500",
      text: "text-orange-400",
    },

    "PLAN APPROVED": {
      label: "PLAN APPROVED",
      indicator: "bg-emerald-500",
      text: "text-emerald-400",
    },

    "PLAN REJECTED": {
      label: "PLAN REJECTED",
      indicator: "bg-red-500",
      text: "text-red-400",
    },
  };

  const currentStatus =
    statusConfig[agentStatus] || statusConfig.READY;

  const completedTime = plan?.created_at
    ? new Date(plan.created_at).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : null;

  const decidedTime = plan?.decided_at
    ? new Date(plan.decided_at).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : null;

  const handleAnalyze = () => {
    /*
     * Agent execution will be connected here next.
     *
     * For now this only demonstrates the UI state.
     */
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleViewPlan = () => {
    navigate("/ai-control");
    window.scrollTo(0, 0);
  };
  
  const handleViewFinalPlan = () => {
  navigate("/ai-control#prioritized-incidents");
};

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      {/* Header */}
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-100">
        AI Response Status
      </h2>

      {/* Loading */}
      {loading && (
        <div className="mt-5">
          <p className="text-sm text-slate-500">
            Loading response status...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-5">
          <p className="text-sm text-red-400">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Agent Status */}
          <div className="mt-5 flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                currentStatus.indicator
              } ${
                agentStatus === "ANALYZING"
                  ? "animate-pulse"
                  : ""
              }`}
            />

            <span
              className={`text-sm font-semibold tracking-wide ${currentStatus.text}`}
            >
              {currentStatus.label}
            </span>
          </div>

          {/* Current Activity */}
          <div className="mt-6">
            <p className="text-xs font-medium text-slate-500">
              Current activity
            </p>

            {agentStatus === "READY" && (
              <p className="mt-1 text-sm font-medium text-slate-200">
                Awaiting city-wide assessment
              </p>
            )}

            {agentStatus === "ANALYZING" && (
              <p className="mt-1 text-sm font-medium text-slate-200">
                Agent is assessing current city conditions
              </p>
            )}

            {agentStatus === "WAITING FOR APPROVAL" && (
              <p className="mt-1 text-sm font-medium text-slate-200">
                Response plan awaiting operator approval
              </p>
            )}

            {agentStatus === "PLAN APPROVED" && (
              <p className="mt-1 text-sm font-medium text-slate-200">
                Response plan approved by operator
              </p>
            )}

            {agentStatus === "PLAN REJECTED" && (
              <p className="mt-1 text-sm font-medium text-slate-200">
                Response plan rejected by operator
              </p>
            )}
          </div>

          {/* Assessment Information */}
          {plan && (
            <div className="mt-5">
              <p className="text-xs font-medium text-slate-500">
                Last assessment
              </p>

              <p className="mt-1 text-sm font-medium text-slate-200">
                {completedTime}
              </p>
            </div>
          )}

          {/* Response Plan Information */}
          {plan && (
            <div className="mt-5">
              <p className="text-xs font-medium text-slate-500">
                Response plan
              </p>

              <p
                className={`mt-1 text-sm font-medium ${
                  plan.status === "APPROVED"
                    ? "text-emerald-400"
                    : plan.status === "REJECTED"
                    ? "text-red-400"
                    : "text-orange-400"
                }`}
              >
                {plan.status === "PROPOSED" &&
                  "Awaiting approval"}

                {plan.status === "APPROVED" &&
                  "Approved"}

                {plan.status === "REJECTED" &&
                  "Rejected"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Plan #{plan.plan_id}
              </p>
            </div>
          )}

          {/* Decision Information */}
          {plan?.status === "APPROVED" && decidedTime && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500">
                Decision recorded
              </p>

              <p className="mt-1 text-sm font-medium text-emerald-400">
                {decidedTime}
              </p>
            </div>
          )}

          {plan?.status === "REJECTED" && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500">
                Rejection reason
              </p>

              <p className="mt-1 text-sm leading-relaxed text-red-300">
                {plan.rejection_reason || "No reason provided"}
              </p>
            </div>
          )}

          {/* Primary Action */}
          {agentStatus === "READY" && (
            <button
              type="button"
              onClick={handleAnalyze}
              className="mt-6 w-full rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold tracking-wide text-cyan-400 transition-all hover:border-cyan-400/70 hover:bg-cyan-500/15 hover:text-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.12)]"
            >
              ANALYZE CURRENT SITUATION
            </button>
          )}

          {/* Analysis in Progress */}
          {agentStatus === "ANALYZING" && (
            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-semibold tracking-wide text-blue-400 opacity-80"
            >
              ANALYSIS IN PROGRESS
            </button>
          )}

          {/* Proposed Plan */}
          {plan?.status === "PROPOSED" && (
            <button
              type="button"
              onClick={handleViewFinalPlan}
              className="mt-6 w-full rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold tracking-wide text-cyan-400 transition-all hover:border-cyan-400/70 hover:bg-cyan-500/15 hover:text-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.12)]"
            >
              VIEW RESPONSE PLAN
            </button>
          )}

          {/* Approved Plan */}
          {plan?.status === "APPROVED" && (
            <button
              type="button"
              onClick={handleViewFinalPlan}
              className="mt-6 w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold tracking-wide text-emerald-400 transition-all hover:border-emerald-400/70 hover:bg-emerald-500/15 hover:text-emerald-300"
            >
              VIEW APPROVED PLAN
            </button>
          )}

          {/* Rejected Plan */}
          {plan?.status === "REJECTED" && (
            <button
              type="button"
              onClick={handleViewFinalPlan}
              className="mt-6 w-full rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold tracking-wide text-cyan-400 transition-all hover:border-cyan-400/70 hover:bg-cyan-500/15 hover:text-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.12)]"
            >
              VIEW REJECTED PLAN
            </button>
          )}

          {/* Secondary AI Control Button */}
          <button
            type="button"
            onClick={handleViewPlan}
            className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800/40 px-4 py-2.5 text-xs font-semibold tracking-wide text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-300"
          >
            OPEN AI CONTROL
          </button>
        </>
      )}
    </section>
  );
}

export default AIResponseStatus;