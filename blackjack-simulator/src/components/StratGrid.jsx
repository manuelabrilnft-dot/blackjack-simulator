import { AC, AB, DU } from "../theme.js";

/** One action cell, coloured by the action it holds. */
function Cell({ v }) {
  const c = AC[v] || "#3a5a4a";
  const bg = AB[v] || "transparent";
  return (
    <td
      style={{
        padding: "2px 3px",
        textAlign: "center",
        background: bg,
        border: `1px solid ${c}33`,
        color: c,
        fontWeight: 700,
        borderRadius: 2,
        fontSize: 10,
        minWidth: 22,
      }}
    >
      {v || ""}
    </td>
  );
}

/**
 * A strategy table: player states down the side, dealer upcards across the top.
 *
 * rows     the player states to show
 * rowLbl   turns a row key into its label
 * getData  returns the action for a (row, dealer upcard) pair
 */
export default function StratGrid({ title, rows, rowLbl, getData }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      {title && (
        <div
          style={{
            fontSize: 10,
            color: "#f1c40f",
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 5,
          }}
        >
          {title}
        </div>
      )}
      <table style={{ borderCollapse: "collapse", fontSize: 10 }}>
        <thead>
          <tr>
            <th
              style={{
                padding: "2px 7px",
                color: "#3a6a4a",
                textAlign: "left",
                minWidth: 42,
                fontSize: 10,
              }}
            >
              vs →
            </th>
            {DU.map((d) => (
              <th
                key={d}
                style={{
                  padding: "2px 5px",
                  textAlign: "center",
                  color: "#f1c40f",
                  minWidth: 22,
                  fontSize: 10,
                }}
              >
                {d === 11 ? "A" : d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((rk) => (
            <tr key={rk}>
              <td
                style={{
                  padding: "2px 7px",
                  fontWeight: 700,
                  color: "#bbb",
                  fontSize: 10,
                  whiteSpace: "nowrap",
                }}
              >
                {rowLbl(rk)}
              </td>
              {DU.map((d) => (
                <Cell key={d} v={getData(rk, d)} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Row sets shared by the Strategy and Statistics tabs. */
export const HARD_ROWS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
export const SOFT_ROWS = [13, 14, 15, 16, 17, 18, 19, 20];
export const PAIR_ROWS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const hardLabel = (r) => String(r);
export const softLabel = (r) => `A,${r - 11}`;
export const pairLabel = (r) => (r === 11 ? "A,A" : r === 10 ? "10,10" : `${r},${r}`);
