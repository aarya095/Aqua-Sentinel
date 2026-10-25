import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestResponsePlan } from "../../api/api";

function AssessmentStatus() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResponsePlan() {
      try {
        const data = await getLatestResponsePlan();
        setPlan(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResponsePlan();
  }, []);

  if (loading) {
    return (
      <section className="mb-6 rounded-lg border border-slate-700 bg-slate-900/80 p-6">
        <p className="text-sm text-slate-400">
          Loading latest assessment...
        </p>
      </section>
    );
  }

  if (error || !plan) {
    return (
      <section className="mb-6 rounded-lg border border-slate-700 bg-slate-900/80 p-6">
        <p className="text-sm text-slate-400">
          No response plan available.
        </p>
      </section>
    );
  }

  const completedTime = new Date(plan.created_at).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }
  );

  const status = "RESPONSE PLAN READY";

  return (
    <section className="mb-6 rounded-lg border border-slate-700 bg-slate-900/80 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold tracking-wide text-white">
              CITY-WIDE ASSESSMENT
            </h2>

            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {status}
            </div>
          </div>

          <div className="mt-4 space-y-1 text-sm text-slate-400">
            <p>
              Assessment completed:{" "}
              <span className="text-slate-300">
                {completedTime}
              </span>
            </p>

            <p>
              <span className="text-slate-300">
                {plan.incidents_assessed}
              </span>{" "}
              active incidents assessed
            </p>

            <p className="text-amber-400">
              Human approval required
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            navigate("/ai-control#prioritized-incidents");

            requestAnimationFrame(() => {
              document
                .getElementById("prioritized-incidents")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            });
          }}
          className="rounded-md border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700 hover:text-white"
        >
          REVIEW RESPONSE PLAN
        </button>
    </div>

      <div className="mt-6 border-t border-slate-800 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wider text-emerald-400">
            RESPONSE PLAN READY
          </span>

          <span className="text-xs text-slate-500">
            CITY-WIDE ASSESSMENT COMPLETE
          </span>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-full rounded-full bg-emerald-500" />
        </div>
      </div>
    </section>
  );
}

export default AssessmentStatus;