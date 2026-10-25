import { useEffect, useState } from "react";
import { checkBackendHealth } from "../../api/api";

function AIControlHeader() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    async function checkHealth() {
      const online = await checkBackendHealth();
      setIsOnline(online);
    }

    checkHealth();

    const interval = setInterval(checkHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="mb-6 flex items-end justify-between border-b border-slate-800 pb-5 text-left">
      <div>
        <h1 className="text-2xl font-semibold tracking-wide text-white">
          AI CONTROL
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Agent decision-support and response planning
        </p>
      </div>

      <div
        className={`flex items-center gap-2 text-xs font-medium tracking-wider ${
          isOnline ? "text-emerald-400" : "text-red-400"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isOnline ? "bg-emerald-400" : "bg-red-400"
          }`}
        />

        {isOnline ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
      </div>
    </header>
  );
}

export default AIControlHeader;