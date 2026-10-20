// Shared colours and small constants for the interface.

/** Action colours: hit, stand, double, split. */
export const AC = { H: "#27ae60", S: "#2471a3", D: "#e67e22", SP: "#8e44ad" };

/** The same colours at low opacity, for strategy grid cell backgrounds. */
export const AB = { H: "#27ae6028", S: "#2471a328", D: "#e67e2228", SP: "#8e44ad28" };

/** Round result colours. */
export const RC = { win: "#27ae60", blackjack: "#f1c40f", lose: "#c0392b", push: "#718093" };

/** Dealer upcards used as grid columns. 11 is an Ace. */
export const DU = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/** Phases of a round at the table. */
export const PHASE = { BET: "BET", PLAY: "PLAY", DONE: "DONE" };

export const TABS = ["🃏 Game", "📐 Strategy", "📊 Statistics", "🔬 Simulation"];

/** The three table variants, as [value, label] for the selector buttons. */
export const TABLE_OPTIONS = [
  ["10", "€10 · 6:5"],
  ["20", "€20 · 3:2"],
  ["50", "€50 · 3:2"],
];

/** Legend entries for the strategy grids. */
export const ACTION_LEGEND = [
  ["H", "Hit", "#27ae60"],
  ["S", "Stand", "#2471a3"],
  ["D", "Double", "#e67e22"],
  ["SP", "Split", "#8e44ad"],
];
