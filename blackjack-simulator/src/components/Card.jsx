import { RED } from "../engine/cards.js";

/** One playing card. Renders a patterned back when hidden or absent. */
export default function Card({ card, hidden, small }) {
  const w = small ? 42 : 60;
  const h = small ? 60 : 84;
  const fs = small ? 10 : 13;

  if (!card || hidden) {
    return (
      <div
        style={{
          width: w,
          height: h,
          borderRadius: 6,
          border: "2px solid #2a4a6a",
          background:
            "repeating-linear-gradient(45deg,#0d2a4a 0,#0d2a4a 4px,#0a1f38 4px,#0a1f38 8px)",
          flexShrink: 0,
        }}
      />
    );
  }

  const red = RED.has(card.suit);
  const corner = (
    <>
      {card.rank}
      <br />
      <span style={{ fontSize: fs - 1 }}>{card.suit}</span>
    </>
  );

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        border: "1px solid #ddd",
        background: "linear-gradient(145deg,#fff,#f0f0f0)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3px 4px",
        boxShadow: "2px 3px 8px #0005",
        flexShrink: 0,
        color: red ? "#c0392b" : "#1a1a2e",
      }}
    >
      <div style={{ fontSize: fs, fontWeight: 900, lineHeight: 1.1 }}>{corner}</div>
      <div style={{ fontSize: fs + 4, textAlign: "center", opacity: 0.65 }}>{card.suit}</div>
      <div
        style={{
          fontSize: fs,
          fontWeight: 900,
          lineHeight: 1.1,
          transform: "rotate(180deg)",
          alignSelf: "flex-end",
        }}
      >
        {corner}
      </div>
    </div>
  );
}
