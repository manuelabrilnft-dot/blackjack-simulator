import StatBox from "../components/StatBox.jsx";
import { CFG } from "../engine/tables.js";
import { TABLE_OPTIONS } from "../theme.js";

const panel = {
  background: "#071510",
  borderRadius: 11,
  padding: 13,
  border: "1px solid #1a3a2a",
};

const smallBtn = (active, color = "#f1c40f") => ({
  padding: "4px 8px",
  borderRadius: 5,
  fontSize: 9,
  fontWeight: 700,
  border: `2px solid ${active ? color : "#1a3a2a"}`,
  background: active ? `${color}18` : "transparent",
  cursor: "pointer",
});

/** Runs many rounds at once and reports P/L, RTP and seat-by-seat results. */
export default function SimulationTab({ simulation, strat, activeStrategy }) {
  const {
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
    positionRounds,
  } = simulation;

  const sliders = [
    ["Hands/round", simHN, setSimHN, 1, 5, 1],
    ["Table position", simPos, setSimPos, 1, 7, 1],
    ["Total players", simPN, setSimPN, 1, 7, 1],
    ["Rounds", simRounds, setSimRounds, 500, 20000, 500],
  ];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "12px 10px 0" }}>
      <div style={{ ...panel, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: "#f1c40f", fontSize: 13, marginBottom: 8 }}>
          🔬 SESSION SIMULATOR
        </div>
        {!strat && (
          <div
            style={{
              fontSize: 10,
              color: "#e67e22",
              marginBottom: 8,
              padding: "5px 8px",
              background: "#e67e2214",
              borderRadius: 5,
              border: "1px solid #e67e2244",
            }}
          >
            ⚠️ Build the strategy in the Strategy tab for best results. Using the reference
            strategy.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 9, color: "#5a7a6a", marginBottom: 4 }}>TABLE TYPE</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {TABLE_OPTIONS.map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setSimTT(v)}
                  style={{
                    ...smallBtn(simTT === v),
                    color: simTT === v ? "#f1c40f" : "#4a6a5a",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9, color: "#5a7a6a", marginBottom: 4 }}>OTHER PLAYERS</div>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                ["Random 12–16", "random", true],
                ["Optimal", "opt", false],
              ].map(([l, k, v]) => (
                <button
                  key={k}
                  onClick={() => setSimOther(v)}
                  style={{
                    ...smallBtn(simOther === v),
                    padding: "4px 7px",
                    color: simOther === v ? "#f1c40f" : "#4a6a5a",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9, color: "#5a7a6a", marginBottom: 3 }}>SIDE BETS</div>
            <div style={{ display: "flex", gap: 5 }}>
              <button
                onClick={() => setSimPair((p) => !p)}
                style={{
                  ...smallBtn(simPair, "#7d3c98"),
                  color: simPair ? "#c39bd3" : "#4a6a5a",
                }}
              >
                Pair {simPair ? "✓" : ""}
              </button>
              {CFG[simTT].hasQ && (
                <button
                  onClick={() => setSimQ((q) => !q)}
                  style={{
                    ...smallBtn(simQ, "#0087a8"),
                    color: simQ ? "#00d4ff" : "#4a6a5a",
                  }}
                >
                  Queens {simQ ? "✓" : ""}
                </button>
              )}
            </div>
          </div>

          {sliders.map(([l, v, set, mn, mx, st]) => (
            <div key={l}>
              <div style={{ fontSize: 9, color: "#5a7a6a", marginBottom: 2 }}>
                {l}: <span style={{ color: "#f1c40f", fontWeight: 700 }}>{v}</span>
              </div>
              <input
                type="range"
                min={mn}
                max={mx}
                step={st}
                value={v}
                onChange={(e) => set(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#f1c40f" }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => runSim(activeStrategy)}
          disabled={simRunning}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            background: simRunning ? "#1a3a2a" : "linear-gradient(135deg,#f1c40f,#b7950b)",
            color: simRunning ? "#3a6a4a" : "#111",
            fontWeight: 900,
            fontSize: 12,
            border: "none",
            cursor: simRunning ? "wait" : "pointer",
            letterSpacing: 1,
          }}
        >
          {simRunning ? "⏳ Simulating…" : `▶ RUN ${simRounds.toLocaleString()} ROUNDS`}
        </button>
      </div>

      {simRes && <SimResults {...{ simRes, simTT, simHN, simPair, simQ, simRounds, simPos, simPN, posData, positionRounds }} />}
    </div>
  );
}

/** Result panels, split out to keep the control panel readable. */
function SimResults({
  simRes,
  simTT,
  simHN,
  simPair,
  simQ,
  simRounds,
  simPos,
  simPN,
  posData,
  positionRounds,
}) {
  const { min: mb, pairMin, qCost, hasQ } = CFG[simTT];
  const wagered =
    simRounds * simHN * mb +
    (simPair ? simRounds * simHN * pairMin : 0) +
    (simQ && hasQ ? simRounds * simHN * qCost : 0);

  const rtp = (1 + simRes.profit / wagered) * 100;
  const avg = simRes.profit / simRounds;
  const tot = simRes.wins + simRes.losses + simRes.pushes;
  const wRate = tot ? ((simRes.wins / tot) * 100).toFixed(1) : "—";

  const notes = [
    simTT === "10"
      ? `⚠️ 6:5 table: you lost about €${(simRes.bjs * (mb * (3 / 2 - 6 / 5))).toFixed(0)} in missed blackjack payouts (${simRes.bjs} blackjacks). Switch to the €20 table.`
      : "✅ 3:2 table: correct choice. Optimal house edge is about 0.55%.",
    `📍 Position ${simPos} of ${simPN}: ${
      simPos === 1
        ? "first to act, no information from others."
        : simPos === simPN
        ? "last seat, saw all player decisions."
        : "mid-table."
    } On a CSM, position differences are variance only.`,
    `📈 RTP ${rtp.toFixed(2)}% against an expected ~99.45%. ${
      Math.abs(rtp - 99.45) < 3 ? "Within normal variance." : "Run more rounds for convergence."
    }`,
  ];

  return (
    <>
      <div style={{ ...panel, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: "#f1c40f", fontSize: 12, marginBottom: 8 }}>
          RESULTS · {simRounds.toLocaleString()} ROUNDS
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <StatBox
            label="Total P/L"
            value={`€${simRes.profit.toFixed(0)}`}
            color={simRes.profit >= 0 ? "#27ae60" : "#c0392b"}
          />
          <StatBox
            label="Avg/round"
            value={`€${avg.toFixed(2)}`}
            color={avg >= 0 ? "#27ae60" : "#c0392b"}
          />
          <StatBox
            label="RTP"
            value={`${rtp.toFixed(2)}%`}
            color={rtp >= 99 ? "#27ae60" : rtp >= 96 ? "#e67e22" : "#c0392b"}
          />
          <StatBox label="Win rate" value={`${wRate}%`} />
          <StatBox
            label="BJ rate"
            value={`${((simRes.bjs / (simRounds * simHN)) * 100).toFixed(2)}%`}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {notes.map((t, i) => (
            <div
              key={i}
              style={{
                fontSize: 10,
                padding: "6px 9px",
                borderRadius: 6,
                background: "#040d08",
                border: "1px solid #1a3a2a",
                color: "#907870",
                lineHeight: 1.5,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {posData && (
        <div style={panel}>
          <div style={{ fontWeight: 700, color: "#f1c40f", fontSize: 12, marginBottom: 8 }}>
            📍 POSITION ANALYSIS ({positionRounds.toLocaleString()} rounds each)
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80, marginBottom: 6 }}>
            {posData.map(({ pos, avg: a }) => {
              const maxAbs = Math.max(...posData.map((p) => Math.abs(p.avg)), 0.01);
              const h = Math.max((Math.abs(a) / maxAbs) * 68, 2);
              const col = a >= 0 ? "#27ae60" : "#c0392b";
              return (
                <div
                  key={pos}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <div style={{ fontSize: 8, color: col, fontWeight: 700 }}>
                    {a >= 0 ? "+" : ""}
                    {a.toFixed(1)}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: h,
                      background: col,
                      borderRadius: "2px 2px 0 0",
                      opacity: pos === simPos ? 1 : 0.4,
                      border: pos === simPos ? "2px solid #f1c40f" : "2px solid transparent",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 9,
                      color: pos === simPos ? "#f1c40f" : "#4a6a5a",
                      fontWeight: pos === simPos ? 700 : 400,
                    }}
                  >
                    P{pos}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 9, color: "#3a5a4a" }}>
            Best seat:{" "}
            <span style={{ color: "#f1c40f", fontWeight: 700 }}>
              P{posData.reduce((b, p) => (p.avg > b.avg ? p : b)).pos}
            </span>{" "}
            · a CSM means there is no structural seat advantage, so differences are noise.
          </div>
        </div>
      )}
    </>
  );
}
