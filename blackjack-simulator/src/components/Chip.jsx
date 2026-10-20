const CHIP_COLORS = {
  1: ["#c0392b", "#922b21"],
  2: ["#c0392b", "#922b21"],
  5: ["#c0392b", "#922b21"],
  10: ["#2471a3", "#1a5276"],
  20: ["#1e8449", "#145a32"],
  25: ["#1e8449", "#145a32"],
  50: ["#7d3c98", "#5b2c6f"],
  100: ["#b7950b", "#9a7d0a"],
};

/** A selectable betting chip. */
export default function Chip({ val, onClick, sel }) {
  const [bg, bd] = CHIP_COLORS[val] || ["#555", "#333"];
  return (
    <button
      onClick={onClick}
      style={{
        width: 46,
        height: 46,
        borderRadius: "50%",
        border: `3px dashed ${bd}`,
        background: `radial-gradient(circle at 38% 35%,${bg},${bd})`,
        color: "#fff",
        fontWeight: 900,
        fontSize: val >= 100 ? 9 : 11,
        cursor: "pointer",
        outline: sel ? "3px solid #f1c40f" : "none",
        outlineOffset: 2,
        boxShadow: sel ? "0 0 12px #f1c40faa" : "0 2px 6px #0004",
        transform: sel ? "scale(1.1)" : "scale(1)",
        transition: "all 0.15s",
      }}
    >
      €{val}
    </button>
  );
}
