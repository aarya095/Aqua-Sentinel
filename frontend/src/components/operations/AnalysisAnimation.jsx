import { useEffect, useState } from "react";
import { Activity, BrainCircuit, Radar } from "lucide-react";

const messages = [
  "Collecting environmental observations...",
  "Investigating active waterlogging incidents...",
  "Assessing infrastructure and resource availability...",
  "Evaluating incident priorities...",
  "Preparing response recommendations...",
];

function AnalysisAnimation() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((previous) => (previous + 1) % messages.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-label="AI analysis in progress"
      className="mt-5 overflow-hidden rounded-xl border border-cyan-500/20 bg-slate-950/70 p-5"
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        {/* Animated radar */}
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
          {/* Radar rings */}
          <div className="absolute h-24 w-24 rounded-full border border-cyan-500/15" />
          <div className="absolute h-16 w-16 rounded-full border border-cyan-500/25" />
          <div className="absolute h-9 w-9 rounded-full border border-cyan-500/30" />

          {/* Outer rotating ring */}
          <div className="absolute h-24 w-24 animate-spin rounded-full border-2 border-transparent border-t-cyan-400/80 border-r-cyan-400/20 [animation-duration:3s] motion-reduce:animate-none" />

          {/* Inner counter-rotating ring */}
          <div className="absolute h-16 w-16 animate-spin rounded-full border border-transparent border-b-blue-400/80 [animation-direction:reverse] [animation-duration:2s] motion-reduce:animate-none" />

          {/* Center glow */}
          <div className="absolute h-12 w-12 animate-pulse rounded-full bg-cyan-500/10 blur-lg motion-reduce:animate-none" />

          {/* Center icon */}
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-900">
            <Radar
              size={21}
              className="text-cyan-400"
            />
          </div>

          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin [animation-duration:5s] motion-reduce:animate-none">
            <span className="absolute left-1/2 top-1 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          </div>
        </div>

        {/* Analysis information */}
        <div className="w-full min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <BrainCircuit
              size={16}
              className="text-cyan-400"
            />

            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              AI Agent Active
            </p>

            <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none" />
          </div>

          <p className="mt-3 min-h-5 text-sm font-medium text-slate-200">
            {messages[messageIndex]}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Processing the latest city-wide operational data
          </p>

          {/* Indeterminate progress bar */}
          <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="absolute inset-y-0 left-0 w-1/3 animate-[analysis-slide_1.8s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-blue-500 motion-reduce:animate-none" />
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Activity
              size={13}
              className="text-cyan-500"
            />

            <span>Analysis in progress</span>

            <span className="ml-auto text-cyan-500/80">
              Processing...
            </span>
          </div>
        </div>
      </div>

      {/* Workflow stages */}
      <div className="mt-5 border-t border-slate-800 pt-4">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
          <span>Observe</span>
          <span className="text-cyan-500/50">→</span>

          <span>Investigate</span>
          <span className="text-cyan-500/50">→</span>

          <span>Assess</span>
          <span className="text-cyan-500/50">→</span>

          <span>Prioritize</span>
          <span className="text-cyan-500/50">→</span>

          <span>Generate Plan</span>
        </div>
      </div>
    </div>
  );
}

export default AnalysisAnimation;   