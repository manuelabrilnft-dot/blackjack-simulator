import { useState } from "react";
import { buildStrategy } from "../engine/ev.js";
import { CFG } from "../engine/tables.js";
import { REFERENCE_STRATEGY } from "../engine/referenceStrategy.js";

/**
 * Owns the Monte Carlo strategy table.
 *
 * `strat` is null until the user builds one. `activeStrategy` always holds a
 * usable table, falling back to the published reference, and is what the rest
 * of the app reads.
 */
export default function useStrategyBuilder() {
  const [strat, setStrat] = useState(null);
  const [buildStatus, setBuildStatus] = useState("idle");
  const [buildPct, setBuildPct] = useState(0);
  const [buildTT, setBuildTT] = useState("20");

  async function buildStrat() {
    setBuildStatus("building");
    setBuildPct(0);
    setStrat(null);
    const s = await buildStrategy(CFG[buildTT].bjP, (p) => setBuildPct(p));
    setStrat(s);
    setBuildStatus("done");
  }

  const activeStrategy = strat || REFERENCE_STRATEGY;

  return { strat, activeStrategy, buildStatus, buildPct, buildTT, setBuildTT, buildStrat };
}
