// Session simulation: plays many rounds with a given strategy and reports P/L.

import { cVal, hTot, isSoft, mkDeck } from "./cards.js";
import { CFG } from "./tables.js";
import { evalPair, evalQueens } from "./sideBets.js";

/**
 * Looks up the action for a hand in a strategy table.
 * Falls back to hitting whenever the table has no entry, and downgrades a
 * double to a hit when doubling is not allowed.
 */
export function getAction(cards, duRank, strat, canDbl, canSpl) {
  const t = hTot(cards);
  const soft = isSoft(cards);
  const du = duRank === "A" ? 11 : cVal(duRank);

  if (canSpl && cards.length === 2 && strat.pairs) {
    const pv = cVal(cards[0].rank);
    if (strat.pairs[pv]?.[du] === "SP") return "SP";
  }

  let act = "H";
  if (soft && strat.soft) act = strat.soft[t]?.[du] || "H";
  else if (strat.hard) act = strat.hard[Math.min(t, 20)]?.[du] || "H";

  if (act === "D" && !canDbl) act = "H";
  return act;
}

/**
 * Plays `rounds` rounds at one table and returns the aggregate result.
 *
 * pos / playersN model where the player sits, which matters only for which
 * cards they receive. On a continuous shuffling machine there is no structural
 * seat advantage, so differences between seats are variance.
 *
 * NOTE: a split is simplified here. The hand is replaced by one new card
 * rather than played as two hands, so splits are undervalued relative to the
 * live game. See README, known issues.
 */
export function runSession({
  tableType,
  handsN,
  usePair,
  useQueens,
  pos,
  playersN,
  rounds,
  strat,
  otherRandom,
}) {
  const { min: mb, bjP, pairMin, hasQ, qCost } = CFG[tableType];

  let wins = 0;
  let losses = 0;
  let pushes = 0;
  let bjs = 0;
  let profit = 0;
  const rProfits = [];

  for (let r = 0; r < rounds; r++) {
    const deck = mkDeck();
    let di = 0;
    let rp = 0;

    // Burn the cards that go to the seats before ours.
    di += Math.min(pos - 1, playersN - 1) * 2;

    for (let hn = 0; hn < handsN; hn++) {
      if (di + 6 >= deck.length) di = 0;
      const c1 = deck[di++];
      const c2 = deck[di++];
      const dUp = deck[di++];

      // Side bets settle on the opening cards.
      let pairP = 0;
      let queensP = 0;
      if (usePair) {
        const pp = evalPair(c1, c2);
        pairP = pp ? pairMin * pp.pay : -pairMin;
      }
      if (useQueens && hasQ) {
        const qp = evalQueens(c1, c2, dUp);
        queensP = qp && typeof qp.pay === "number" ? qCost * qp.pay : -qCost;
      }

      // Play our hand to the strategy table.
      let cards = [c1, c2];
      let bet = mb;
      if (hTot(cards) !== 21) {
        let done = false;
        while (!done && di < deck.length - 2) {
          const t = hTot(cards);
          if (t >= 21) {
            done = true;
            break;
          }
          const canDbl = cards.length === 2;
          const canSpl = canDbl && cVal(cards[0].rank) === cVal(cards[1].rank);
          const act = getAction(cards, dUp.rank, strat, canDbl, canSpl);
          if (act === "H") {
            cards.push(deck[di++]);
          } else if (act === "S") {
            done = true;
          } else if (act === "D") {
            cards.push(deck[di++]);
            bet = mb * 2;
            done = true;
          } else if (act === "SP") {
            cards = [cards[0], deck[di++]];
          } else {
            done = true;
          }
        }
      }

      // Burn the cards taken by the seats after ours.
      const after = Math.max(0, playersN - pos);
      for (let op = 0; op < after && di < deck.length - 2; op++) {
        const oc = [deck[di++], deck[di++]];
        if (otherRandom) {
          while (hTot(oc) < 12 && di < deck.length - 1) oc.push(deck[di++]);
          while (hTot(oc) >= 12 && hTot(oc) <= 16 && Math.random() < 0.5 && di < deck.length - 1) {
            oc.push(deck[di++]);
          }
        } else {
          while (hTot(oc) < 17 && di < deck.length - 1) oc.push(deck[di++]);
        }
      }

      // Dealer draws to 17.
      const dc = [dUp];
      while (hTot(dc) < 17 && di < deck.length) dc.push(deck[di++]);
      const dt = hTot(dc);
      const dBust = dt > 21;
      const dBJ = dt === 21 && dc.length === 2;

      const pt = hTot(cards);
      const pBust = pt > 21;
      const pBJ = hTot([c1, c2]) === 21 && !pBust;

      let hp = 0;
      if (pBust) {
        hp = -bet;
        losses++;
      } else if (pBJ && !dBJ) {
        hp = mb * bjP;
        bjs++;
        wins++;
      } else if (dBust || pt > dt) {
        hp = bet;
        wins++;
      } else if (pt === dt) {
        hp = 0;
        pushes++;
      } else {
        hp = -bet;
        losses++;
      }

      rp += hp + pairP + queensP;
    }

    profit += rp;
    rProfits.push(rp);
  }

  return { wins, losses, pushes, bjs, profit, rProfits };
}
