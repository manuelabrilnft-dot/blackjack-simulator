// Side bet evaluators for Pair Pursuit and Queens Pursuit.

import { RED } from "./cards.js";

/**
 * Pair Pursuit: pays on the player's first two cards.
 * Returns null when the two cards are not a pair.
 */
export function evalPair(c1, c2) {
  if (c1.rank !== c2.rank) return null;
  if (c1.suit === c2.suit) {
    return { label: "Perfect Pair! 🏆", pay: 25, color: "#f1c40f" };
  }
  if (RED.has(c1.suit) === RED.has(c2.suit)) {
    return { label: "Coloured Pair! 🎯", pay: 12, color: "#e67e22" };
  }
  return { label: "Mixed Pair! ✨", pay: 6, color: "#27ae60" };
}

/**
 * Queens Pursuit: uses the player's two cards plus the dealer upcard.
 * A numeric `pay` is a fixed multiplier. "MINOR", "MAJOR" and "MEGA" are
 * progressive jackpots whose value depends on the live meter.
 * Returns null when nothing hits.
 */
export function evalQueens(c1, c2, dUp) {
  const isQ = (r) => r === "Q";
  const isD = (s) => s === "♦";

  if (isQ(c1.rank) && isQ(c2.rank) && isQ(dUp.rank)) {
    if (isD(c1.suit) && isD(c2.suit) && isD(dUp.suit)) {
      return { label: "3 Queens ♦♦♦ — MEGA JACKPOT 💎", pay: "MEGA", color: "#00d4ff" };
    }
    if (c1.suit === c2.suit && c2.suit === dUp.suit) {
      return { label: "3 Queens suited — MAJOR JACKPOT 💜", pay: "MAJOR", color: "#c39bd3" };
    }
    const allRed = RED.has(c1.suit) && RED.has(c2.suit) && RED.has(dUp.suit);
    const allBlack = !RED.has(c1.suit) && !RED.has(c2.suit) && !RED.has(dUp.suit);
    if (allRed || allBlack) {
      return { label: "3 Queens same color — MINOR 🟡", pay: "MINOR", color: "#f39c12" };
    }
    return { label: "3 Queens any — 100:1 🎉", pay: 100, color: "#e74c3c" };
  }

  if (isQ(c1.rank) && isQ(c2.rank)) {
    if (isD(c1.suit) && isD(c2.suit)) {
      return { label: "Pair Queens ♦♦ — 80:1 💎", pay: 80, color: "#00d4ff" };
    }
    if (c1.suit === c2.suit) {
      return { label: "Pair Queens suited — 40:1", pay: 40, color: "#c39bd3" };
    }
    return { label: "Pair Queens any — 20:1", pay: 20, color: "#f39c12" };
  }

  if ((isQ(c1.rank) && isD(c1.suit)) || (isQ(c2.rank) && isD(c2.suit))) {
    return { label: "Queen of Diamonds — 8:1 ♦", pay: 8, color: "#00d4ff" };
  }

  return null;
}
