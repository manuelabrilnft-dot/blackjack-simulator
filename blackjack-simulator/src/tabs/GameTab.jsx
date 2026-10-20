import Card from "../components/Card.jsx";
import Chip from "../components/Chip.jsx";
import { cVal, hTot, isSoft } from "../engine/cards.js";
import { AC, RC, PHASE, TABLE_OPTIONS } from "../theme.js";

const CHIP_VALUES = [1, 2, 5, 10, 20, 25, 50, 100];

/** The live table: betting, dealing and playing a round. */
export default function GameTab({ game }) {
  const {
    tt,
    selectTable,
    phase,
    mainBet,
    setMainBet,
    pairBet,
    useQ,
    setUseQ,
    chipSel,
    setChipSel,
    hands,
    hIdx,
    dealer,
    pairRes,
    queensRes,
    msg,
    stats,
    cfg,
    cur,
    canSpl,
    canDbl,
    bsHint,
    addPair,
    clearBets,
    deal,
    hit,
    stand,
    dbl,
    spl,
    newRound,
  } = game;

  const summary = [
    ["Hands", stats.n],
    ["W/L/P", `${stats.w}/${stats.l}/${stats.p}`],
    ["BJs", stats.bj],
    ["Win%", stats.n ? `${((stats.w / stats.n) * 100).toFixed(1)}%` : "—"],
    ["P/L", `€${stats.profit.toFixed(0)}`],
  ];

  const actions = [
    ["H", "HIT", hit, true],
    ["S", "STAND", stand, true],
    ["D", "DOUBLE", dbl, canDbl],
    ["SP", "SPLIT", spl, canSpl],
  ];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "10px 10px 0" }}>
      {/* Table selector */}
      <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 8 }}>
        {TABLE_OPTIONS.map(([v, l]) => (
          <button
            key={v}
            disabled={phase !== PHASE.BET}
            onClick={() => selectTable(v)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: `2px solid ${tt === v ? "#f1c40f" : "#1a3a2a"}`,
              background: tt === v ? "#f1c40f18" : "transparent",
              color: tt === v ? "#f1c40f" : "#4a6a5a",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Running totals */}
      <div
        style={{
          display: "flex",
          gap: 5,
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        {summary.map(([l, v]) => (
          <div
            key={l}
            style={{
              background: "#071510",
              border: "1px solid #1a3a2a",
              borderRadius: 6,
              padding: "3px 8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 9, color: "#3a6a4a", letterSpacing: 0.8 }}>{l}</div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: l === "P/L" ? (stats.profit >= 0 ? "#27ae60" : "#c0392b") : "#f1c40f",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* Dealer */}
      <div
        style={{
          background: "#071510",
          borderRadius: 9,
          padding: "9px 10px",
          marginBottom: 7,
          border: "1px solid #1a3a2a",
          minHeight: 82,
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#2a5a3a", marginBottom: 5 }}>
          DEALER
          {dealer.length > 0 && phase !== PHASE.PLAY
            ? ` · ${hTot(dealer)}`
            : dealer.length > 0
            ? ` · ${cVal(dealer[0].rank)}+?`
            : ""}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {dealer.map((c, i) => (
            <Card key={i} card={c} hidden={i > 0 && phase === PHASE.PLAY} />
          ))}
          {dealer.length === 0 && (
            <div style={{ color: "#1a3a2a", fontSize: 11, paddingTop: 14 }}>Waiting for deal…</div>
          )}
        </div>
      </div>

      {/* Player hands */}
      {hands.length > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 7 }}>
          {hands.map((h, i) => {
            const total = hTot(h.cards);
            const active = i === hIdx && phase === PHASE.PLAY;
            const soft = isSoft(h.cards) && total <= 21;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  minWidth: 110,
                  background: "#071510",
                  borderRadius: 8,
                  padding: 8,
                  border: `2px solid ${active ? "#f1c40f" : h.result ? RC[h.result] : "#1a3a2a"}`,
                  boxShadow: active ? "0 0 14px #f1c40f44" : "none",
                  transition: "border 0.2s",
                }}
              >
                <div style={{ fontSize: 8, color: "#2a5a3a", marginBottom: 3 }}>
                  HAND {i + 1} · €{h.bet}
                  {h.doubled ? " 2×" : ""}
                  {h.fromSplit ? " ✂" : ""}
                </div>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 3 }}>
                  {h.cards.map((c, ci) => (
                    <Card key={ci} card={c} small />
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: h.result ? RC[h.result] : total > 21 ? "#c0392b" : "#e8e0d0",
                  }}
                >
                  {total > 21 ? "BUST" : `${total}${soft ? " soft" : ""}`}
                </div>
                {active && bsHint && (
                  <div style={{ fontSize: 9, color: AC[bsHint] || "#aaa", marginTop: 1 }}>
                    Hint: <b>{bsHint}</b>
                  </div>
                )}
                {h.result && (
                  <div
                    style={{ fontSize: 9, fontWeight: 700, color: RC[h.result], marginTop: 2 }}
                  >
                    {h.result.toUpperCase()}{" "}
                    {h.profit > 0
                      ? `+€${h.profit.toFixed(2)}`
                      : h.profit < 0
                      ? `-€${Math.abs(h.profit).toFixed(2)}`
                      : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Side bet outcomes */}
      {pairRes && (
        <div
          style={{
            textAlign: "center",
            marginBottom: 4,
            padding: "4px 8px",
            borderRadius: 6,
            background: pairRes.pay > 0 ? "#f1c40f12" : "#c0392b12",
            border: `1px solid ${pairRes.color}`,
          }}
        >
          <span style={{ fontWeight: 700, color: pairRes.color, fontSize: 11 }}>
            Pair: {pairRes.label}{" "}
            {pairRes.pay > 0 ? `→ +€${pairBet * pairRes.pay}` : `→ -€${pairBet}`}
          </span>
        </div>
      )}
      {queensRes && (
        <div
          style={{
            textAlign: "center",
            marginBottom: 4,
            padding: "4px 8px",
            borderRadius: 6,
            background: queensRes.pay > 0 ? "#00d4ff12" : "#c0392b12",
            border: `1px solid ${queensRes.color}`,
          }}
        >
          <span style={{ fontWeight: 700, color: queensRes.color, fontSize: 11 }}>
            Queens: {queensRes.label}{" "}
            {typeof queensRes.pay === "number" && queensRes.pay > 0
              ? `→ +€${(cfg.qCost * queensRes.pay).toFixed(2)}`
              : queensRes.pay === "MEGA" || queensRes.pay === "MAJOR" || queensRes.pay === "MINOR"
              ? "→ 🎰 JACKPOT!"
              : `→ -€${cfg.qCost}`}
          </span>
        </div>
      )}
      {msg && (
        <div
          style={{
            textAlign: "center",
            fontSize: 17,
            fontWeight: 900,
            marginBottom: 7,
            color:
              msg.includes("+") || msg.includes("🎉")
                ? "#27ae60"
                : msg.includes("-")
                ? "#c0392b"
                : "#f1c40f",
          }}
        >
          {msg}
        </div>
      )}

      {/* Betting */}
      {phase === PHASE.BET && (
        <div>
          <div
            style={{
              display: "flex",
              gap: 5,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 7,
            }}
          >
            {CHIP_VALUES.map((v) => (
              <Chip key={v} val={v} onClick={() => setChipSel(v)} sel={chipSel === v} />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: 7,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 7,
              alignItems: "flex-end",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 8, color: "#4a6a5a", marginBottom: 2 }}>MAIN BET</div>
              <button
                onClick={() => setMainBet((b) => b + chipSel)}
                style={{
                  padding: "6px 13px",
                  borderRadius: 7,
                  background: "#f1c40f",
                  color: "#111",
                  fontWeight: 900,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                +€{chipSel} → <b>€{mainBet}</b>
              </button>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 8, color: "#4a6a5a", marginBottom: 2 }}>
                PAIR PURSUIT{" "}
                <span style={{ color: "#3a5a4a" }}>
                  min €{cfg.pairMin} +€{cfg.pairStep}
                </span>
              </div>
              <button
                onClick={addPair}
                style={{
                  padding: "6px 13px",
                  borderRadius: 7,
                  background: "#7d3c98",
                  color: "#fff",
                  fontWeight: 900,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                +€{pairBet === 0 ? cfg.pairMin : cfg.pairStep} → <b>€{pairBet}</b>
              </button>
            </div>
            {cfg.hasQ && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 8, color: "#4a6a5a", marginBottom: 2 }}>
                  QUEENS PURSUIT <span style={{ color: "#3a5a4a" }}>€{cfg.qCost} fixed</span>
                </div>
                <button
                  onClick={() => setUseQ((q) => !q)}
                  style={{
                    padding: "6px 13px",
                    borderRadius: 7,
                    background: useQ ? "#0087a8" : "#0d2a35",
                    color: useQ ? "#fff" : "#2a6a7a",
                    fontWeight: 900,
                    border: `1px solid ${useQ ? "#0087a8" : "#0d4a5a"}`,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  {useQ ? "✓ ON €2.50" : "+ ON €2.50"}
                </button>
              </div>
            )}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 8, color: "transparent", marginBottom: 2 }}>.</div>
              <button
                onClick={clearBets}
                style={{
                  padding: "6px 10px",
                  borderRadius: 7,
                  background: "#111",
                  color: "#c0392b",
                  fontWeight: 700,
                  border: "1px solid #c0392b",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={deal}
              style={{
                padding: "11px 44px",
                borderRadius: 9,
                background: "linear-gradient(135deg,#f1c40f,#b7950b)",
                color: "#111",
                fontWeight: 900,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                letterSpacing: 2,
                boxShadow: "0 4px 20px #f1c40f44",
              }}
            >
              DEAL
            </button>
          </div>
        </div>
      )}

      {/* Playing */}
      {phase === PHASE.PLAY && cur && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          {actions.map(([k, l, fn, enabled]) => (
            <button
              key={k}
              onClick={fn}
              disabled={!enabled}
              style={{
                padding: "11px 20px",
                borderRadius: 8,
                fontWeight: 900,
                fontSize: 12,
                letterSpacing: 1,
                border: "none",
                cursor: enabled ? "pointer" : "not-allowed",
                background: enabled ? AC[k] : "#0d1f18",
                color: enabled ? "#fff" : "#2a4a3a",
                opacity: enabled ? 1 : 0.35,
                transition: "all 0.15s",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Round over */}
      {phase === PHASE.DONE && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={newRound}
            style={{
              padding: "11px 44px",
              borderRadius: 9,
              background: "linear-gradient(135deg,#1e8449,#145a32)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              letterSpacing: 2,
              boxShadow: "0 4px 20px #27ae6044",
            }}
          >
            NEW ROUND
          </button>
        </div>
      )}
    </div>
  );
}
