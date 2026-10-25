function AgentWorkflow() {
  const workflowSteps = [
    "OBSERVE",
    "INVESTIGATE",
    "ASSESS",
    "PRIORITIZE",
    "GENERATE PLAN",
    "HUMAN APPROVAL",
  ];

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-5">
        <h2 className="text-sm font-semibold tracking-wider text-white">
          AGENT WORKFLOW
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Decision-support execution flow
        </p>
      </div>

      <div className="space-y-0">
        {workflowSteps.map((step, index) => {
          const isApproval = step === "HUMAN APPROVAL";

          return (
            <div key={step}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${
                    isApproval
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {index + 1}
                </div>

                <span
                  className={`text-xs font-medium tracking-wider ${
                    isApproval ? "text-amber-400" : "text-slate-300"
                  }`}
                >
                  {step}
                </span>
              </div>

              {index < workflowSteps.length - 1 && (
                <div className="ml-3.5 h-5 border-l border-slate-700" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AgentWorkflow;