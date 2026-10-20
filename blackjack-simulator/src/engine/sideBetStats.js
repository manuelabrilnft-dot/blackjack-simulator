// Exact-ish side bet probabilities by Monte Carlo over a 6-deck shoe.
//
// The closed-form probabilities are tractable for Pair Pursuit but awkward for
// Queens Pursuit, which depends on the dealer upcard as well as the player's
// two cards. Sampling keeps both on the same footing.
//
// Jackpot values are approximated at their reset levels. A live meter sits
// above these, so the Queens Pursuit EV reported here is a floor, not a fixed
// number.

import { mkDeck } from "./cards.js";
import { evalPair, evalQueens } from "./sideBets.js";

const JACKPOT_MINOR = 500;
const JACKPOT_MAJOR = 5000;
const JACKPOT_MEGA = 25000;
const QUEENS_COST = 2.5;

export function calcSideBetStats(N = 200000) {
  let pairs = 0;
  let perfect = 0;
  let coloured = 0;
  let mixed = 0;
  let queenD = 0;
  let qPairAny = 0;
  let qPairSuited = 0;
  let qPairDD = 0;
  let q3Any = 0;
  let q3Color = 0;
  let q3Suited = 0;
  let q3DD = 0;

  for (let i = 0; i < N; i++) {
    const deck = mkDeck();
    const c1 = deck[0];
    const c2 = deck[1];
    const dUp = deck[2];

    const pp = evalPair(c1, c2);
    if (pp) {
      pairs++;
      if (pp.pay === 25) perfect++;
      else if (pp.pay === 12) coloured++;
      else mixed++;
    }

    const qp = evalQueens(c1, c2, dUp);
    if (qp) {
      if (qp.pay === 8) queenD++;
      else if (qp.pay === 20) qPairAny++;
      else if (qp.pay === 40) qPairSuited++;
      else if (qp.pay === 80) qPairDD++;
      else if (qp.pay === 100) q3Any++;
      else if (qp.pay === "MINOR") q3Color++;
      else if (qp.pay === "MAJOR") q3Suited++;
      else if (qp.pay === "MEGA") q3DD++;
    }
  }

  // Pair Pursuit EV per €1 staked.
  const pairEV = (perfect * 25 + coloured * 12 + mixed * 6 - (N - pairs) * 1) / N;

  // Queens Pursuit EV per €2.50 staked, fixed payouts only.
  const qLosses =
    N - queenD - qPairAny - qPairSuited - qPairDD - q3Any - q3Color - q3Suited - q3DD;
  const qEV =
    (queenD * 8 * QUEENS_COST +
      qPairAny * 20 * QUEENS_COST +
      qPairSuited * 40 * QUEENS_COST +
      qPairDD * 80 * QUEENS_COST +
      q3Any * 100 * QUEENS_COST -
      qLosses * QUEENS_COST) /
    N;

  // Jackpot contribution at reset values.
  const qJackpotApprox =
    (q3Color * JACKPOT_MINOR + q3Suited * JACKPOT_MAJOR + q3DD * JACKPOT_MEGA) / N;

  return {
    N,
    pairEV,
    qEV: qEV + qJackpotApprox,
    pct: {
      pairs: pairs / N,
      perfect: perfect / N,
      coloured: coloured / N,
      mixed: mixed / N,
      queenD: queenD / N,
      qPairAny: qPairAny / N,
      qPairSuited: qPairSuited / N,
      qPairDD: qPairDD / N,
      q3Any: q3Any / N,
      q3Color: q3Color / N,
      q3Suited: q3Suited / N,
      q3DD: q3DD / N,
    },
  };
}
