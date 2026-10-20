import StatBox from "../components/StatBox.jsx";
import StratGrid, {
  HARD_ROWS,
  SOFT_ROWS,
  PAIR_ROWS,
  hardLabel,
  softLabel,
  pairLabel,
} from "../components/StratGrid.jsx";
import { CFG } from "../engine/tables.js";
import { ACTION_LEGEND } from "../theme.js";

const panel = {
  background: "#071510",
  borderRadius: 11,
  padding: 13,
  marginBottom: 12,
  border: "1px solid #1a3a2a",
};

const STRATEGY_NOTES = [
  ["Always split", "Aces (1 card each, re-split if another ace) and 8s vs all dealer cards", "#8e44ad"],
  ["Never split", "5s (treat as hard 10 — double instead) · 10s and face cards", "#c0392b"],
  ["Always double", "Hard 11 vs 2–10 · Hard 10 vs 2–9 · Hard 9 vs 3–6", "#e67e22"],
  ["Tricky spots", "Hard 12: Stand vs 4–6, Hit vs 2–3 · Hard 16: Hit vs 7+ · Soft 18: Hit vs 9/10/A", "#aaa"],
];

/** Return to player for one scenario, counting side bet stakes as wagered. */
function rtpFor(result, rounds, tableType, withPair, withQueens) {
  const { min, pairMin, qCost, hasQ } = CFG[tableType];
  const wagered =
    rounds * min +
    (withPair ? rounds * pairMin : 0) +
    (withQueens && hasQ ? rounds * qCost : 0);
  return (1 + result.profit / wagered) * 100;
}

/** House edge, side bet probabilities and the cost of playing them. */
export default function StatisticsTab({ statistics, strat, buildTT, activeStrategy }) {
  const { statRes, statRunning, statSimRes, runStats, comparisonRounds } = statistics;

  const scenarios = statSimRes
    ? [
        ["Main game only", "No side bets", statSimRes.base, false, false, "#27ae60"],
        ["+ Pair Pursuit", "€5/hand extra", statSimRes.withPair, true, false, "#7d3c98"],
        ["+ Both side bets", "€5 pair + €2.50 queens", statSimRes.withBoth, true, true, "#0087a8"],
      ]
    : [];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "12px 10px 0" }}>
      <div style={panel}>
        <div style={{ fontWeight: 700, color: "#f1c40f", fontSize: 13, marginBottom: 5 }}>
          📊 COMPLETE GAME STATISTICS
        </div>
        <div style={{ fontSize: 10, color: "#4a6a5a", marginBottom: 10, lineHeight: 1.6 }}>
          Runs 150,000 deal simulations to compute probabilities and expected values. Also
          simulates {comparisonRounds.toLocaleString()} rounds per scenario to compare side bet
          impact on your session P/L.
        </div>
        <button
          onClick={() => runStats(activeStrategy)}
          disabled={statRunning}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            background: statRunning ? "#1a3a2a" : "linear-gradient(135deg,#f1c40f,#b7950b)",
            color: statRunning ? "#3a6a4a" : "#111",
            fontWeight: 900,
            fontSize: 12,
            border: "none",
            cursor: statRunning ? "wait" : "pointer",
            letterSpacing: 1,
          }}
        >
          {statRunning ? "⏳ Calculating… (30–60s)" : "▶ CALCULATE STATISTICS"}
        </button>
      </div>

      {/* House edge reference */}
      <div style={panel}>
        <div style={{ fontWeight: 700, color: "#f1c40f", fontSize: 12, marginBottom: 10 }}>
          🏠 HOUSE EDGE — YOUR GAME
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <StatBox
            label="€10 table (6:5 BJ)"
            value="~1.98%"
            sub="6:5 adds +1.39% vs 3:2"
            color="#c0392b"
          />
          <StatBox
            label="€20 table (3:2 BJ)"
            value="~0.55%"
            sub="Optimal basic strategy"
            color="#27ae60"
          />
          <StatBox label="€50 table (3:2 BJ)" value="~0.55%" sub="Same rules as €20" color="#27ae60" />
        </div>
        <div style={{ fontSize: 10, color: "#4a6a5a", lineHeight: 1.8 }}>
          <b style={{ color: "#ddd" }}>Rules that help the player:</b> 3:2 BJ payout (+1.39% vs
          6:5), S17 (+0.22% vs H17), infinite splits, double after split, re-split aces, 7-7-7 bonus
          <br />
          <b style={{ color: "#ddd" }}>Rules that hurt the player:</b> 6 decks (+0.44% vs 1 deck),
          no surrender (+0.07%), CSM (no card counting possible)
          <br />
          <b style={{ color: "#c0392b" }}>
            The €10 table is nearly 4× worse than the €20 table
          </b>{" "}
          purely due to the 6:5 rule.
        </div>
      </div>

      {/* Strategy grids, same source as the Strategy tab */}
      <div style={panel}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <div style={{ fontWeight: 700, color: "#f1c40f", fontSize: 12 }}>
            📐 BASIC STRATEGY —{" "}
            {strat
              ? `MC-computed (${buildTT === "10" ? "6:5" : "3:2"} BJ)`
              : "Reference (6 decks · S17)"}
          </div>
          {strat ? (
            <div
              style={{
                fontSize: 9,
                padding: "3px 8px",
                borderRadius: 5,
                background: "#27ae6018",
                border: "1px solid #27ae6044",
                color: "#27ae60",
              }}
            >
              ✅ Your MC-computed strategy
            </div>
          ) : (
            <div
              style={{
                fontSize: 9,
                padding: "3px 8px",
                borderRadius: 5,
                background: "#e67e2218",
                border: "1px solid #e67e2244",
                color: "#e67e22",
              }}
            >
              Build in Strategy tab for your custom version
            </div>
          )}
        </div>
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, fontSize: 10, color: "#4a6a5a" }}
        >
          {ACTION_LEGEND.map(([a, l, c]) => (
            <span key={a}>
              <b style={{ color: c }}>{a}</b> = {l}
            </span>
          ))}
        </div>
        <div style={{ overflowX: "auto" }}>
          <div
            style={{ fontSize: 10, color: "#5a8a6a", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}
          >
            HARD TOTALS
          </div>
          <StratGrid
            title=""
            rows={HARD_ROWS}
            rowLbl={hardLabel}
            getData={(r, d) => activeStrategy.hard?.[r]?.[d] || ""}
          />
          <div
            style={{
              fontSize: 10,
              color: "#5a8a6a",
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 4,
              marginTop: 10,
            }}
          >
            SOFT TOTALS (Ace + x)
          </div>
          <StratGrid
            title=""
            rows={SOFT_ROWS}
            rowLbl={softLabel}
            getData={(r, d) => activeStrategy.soft?.[r]?.[d] || ""}
          />
          <div
            style={{
              fontSize: 10,
              color: "#5a8a6a",
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 4,
              marginTop: 10,
            }}
          >
            PAIRS
          </div>
          <StratGrid
            title=""
            rows={PAIR_ROWS}
            rowLbl={pairLabel}
            getData={(r, d) => activeStrategy.pairs?.[r]?.[d] || ""}
          />
        </div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
          {STRATEGY_NOTES.map(([label, rule, col]) => (
            <div
              key={label}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                padding: "5px 8px",
                borderRadius: 5,
                background: col + "0d",
                border: `1px solid ${col}22`,
              }}
            >
              <span
                style={{ color: col, fontWeight: 700, fontSize: 9, minWidth: 80, flexShrink: 0 }}
              >
                {label}
              </span>
              <span style={{ color: "#7a6a60", fontSize: 9, lineHeight: 1.5 }}>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {statRes && (
        <>
          {/* Pair Pursuit */}
          <div style={panel}>
            <div style={{ fontWeight: 700, color: "#f1c40f", fontSize: 12, marginBottom: 10 }}>
              ♠♠ PAIR PURSUIT — PROBABILITIES & EV
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <StatBox
                label="Any pair frequency"
                value={`${(statRes.pct.pairs * 100).toFixed(2)}%`}
                sub={`1 in ${Math.round(1 / statRes.pct.pairs)} hands`}
              />
              <StatBox
                label="EV per €1 bet"
                value={`€${statRes.pairEV.toFixed(3)}`}
                sub={statRes.pairEV > 0 ? "Positive!" : "Negative"}
                color={statRes.pairEV > 0 ? "#27ae60" : "#c0392b"}
              />
              <StatBox
                label="House edge"
                value={`${(-statRes.pairEV * 100).toFixed(1)}%`}
                color="#e67e22"
              />
            </div>
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 10 }}
            >
              <thead>
                <tr>
                  {["Outcome", "Frequency", "Payout", "EV per €1 bet"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "4px 6px",
                        color: "#f1c40f",
                        fontSize: 9,
                        letterSpacing: 0.5,
                        textAlign: "left",
                        borderBottom: "1px solid #1a3a2a",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Perfect Pair", statRes.pct.perfect, "25:1", (statRes.pct.perfect * 25).toFixed(4), "#f1c40f"],
                  ["Coloured Pair", statRes.pct.coloured, "12:1", (statRes.pct.coloured * 12).toFixed(4), "#e67e22"],
                  ["Mixed Pair", statRes.pct.mixed, "6:1", (statRes.pct.mixed * 6).toFixed(4), "#27ae60"],
                  ["No pair", 1 - statRes.pct.pairs, "Lose", `-${(1 - statRes.pct.pairs).toFixed(4)}`, "#c0392b"],
                ].map(([n, f, p, ev, c]) => (
                  <tr key={n} style={{ borderBottom: "1px solid #1a3a2a22" }}>
                    <td style={{ padding: "5px 6px", color: c, fontWeight: 700 }}>{n}</td>
                    <td style={{ padding: "5px 6px", color: "#7a9a8a" }}>{(f * 100).toFixed(3)}%</td>
                    <td style={{ padding: "5px 6px", color: c, fontWeight: 700 }}>{p}</td>
                    <td
                      style={{
                        padding: "5px 6px",
                        color: parseFloat(ev) > 0 ? "#27ae60" : "#c0392b",
                        fontWeight: 700,
                      }}
                    >
                      {ev}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 7,
                background: "#c0392b0d",
                border: "1px solid #c0392b33",
                fontSize: 10,
                color: "#a08070",
                lineHeight: 1.6,
              }}
            >
              <b style={{ color: "#e74c3c" }}>Verdict: not worth it long term.</b> A house edge of
              about {(-statRes.pairEV * 100).toFixed(1)}% means that for every €100 staked on Pair
              Pursuit you expect to lose about €{(-statRes.pairEV * 100).toFixed(0)}. On the €20
              table at €5 a hand that is €{(-statRes.pairEV * 5).toFixed(2)} a hand, against a main
              game loss of only €{(0.0055 * 20).toFixed(2)} a hand. The side bet is{" "}
              {Math.round((-statRes.pairEV * 100) / 0.55)}× more expensive per euro than the main
              game.
            </div>
          </div>

          {/* Queens Pursuit */}
          <div style={panel}>
            <div style={{ fontWeight: 700, color: "#00d4ff", fontSize: 12, marginBottom: 10 }}>
              👸 QUEENS PURSUIT — PROBABILITIES & EV
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <StatBox
                label="Queen ♦ frequency"
                value={`${(statRes.pct.queenD * 100).toFixed(2)}%`}
                sub="8:1 payout"
                color="#00d4ff"
              />
              <StatBox
                label="EV per €2.50 bet"
                value={`€${statRes.qEV.toFixed(3)}`}
                sub="incl. jackpots at reset"
                color={statRes.qEV > -2.5 ? "#e67e22" : "#c0392b"}
              />
              <StatBox
                label="Est. house edge"
                value={`${((-statRes.qEV / 2.5) * 100).toFixed(1)}%`}
                color="#e67e22"
              />
            </div>
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, marginBottom: 10 }}
            >
              <thead>
                <tr>
                  {["Outcome", "Frequency", "Payout", "EV (on €2.50)"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "4px 5px",
                        color: "#00d4ff",
                        fontSize: 9,
                        textAlign: "left",
                        borderBottom: "1px solid #1a3a2a",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const p = statRes.pct;
                  const noWin =
                    1 -
                    p.queenD -
                    p.qPairAny -
                    p.qPairSuited -
                    p.qPairDD -
                    p.q3Any -
                    p.q3Color -
                    p.q3Suited -
                    p.q3DD;
                  return [
                    ["3 Queens ♦♦♦", p.q3DD, "MEGA (≥€25k)", `+€${(p.q3DD * 25000).toFixed(4)}`, "#00d4ff"],
                    ["3 Queens suited", p.q3Suited, "MAJOR (≥€5k)", `+€${(p.q3Suited * 5000).toFixed(4)}`, "#c39bd3"],
                    ["3 Queens same color", p.q3Color, "MINOR (≥€500)", `+€${(p.q3Color * 500).toFixed(4)}`, "#f39c12"],
                    ["3 Queens any", p.q3Any, "100:1", `+€${(p.q3Any * 100 * 2.5).toFixed(4)}`, "#e74c3c"],
                    ["Pair Queens ♦♦", p.qPairDD, "80:1", `+€${(p.qPairDD * 80 * 2.5).toFixed(4)}`, "#00d4ff"],
                    ["Pair Queens suited", p.qPairSuited, "40:1", `+€${(p.qPairSuited * 40 * 2.5).toFixed(4)}`, "#c39bd3"],
                    ["Pair Queens any", p.qPairAny, "20:1", `+€${(p.qPairAny * 20 * 2.5).toFixed(4)}`, "#f39c12"],
                    ["One Queen ♦", p.queenD, "8:1", `+€${(p.queenD * 8 * 2.5).toFixed(4)}`, "#00d4ff"],
                    ["No win", noWin, "Lose", `-€${(noWin * 2.5).toFixed(4)}`, "#c0392b"],
                  ];
                })().map(([n, f, p, ev, c]) => (
                  <tr key={n} style={{ borderBottom: "1px solid #1a3a2a22" }}>
                    <td style={{ padding: "4px 5px", color: c, fontWeight: 700, fontSize: 9 }}>{n}</td>
                    <td style={{ padding: "4px 5px", color: "#5a7a6a", fontSize: 9 }}>
                      {(f * 100).toFixed(4)}%
                    </td>
                    <td style={{ padding: "4px 5px", color: c, fontWeight: 700, fontSize: 9 }}>{p}</td>
                    <td
                      style={{
                        padding: "4px 5px",
                        color: ev.startsWith("+") ? "#27ae60" : "#c0392b",
                        fontWeight: 700,
                        fontSize: 9,
                      }}
                    >
                      {ev}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 7,
                background: "#e67e220d",
                border: "1px solid #e67e2233",
                fontSize: 10,
                color: "#a08070",
                lineHeight: 1.6,
              }}
            >
              <b style={{ color: "#e67e22" }}>Verdict: the jackpot is the only reason to play it.</b>{" "}
              At reset jackpot values (€25k/€5k/€500) the house edge is about{" "}
              {((-statRes.qEV / 2.5) * 100).toFixed(0)}%. Unlike Pair Pursuit the fixed €2.50 cost
              is low and the jackpot grows over time. When the Mega Jackpot sits well above €25,000
              the EV improves a lot.{" "}
              <b style={{ color: "#ddd" }}>
                Strategy: only play Queens Pursuit when the Mega Jackpot meter is high.
              </b>
            </div>
          </div>

          {/* Session comparison */}
          {statSimRes && (
            <div style={panel}>
              <div style={{ fontWeight: 700, color: "#f1c40f", fontSize: 12, marginBottom: 10 }}>
                💶 SESSION COMPARISON — €20 TABLE · {comparisonRounds.toLocaleString()} ROUNDS
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
                {scenarios.map(([label, sub, result, withPair, withQueens, c]) => {
                  const avg = result.profit / comparisonRounds;
                  const rtp = rtpFor(result, comparisonRounds, "20", withPair, withQueens);
                  return (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        minWidth: 120,
                        background: "#040d08",
                        borderRadius: 8,
                        padding: "9px",
                        textAlign: "center",
                        border: `1px solid ${c}33`,
                      }}
                    >
                      <div style={{ fontSize: 9, color: c, fontWeight: 700, marginBottom: 2 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 9, color: "#4a6a5a", marginBottom: 5 }}>{sub}</div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                          color: avg >= 0 ? "#27ae60" : "#c0392b",
                        }}
                      >
                        {avg >= 0 ? "+" : ""}
                        {avg.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 9, color: "#3a5a4a" }}>avg €/round</div>
                      <div style={{ fontSize: 10, color: "#4a6a5a", marginTop: 3 }}>
                        RTP {rtp.toFixed(2)}%
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    padding: "8px 10px",
                    borderRadius: 7,
                    background: "#27ae600d",
                    border: "1px solid #27ae6033",
                    fontSize: 10,
                    color: "#9ab09a",
                    lineHeight: 1.6,
                  }}
                >
                  <b style={{ color: "#27ae60" }}>✅ RECOMMENDATION:</b> Play the €20 or €50 table
                  (3:2 BJ). Skip Pair Pursuit, its house edge is around 20× higher than the main
                  game. Queens Pursuit at €2.50 fixed is a small price for jackpot exposure. Treat
                  it as entertainment money, and mainly when the jackpot is high.
                </div>
                <div
                  style={{
                    padding: "8px 10px",
                    borderRadius: 7,
                    background: "#c0392b0d",
                    border: "1px solid #c0392b33",
                    fontSize: 10,
                    color: "#a08070",
                    lineHeight: 1.6,
                  }}
                >
                  <b style={{ color: "#c0392b" }}>❌ AVOID:</b> The €10 table. The 6:5 rule costs
                  about €3 per blackjack. At roughly 4.8% blackjack frequency that is an extra €0.14
                  a hand, which nearly triples the house edge against the €20 table.
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!statRes && (
        <div
          style={{
            background: "#071510",
            borderRadius: 11,
            padding: 20,
            border: "1px solid #1a3a2a",
            textAlign: "center",
            color: "#2a4a3a",
            fontSize: 12,
          }}
        >
          Click "Calculate Statistics" above to run the full analysis.
        </div>
      )}
    </div>
  );
}
