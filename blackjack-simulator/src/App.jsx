import { useState } from "react";
import useBlackjackGame from "./hooks/useBlackjackGame.js";
import useStrategyBuilder from "./hooks/useStrategyBuilder.js";
import useStatistics from "./hooks/useStatistics.js";
import useSimulation from "./hooks/useSimulation.js";
import GameTab from "./tabs/GameTab.jsx";
import StrategyTab from "./tabs/StrategyTab.jsx";
import StatisticsTab from "./tabs/StatisticsTab.jsx";
import SimulationTab from "./tabs/SimulationTab.jsx";
import { TABS } from "./theme.js";

/**
 * Application shell.
 *
 * Every hook is called here rather than inside its tab, so state survives when
 * the user switches tabs and the strategy table is shared by all four.
 */
export default function App() {
  const [tab, setTab] = useState(0);

  const builder = useStrategyBuilder();
  const game = useBlackjackGame(builder.activeStrategy);
  const statistics = useStatistics();
  const simulation = useSimulation();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 5%,#0c4226,#050f09 65%)",
        fontFamily: "'Georgia',serif",
        color: "#ddd",
        paddingBottom: 52,
      }}
    >
      <header style={{ textAlign: "center", padding: "14px 0 4px" }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: 3,
            color: "#f1c40f",
            textShadow: "0 0 20px #f1c40f44",
          }}
        >
          ♠ HOLLAND CASINO BLACKJACK ♦
        </div>
        <div style={{ fontSize: 9, letterSpacing: 2.5, color: "#2a5a3a", marginTop: 1 }}>
          6 DECKS · CSM · S17 · NO SURRENDER · PAIR PURSUIT · QUEENS PURSUIT
        </div>
      </header>

      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          borderBottom: "2px solid #1a3a2a",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            style={{
              padding: "7px 12px",
              borderRadius: "6px 6px 0 0",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: 0.5,
              border: "none",
              cursor: "pointer",
              background: tab === i ? "#0a2018" : "transparent",
              color: tab === i ? "#f1c40f" : "#4a6a5a",
              borderBottom: tab === i ? "2px solid #f1c40f" : "2px solid transparent",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 0 && <GameTab game={game} />}
      {tab === 1 && <StrategyTab builder={builder} activeStrategy={builder.activeStrategy} />}
      {tab === 2 && (
        <StatisticsTab
          statistics={statistics}
          strat={builder.strat}
          buildTT={builder.buildTT}
          activeStrategy={builder.activeStrategy}
        />
      )}
      {tab === 3 && (
        <SimulationTab
          simulation={simulation}
          strat={builder.strat}
          activeStrategy={builder.activeStrategy}
        />
      )}
    </div>
  );
}
