// Published basic strategy for 6 decks, dealer stands on soft 17, no surrender.
//
// These tables are the mathematically derived reference, not a Monte Carlo
// result. They are the fallback whenever the user has not built a table in the
// Strategy tab, and the baseline the computed tables are compared against.
//
// Rows are player totals, columns are the dealer upcard (11 = Ace).
// H = hit, S = stand, D = double, SP = split.

export const REF_HARD = {
  5: { 2: "H", 3: "H", 4: "H", 5: "H", 6: "H", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  6: { 2: "H", 3: "H", 4: "H", 5: "H", 6: "H", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  7: { 2: "H", 3: "H", 4: "H", 5: "H", 6: "H", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  8: { 2: "H", 3: "H", 4: "H", 5: "H", 6: "H", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  9: { 2: "H", 3: "D", 4: "D", 5: "D", 6: "D", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  10: { 2: "D", 3: "D", 4: "D", 5: "D", 6: "D", 7: "D", 8: "D", 9: "D", 10: "H", 11: "H" },
  11: { 2: "D", 3: "D", 4: "D", 5: "D", 6: "D", 7: "D", 8: "D", 9: "D", 10: "D", 11: "H" },
  12: { 2: "H", 3: "H", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  13: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  14: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  15: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  16: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  17: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
  18: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
  19: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
  20: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
};

export const REF_SOFT = {
  13: { 2: "H", 3: "H", 4: "H", 5: "D", 6: "D", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  14: { 2: "H", 3: "H", 4: "H", 5: "D", 6: "D", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  15: { 2: "H", 3: "H", 4: "D", 5: "D", 6: "D", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  16: { 2: "H", 3: "H", 4: "D", 5: "D", 6: "D", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  17: { 2: "H", 3: "D", 4: "D", 5: "D", 6: "D", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  18: { 2: "S", 3: "D", 4: "D", 5: "D", 6: "D", 7: "S", 8: "S", 9: "H", 10: "H", 11: "H" },
  19: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
  20: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
};

export const REF_PAIRS = {
  2: { 2: "SP", 3: "SP", 4: "SP", 5: "SP", 6: "SP", 7: "SP", 8: "H", 9: "H", 10: "H", 11: "H" },
  3: { 2: "SP", 3: "SP", 4: "SP", 5: "SP", 6: "SP", 7: "SP", 8: "H", 9: "H", 10: "H", 11: "H" },
  4: { 2: "H", 3: "H", 4: "H", 5: "SP", 6: "SP", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  5: { 2: "D", 3: "D", 4: "D", 5: "D", 6: "D", 7: "D", 8: "D", 9: "D", 10: "H", 11: "H" },
  6: { 2: "SP", 3: "SP", 4: "SP", 5: "SP", 6: "SP", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  7: { 2: "SP", 3: "SP", 4: "SP", 5: "SP", 6: "SP", 7: "SP", 8: "H", 9: "H", 10: "H", 11: "H" },
  8: { 2: "SP", 3: "SP", 4: "SP", 5: "SP", 6: "SP", 7: "SP", 8: "SP", 9: "SP", 10: "SP", 11: "SP" },
  9: { 2: "SP", 3: "SP", 4: "SP", 5: "SP", 6: "SP", 7: "S", 8: "SP", 9: "SP", 10: "S", 11: "S" },
  10: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
  11: { 2: "SP", 3: "SP", 4: "SP", 5: "SP", 6: "SP", 7: "SP", 8: "SP", 9: "SP", 10: "SP", 11: "SP" },
};

/** The table used whenever no Monte Carlo strategy has been built. */
export const REFERENCE_STRATEGY = { hard: REF_HARD, soft: REF_SOFT, pairs: REF_PAIRS };
