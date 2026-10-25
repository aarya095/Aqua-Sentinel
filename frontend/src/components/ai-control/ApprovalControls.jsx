import { useEffect, useState } from "react";
import { getLatestResponsePlan } from "../../api/api";

const API_BASE_URL = "http://127.0.0.1:8000";

function ApprovalControls() {
  const [plan, setPlan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showApproveConfirmation, setShowApproveConfirmation] =
    useState(false);

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRejectConfirmation, setShowRejectConfirmation] =
    useState(false);

  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    async function fetchLatestPlan() {
      try {
        setLoading(true);
        setError("");

        const data = await getLatestResponsePlan();

        setPlan(data);
      } catch (err) {
        console.error("Failed to fetch response plan:", err);
        setError("Unable to load response plan.");
      } finally {
        setLoading(false);
      }
    }

    fetchLatestPlan();
  }, []);

  const handleApprove = async () => {
    if (!plan?.plan_id || plan.status !== "PROPOSED") {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/operations/response-plans/${plan.plan_id}/approve`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to approve response plan."
        );
      }

      setPlan(data.plan);
      setShowApproveConfirmation(false);
    } catch (err) {
      console.error("Failed to approve response plan:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!plan?.plan_id || plan.status !== "PROPOSED") {
      return;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      setError("A rejection reason is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/operations/response-plans/${plan.plan_id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to reject response plan."
        );
      }

      setPlan(data.plan);
      setShowRejectConfirmation(false);
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (err) {
      console.error("Failed to reject response plan:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRejectDialog = () => {
    setError("");
    setShowRejectDialog(true);
  };

  const handleContinueToRejectConfirmation = () => {
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejecting the plan.");
      return;
    }

    setError("");
    setShowRejectDialog(false);
    setShowRejectConfirmation(true);
  };

  if (loading) {
    return (
      <section className="mt-6 rounded-xl border border-slate-700 bg-slate-900/80 p-6">
        <p className="text-xs text-slate-500">
          Loading approval status...
        </p>
      </section>
    );
  }

  if (!plan) {
    return (
      <section className="mt-6 rounded-xl border border-slate-700 bg-slate-900/80 p-6">
        <p className="text-xs text-slate-500">
          No response plan available for approval.
        </p>
      </section>
    );
  }

  const isProposed = plan.status === "PROPOSED";
  const isApproved = plan.status === "APPROVED";
  const isRejected = plan.status === "REJECTED";

  return (
    <>
      <section className="mt-6 rounded-xl border border-slate-700 bg-slate-900/80 p-6">
        <div
          className={
            isProposed
              ? "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
              : "flex justify-center text-center"
          }
        >
          {/* Approval information */}
          <div>
            <div className={isProposed ? "" : "w-full max-w-3xl"}>
              <span
                className={`h-2 w-2 rounded-full ${
                  isProposed
                    ? "bg-amber-400"
                    : isApproved
                      ? "bg-emerald-400"
                      : "bg-red-400"
                }`}
              />

              <h2 className="text-sm font-semibold tracking-[0.14em] text-white">
                {isProposed
                  ? "HUMAN APPROVAL REQUIRED"
                  : isApproved
                    ? "RESPONSE PLAN APPROVED"
                    : "RESPONSE PLAN REJECTED"}
              </h2>
            </div>

            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-500">
              {isProposed
                ? "Review the AI-generated response plan before authorizing resource deployment. The agent does not execute the plan without human approval."
                : isApproved
                  ? "This response plan has been approved by the human decision-maker. The decision can no longer be modified."
                  : "This response plan has been rejected. The decision can no longer be modified."}
            </p>

            {/* Final decision */}
            {!isProposed && (
              <div className="mt-4 space-y-2">
                <p
                  className={`text-xs font-semibold tracking-wider ${
                    isApproved
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  PLAN {plan.status}
                </p>

                {plan.decided_at && (
                  <p className="text-[11px] text-slate-600">
                    Decision recorded{" "}
                    {new Date(plan.decided_at).toLocaleString("en-IN")}
                  </p>
                )}

                {isRejected && plan.rejection_reason && (
                  <div className="mt-3 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2">
                    <p className="text-[10px] font-semibold tracking-wider text-red-400">
                      REJECTION REASON
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {plan.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-3 text-xs text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* Controls */}
          {isProposed && (
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleOpenRejectDialog}
                disabled={submitting}
                className="rounded-md border border-slate-700 px-5 py-2.5 text-xs font-semibold tracking-wider text-slate-400 transition hover:border-red-500/50 hover:bg-red-500/5 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                REJECT PLAN
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setShowApproveConfirmation(true);
                }}
                disabled={submitting}
                className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-6 py-2.5 text-xs font-semibold tracking-wider text-emerald-400 transition hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                APPROVE RESPONSE PLAN
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          APPROVE CONFIRMATION
      ============================================================ */}
      {showApproveConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-sm font-semibold tracking-[0.12em] text-white">
              CONFIRM APPROVAL
            </h3>

            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              You are about to approve this response plan. This decision
              will be recorded and cannot be modified afterward.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowApproveConfirmation(false)}
                disabled={submitting}
                className="rounded-md border border-slate-700 px-4 py-2 text-xs font-semibold tracking-wider text-slate-400 transition hover:border-slate-600 hover:text-slate-300 disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting}
                className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-5 py-2 text-xs font-semibold tracking-wider text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "APPROVING..." : "CONFIRM APPROVAL"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          REJECTION REASON
      ============================================================ */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-sm font-semibold tracking-[0.12em] text-white">
              REJECT RESPONSE PLAN
            </h3>

            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Provide a reason for rejecting the AI-generated response
              plan. This reason will be stored with the decision.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(event) => {
                setRejectionReason(event.target.value);
                setError("");
              }}
              placeholder="Enter rejection reason..."
              rows={4}
              className="mt-4 w-full resize-none rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-xs leading-relaxed text-slate-300 outline-none placeholder:text-slate-600 focus:border-slate-500"
            />

            {error && (
              <p className="mt-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectDialog(false);
                  setError("");
                }}
                disabled={submitting}
                className="rounded-md border border-slate-700 px-4 py-2 text-xs font-semibold tracking-wider text-slate-400 transition hover:border-slate-600 hover:text-slate-300 disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleContinueToRejectConfirmation}
                disabled={submitting}
                className="rounded-md border border-red-500/40 bg-red-500/10 px-5 py-2 text-xs font-semibold tracking-wider text-red-400 transition hover:border-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          REJECTION CONFIRMATION
      ============================================================ */}
      {showRejectConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-sm font-semibold tracking-[0.12em] text-white">
              CONFIRM REJECTION
            </h3>

            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              This will permanently mark the current response plan as
              rejected. The decision cannot be modified afterward.
            </p>

            <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2.5">
              <p className="text-[10px] font-semibold tracking-wider text-slate-600">
                REJECTION REASON
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {rejectionReason}
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectConfirmation(false);
                  setShowRejectDialog(true);
                }}
                disabled={submitting}
                className="rounded-md border border-slate-700 px-4 py-2 text-xs font-semibold tracking-wider text-slate-400 transition hover:border-slate-600 hover:text-slate-300 disabled:opacity-50"
              >
                BACK
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={submitting}
                className="rounded-md border border-red-500/40 bg-red-500/10 px-5 py-2 text-xs font-semibold tracking-wider text-red-400 transition hover:border-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "REJECTING..." : "CONFIRM REJECTION"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ApprovalControls;