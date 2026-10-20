import { useState } from "react";
import { calcSideBetStats } from "../engine/sideBetStats.js";
import { runSession } from "../engine/session.js";

const STAT_SAMPLES = 150000;
const COMPARISON_ROUNDS = 5000;

/**
 * Owns the Statistics tab results.
 *
 * The work is synchronous and heavy, so it is pushed behind a short timeout to
 * let the "calculating" state paint before the main thread blocks.
 */
export default function useStatistics() {
  const [statRes, setStatRes] = useState(null);
  const [statRunning, setStatRunning] = useState(false);
  const [statSimRes, setStatSimRes] = useState(null);

  function runStats(strategy) {
    setStatRunning(true);
    setStatRes(null);
    setStatSimRes(null);

    setTimeout(() => {
      setStatRes(calcSideBetStats(STAT_SAMPLES));

      // Three scenarios on the €20 table, to show what the side bets cost.
      const scenario = (usePair, useQueens) =>
        runSession({
          tableType: "20",
          handsN: 1,
          usePair,
          useQueens,
          pos: 1,
          playersN: 1,
          rounds: COMPARISON_ROUNDS,
          strat: strategy,
          otherRandom: false,
        });

      setStatSimRes({
        base: scenario(false, false),
        withPair: scenario(true, false),
        withBoth: scenario(true, true),
      });
      setStatRunning(false);
    }, 50);
  }

  return { statRes, statRunning, statSimRes, runStats, comparisonRounds: COMPARISON_ROUNDS };
}
