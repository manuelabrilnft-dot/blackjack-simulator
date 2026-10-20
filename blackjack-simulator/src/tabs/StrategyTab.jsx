import StratGrid, {
  HARD_ROWS,
  SOFT_ROWS,
  PAIR_ROWS,
  hardLabel,
  softLabel,
  pairLabel,
} from "../components/StratGrid.jsx";
import { ACTION_LEGEND, TABLE_OPTIONS } from "../theme.js";

const panel = {
  background: "#071510",
  borderRadius: 11,
  padding: 13,
  border: "1px solid #1a3a2a",
  overflowX: "auto",
};

/** Builds a Monte Carlo strategy table and displays the result. */
export default function StrategyTab({ builder, activeStrategy }) {
  const { strat, buildStatus, buildPct, buildTT, setBuildTT, buildStrat } = builder;
  const building = buildStatus === "building";

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "12px 10px 0" }}>
      <div style={{ ...panel, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: "#f1c40f", fontSize: 13, marginBottom: 5 }}>
          🤖 MONTE CARLO STRATEGY BUILDER
        </div>
        <div style={{ fontSize: 10, color: "#4a6a5a", lineHeight: 1.6, marginBottom: 10 }}>
          Computes expected value for every action across all states using 500 Monte Carlo samples
          per cell. Doubles require +0.02 EV margin to filter noise. Splits require +0.01 margin.
          Takes roughly 45 to 60 seconds.
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 10,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div style={{ fontSize: 9, color: "#5a7a6a", marginBottom: 4 }}>OPTIMISE FOR</div>
            <div style={{ display: "flex", gap: 4 }}>
              {TABLE_OPTIONS.map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setBuildTT(v)}
                  style={{
                    padding: "5px 9px",
                    borderRadius: 5,
                    fontSize: 10,
                    fontWeight: 700,
                    border: `2px solid ${buildTT === v ? "#f1c40f" : "#1a3a2a"}`,
                    background: buildTT === v ? "#f1c40f18" : "transparent",
                    color: buildTT === v ? "#f1c40f" : "#4a6a5a",
                    cursor: "pointer",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={buildStrat}
            disabled={building}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              background: building ? "#1a3a2a" : "linear-gradient(135deg,#f1c40f,#b7950b)",
              color: building ? "#3a6a4a" : "#111",
              fontWeight: 900,
              fontSize: 12,
              border: "none",
              cursor: building ? "wait" : "pointer",
              letterSpacing: 1,
            }}
          >
            {building
              ? `⏳ Computing… ${buildPct}%`
              : buildStatus === "done"
              ? "✅ Rebuild"
              : "▶ BUILD STRATEGY"}
          </button>
        </div>
        {building && (
          <div style={{ height: 4, background: "#1a3a2a", borderRadius: 2 }}>
            <div
              style={{
                height: "100%",
                width: `${buildPct}%`,
                background: "linear-gradient(90deg,#f1c40f,#27ae60)",
                borderRadius: 2,
                transition: "width 0.3s",
              }}
            />
          </div>
        )}
        {buildStatus === "done" && (
          <div style={{ fontSize: 9, color: "#27ae60", marginTop: 5 }}>
            ✅ Built for {buildTT === "10" ? "6:5" : "3:2"} BJ · 6 decks · S17 · No surrender
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          fontSize: 10,
          color: "#4a6a5a",
          marginBottom: 8,
          padding: "0 2px",
        }}
      >
        {ACTION_LEGEND.map(([a, l, c]) => (
          <span key={a}>
            <b style={{ color: c }}>{a}</b> = {l}
          </span>
        ))}
      </div>

      <div style={{ ...panel, marginBottom: 10 }}>
        <StratGrid
          title="HARD TOTALS"
          rows={HARD_ROWS}
          rowLbl={hardLabel}
          getData={(r, d) => activeStrategy.hard?.[r]?.[d] || ""}
        />
      </div>
      <div style={{ ...panel, marginBottom: 10 }}>
        <StratGrid
          title="SOFT TOTALS (Ace + x)"
          rows={SOFT_ROWS}
          rowLbl={softLabel}
          getData={(r, d) => activeStrategy.soft?.[r]?.[d] || ""}
        />
      </div>
      <div style={panel}>
        <StratGrid
          title="PAIRS"
          rows={PAIR_ROWS}
          rowLbl={pairLabel}
          getData={(r, d) => activeStrategy.pairs?.[r]?.[d] || ""}
        />
      </div>

      {!strat && (
        <div style={{ fontSize: 10, color: "#3a5a4a", textAlign: "center", marginTop: 8 }}>
          Showing reference strategy. Build above for the Monte Carlo version.
        </div>
      )}
    </div>
  );
}
