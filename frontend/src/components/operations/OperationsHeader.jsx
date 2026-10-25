function OperationsHeader() {
  return (

        <header className="mb-6 flex items-end justify-between border-b border-slate-800 pb-5 text-left">
        <div>
            <p className="text-2xl font-semibold tracking-wide text-white">
            OPERATIONS
            </p>
            <p className="mt-1 text-sm text-slate-400">
            Current city conditions and active emergency incidents
            </p>
        </div>
        <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Last updated
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
            10:42:18
            </p>
        </div>
        </header>
        
  );
}

export default OperationsHeader;