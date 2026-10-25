import { useState } from "react";
import { runNewAnalysis } from "../../api/api";
import AnalysisAnimation from "./AnalysisAnimation";

function NewAnalysisPanel({ onAnalysisCompleted }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStartAnalysis = async () => {
  setShowConfirmation(false);
  setIsAnalyzing(true);

  try {
    const result = await runNewAnalysis();

    console.log("New analysis completed:", result);

    // Notify the parent that a new analysis has completed.
    onAnalysisCompleted?.();

  } catch (error) {
    console.error("Analysis failed:", error);
  } finally {
    setIsAnalyzing(false);
  }
};

  return (
    <>
      <section className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Information */}
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />

              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-100">
                New Situation Analysis
              </h2>
            </div>

            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500">
              Run a new city-wide assessment using the latest rainfall,
              water-level, incident, infrastructure, and resource data.
              The AI agent will generate a response plan for operator review.
            </p>
          </div>

          {/* Action */}
          <div className="shrink-0">
            {isAnalyzing ? (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-blue-500/30 bg-blue-500/10 px-6 py-2.5 text-xs font-semibold tracking-wide text-blue-400 opacity-80 sm:w-auto"
              >
                ANALYSIS IN PROGRESS
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                className="w-full rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-6 py-2.5 text-xs font-semibold tracking-wide text-cyan-400 transition-all hover:border-cyan-400/70 hover:bg-cyan-500/15 hover:text-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.12)] sm:w-auto"
              >
                ANALYZE CURRENT SITUATION
              </button>
            )}
          </div>
        </div>

        {/* Animated Analysis Progress */}
          {isAnalyzing && <AnalysisAnimation />}
      </section>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />

              <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
                Start New Assessment?
              </h2>
            </div>

            {/* Modal Content */}
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              The AI agent will analyze the current city-wide situation and
              generate a new response plan.
            </p>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              This assessment uses the latest available incident,
              environmental, infrastructure, and resource data. The
              generated plan will require human approval before it can be
              authorized.
            </p>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="rounded-md border border-slate-700 px-5 py-2.5 text-xs font-semibold tracking-wide text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-300"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleStartAnalysis}
                className="rounded-md border border-cyan-500/50 bg-cyan-500/10 px-5 py-2.5 text-xs font-semibold tracking-wide text-cyan-400 transition-all hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
              >
                START ASSESSMENT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NewAnalysisPanel;
