import { motion } from "framer-motion";

interface MatchHistorySelectorProps {
  matchSummariesReady: boolean;
  showMultiMatchHistory: boolean;
  setShowMultiMatchHistory: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MultiMatchHistorySelector({
  matchSummariesReady,
  showMultiMatchHistory,
  setShowMultiMatchHistory: setShowMatchHistory,
}: MatchHistorySelectorProps) {
  function onClick() {
    setShowMatchHistory(matchSummariesReady);
  }

  return (
    <nav className="w-64 bg-neutral-900 text-white flex flex-col">
      <div className="sticky top-0 z-10 bg-neutral-900 border-b border-gray-700">
        <h3 className="px-4 py-2 font-semibold">Match History Insights</h3>
      </div>
      <ul className="flex-1 overflow-y-auto overflow-y-scrollbar">
        <motion.li
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClick}
          className={`px-4 py-3 cursor-pointer border-b border-gray-800 hover:bg-neutral-800
            ${showMultiMatchHistory ? "bg-neutral-700" : ""}
            ${matchSummariesReady ? "text-green-400" : "text-gray-400"}
          `}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold">
              {matchSummariesReady ? "View Insights" : "Generating…"}
            </span>
            {/* You can adapt this right‑side detail to whatever makes sense */}
            <span className="text-sm">
              {matchSummariesReady ? "Ready" : "Please wait"}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {matchSummariesReady
              ? "Aggregated stats across recent matches"
              : "Preparing summaries"}
          </div>
        </motion.li>
      </ul>
    </nav>
  );
}
