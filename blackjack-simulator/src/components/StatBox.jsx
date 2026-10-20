/** A labelled figure used across the statistics and simulation tabs. */
export default function StatBox({ label, value, sub, color = "#f1c40f" }) {
  return (
    <div
      style={{
        background: "#040d08",
        borderRadius: 8,
        padding: "10px 8px",
        textAlign: "center",
        border: "1px solid #1a3a2a",
        flex: 1,
        minWidth: 80,
      }}
    >
      <div style={{ fontSize: 9, color: "#3a6a4a", letterSpacing: 0.8, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 900, color }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: "#3a5a4a", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
