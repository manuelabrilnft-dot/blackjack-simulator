// Monte Carlo expected-value engine (6 decks, S17, no surrender).
//
// Every action is valued by dealing out random shoes and averaging the result.
// Returns are expressed in units of the main bet, so a double that wins pays 2.

import { cVal, hTot, mkDeck } from "./cards.js";

/** Plays the dealer hand out from an upcard and returns the final total. */
export function dealerTotal(upcard, deck, di) {
  const cards = [upcard];
  let i = di;
  while (hTot(cards) < 17) cards.push(deck[i++]);
  return hTot(cards);
}

/**
 * Value of one action on one shoe.
 * "H" looks ahead and takes the better of standing or hitting again, so it
 * measures optimal continuation rather than a fixed rule.
 */
export function simHand(cards, dUp, action, deck, di, depth = 0) {
  if (depth > 8) return -1;
  const t = hTot(cards);

  if (action === "S") {
    const dt = dealerTotal(dUp, deck, di);
    if (t > 21) return -1;
    if (dt > 21 || t > dt) return 1;
    if (t === dt) return 0;
    return -1;
  }

  if (action === "D") {
    const nc = [...cards, deck[di]];
    const nt = hTot(nc);
    const dt = dealerTotal(dUp, deck, di + 1);
    if (nt > 21) return -2;
    if (dt > 21 || nt > dt) return 2;
    if (nt === dt) return 0;
    return -2;
  }

  if (action === "H") {
    const nc = [...cards, deck[di]];
    const nt = hTot(nc);
    if (nt > 21) return -1;
    if (nt === 21) return simHand(nc, dUp, "S", deck, di + 1, depth + 1);
    const evS = simHand(nc, dUp, "S", deck, di + 1, depth + 1);
    const evH = simHand(nc, dUp, "H", deck, di + 1, depth + 1);
    return Math.max(evS, evH);
  }

  return 0;
}

/**
 * Expected value of each action for a given hand against a dealer upcard.
 * N is the number of Monte Carlo samples. Unavailable actions return -99.
 */
export function computeEV(cards, duCard, canDbl, canSpl, N = 500) {
  const t = hTot(cards);
  if (t >= 21) return { H: -1, S: t === 21 ? 1 : -1, D: -99, SP: -99 };

  let evH = 0;
  let evS = 0;
  let evD = 0;
  let evSP = 0;

  for (let i = 0; i < N; i++) {
    const deck = mkDeck();
    evS += simHand(cards, duCard, "S", deck, 0);
    evH += simHand(cards, duCard, "H", deck, 0);
    if (canDbl) evD += simHand(cards, duCard, "D", deck, 0);
  }
  evH /= N;
  evS /= N;
  if (canDbl) evD /= N;

  if (canSpl) {
    const splitCard = cards[0];
    const isAce = splitCard.rank === "A";
    for (let i = 0; i < N; i++) {
      const deck = mkDeck();
      const h1 = [splitCard, deck[0]];
      const h2 = [splitCard, deck[1]];
      let r1, r2;
      if (isAce) {
        // Split aces receive one card each and may not be played on.
        r1 = simHand(h1, duCard, "S", deck, 2);
        r2 = simHand(h2, duCard, "S", deck, 2);
      } else {
        r1 = Math.max(simHand(h1, duCard, "S", deck, 2), simHand(h1, duCard, "H", deck, 2));
        r2 = Math.max(simHand(h2, duCard, "S", deck, 3), simHand(h2, duCard, "H", deck, 3));
      }
      evSP += (r1 + r2) / 2;
    }
    evSP /= N;
  }

  return { H: evH, S: evS, D: canDbl ? evD : -99, SP: canSpl ? evSP : -99 };
}

// A double must beat hitting and standing by this margin before it is chosen,
// which stops Monte Carlo noise from flipping borderline cells.
const DOUBLE_MARGIN = 0.02;
const SPLIT_MARGIN = 0.01;

/**
 * Builds a full basic-strategy table by computing EV for every player state.
 *
 * Runs in chunks on a timer so the browser stays responsive, and reports
 * progress as a percentage through onProgress.
 *
 * NOTE: bjPay is accepted but not yet applied. Blackjack payout only affects
 * naturals, which are never decision points, but it does shift the value of
 * splitting into a 21. The "optimise for table" control therefore produces the
 * same table for 6:5 and 3:2 today. See README, known issues.
 */
export function buildStrategy(bjPay, onProgress) {
  const hard = {};
  const soft = {};
  const pairs = {};
  const DU = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const states = [];
  for (let t = 5; t <= 20; t++) for (const d of DU) states.push({ type: "hard", t, d });
  for (let x = 2; x <= 9; x++) for (const d of DU) states.push({ type: "soft", x, d });
  for (const pv of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) for (const d of DU) states.push({ type: "pair", pv, d });

  let done = 0;
  const total = states.length;

  return new Promise((resolve) => {
    function chunk() {
      for (let c = 0; c < 10 && done < total; c++, done++) {
        const s = states[done];
        const duCard = { rank: s.d === 11 ? "A" : String(s.d), suit: "♠" };

        if (s.type === "hard") {
          const r1 = Math.min(s.t - 2, 10);
          const r2 = s.t - r1;
          const cards = [
            { rank: r1 === 10 ? "10" : String(r1), suit: "♠" },
            { rank: r2 === 10 ? "10" : String(r2), suit: "♣" },
          ];
          const ev = computeEV(cards, duCard, true, false, 500);
          let best = "H";
          let bv = ev.H;
          if (ev.S > bv) {
            bv = ev.S;
            best = "S";
          }
          if (ev.D > Math.max(ev.H, ev.S) + DOUBLE_MARGIN) best = "D";
          if (!hard[s.t]) hard[s.t] = {};
          hard[s.t][s.d] = best;
        } else if (s.type === "soft") {
          const cards = [
            { rank: "A", suit: "♠" },
            { rank: s.x === 10 ? "10" : String(s.x), suit: "♣" },
          ];
          const ev = computeEV(cards, duCard, true, false, 500);
          let best = "H";
          let bv = ev.H;
          if (ev.S > bv) {
            bv = ev.S;
            best = "S";
          }
          if (ev.D > Math.max(ev.H, ev.S) + DOUBLE_MARGIN) best = "D";
          if (!soft[11 + s.x]) soft[11 + s.x] = {};
          soft[11 + s.x][s.d] = best;
        } else {
          const pr = s.pv === 11 ? "A" : s.pv === 10 ? "10" : String(s.pv);
          const cards = [
            { rank: pr, suit: "♠" },
            { rank: pr, suit: "♣" },
          ];
          const ev = computeEV(cards, duCard, true, true, 500);
          let best = "H";
          let bv = ev.H;
          if (ev.S > bv) {
            bv = ev.S;
            best = "S";
          }
          if (ev.D > Math.max(ev.H, ev.S) + DOUBLE_MARGIN) best = "D";
          const nonSplit = Math.max(ev.H, ev.S, ev.D > -99 ? ev.D : -99);
          if (ev.SP > nonSplit + SPLIT_MARGIN) best = "SP";
          if (!pairs[s.pv]) pairs[s.pv] = {};
          pairs[s.pv][s.d] = best;
        }
      }

      onProgress(Math.round((done / total) * 100));
      if (done < total) setTimeout(chunk, 0);
      else resolve({ hard, soft, pairs });
    }
    chunk();
  });
}
