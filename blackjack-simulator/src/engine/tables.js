// Table configuration.
//
// min      minimum main bet
// bjP      blackjack payout multiplier (3:2 or 6:5)
// pairMin  minimum Pair Pursuit side bet
// pairStep increment for the Pair Pursuit side bet
// hasQ     whether the table offers Queens Pursuit
// qCost    fixed Queens Pursuit cost per hand
//
// Queens Pursuit costs a fixed €2.50 per hand and runs only on the €20 and €50 tables.

export const CFG = {
  "10": { min: 10, bjP: 6 / 5, pairMin: 2, pairStep: 2, hasQ: false, qCost: 0 },
  "20": { min: 20, bjP: 3 / 2, pairMin: 5, pairStep: 5, hasQ: true, qCost: 2.5 },
  "50": { min: 50, bjP: 3 / 2, pairMin: 10, pairStep: 10, hasQ: true, qCost: 2.5 },
};
