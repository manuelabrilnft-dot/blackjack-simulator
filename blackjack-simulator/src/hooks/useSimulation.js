import { useState } from "react";
import { runSession } from "../engine/session.js";

const POSITION_ROUNDS = 1500;
const MAX_SEATS = 7;

/** Owns the Simulation tab inputs and results. */
export default function useSimulation() {
  const [simTT, setSimTT] = useState("20");
  const [simHN, setSimHN] = useState(1);
  const [simPair, setSimPair] = useState(false);
  const [simQ, setSimQ] = useState(false);
  const [simPos, setSimPos] = useState(1);
  const [simPN, setSimPN] = useState(1);
  const [simRounds, setSimRounds] = useState(3000);
  const [simOther, setSimOther] = useState(true);
  const [simRes, setSimRes] = useState(null);
  const [simRunning, setSimRunning] = useState(false);
  const [posData, setPosData] = useState(null);

  function runSim(strategy) {
    setSimRunning(true);
    setSimRes(null);
    setPosData(null);

    setTimeout(() => {
      setSimRes(
        runSession({
          tableType: simTT,
          handsN: simHN,
          usePair: simPair,
          useQueens: simQ,
          pos: simPos,
          playersN: simPN,
          rounds: simRounds,
          strat: strategy,
          otherRandom: simOther,
        })
      );

      // Replay every seat so the chart can show that seat choice is noise.
      const perPosition = [];
      for (let pos = 1; pos <= Math.min(simPN, MAX_SEATS); pos++) {
        const r = runSession({
          tableType: simTT,
          handsN: simHN,
          usePair: false,
          useQueens: false,
          pos,
          playersN: simPN,
          rounds: POSITION_ROUNDS,
          strat: strategy,
          otherRandom: simOther,
        });
        perPosition.push({ pos, avg: r.profit / POSITION_ROUNDS });
      }

      setPosData(perPosition);
      setSimRunning(false);
    }, 50);
  }

  return {
    simTT,
    setSimTT,
    simHN,
    setSimHN,
    simPair,
    setSimPair,
    simQ,
    setSimQ,
    simPos,
    setSimPos,
    simPN,
    setSimPN,
    simRounds,
    setSimRounds,
    simOther,
    setSimOther,
    simRes,
    simRunning,
    posData,
    runSim,
    positionRounds: POSITION_ROUNDS,
  };
}
