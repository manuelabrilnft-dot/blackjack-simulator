import { useState, useRef, useCallback } from "react";
import { cVal, hTot, mkDeck } from "../engine/cards.js";
import { CFG } from "../engine/tables.js";
import { evalPair, evalQueens } from "../engine/sideBets.js";
import { getAction } from "../engine/session.js";
import { PHASE } from "../theme.js";

/**
 * All state and actions for the live table.
 *
 * `strat` is the strategy table used for the on-screen hint. It is passed in
 * rather than owned here so the Strategy tab stays the single source of truth.
 */
export default function useBlackjackGame(strat) {
  const deckRef = useRef(mkDeck());
  const diRef = useRef(0);

  const drawCard = useCallback(() => {
    if (diRef.current >= deckRef.current.length - 10) {
      deckRef.current = mkDeck();
      diRef.current = 0;
    }
    return deckRef.current[diRef.current++];
  }, []);

  const reshuffle = useCallback(() => {
    deckRef.current = mkDeck();
    diRef.current = 0;
  }, []);

  const [tt, setTt] = useState("20");
  const [phase, setPhase] = useState(PHASE.BET);
  const [mainBet, setMainBet] = useState(0);
  const [pairBet, setPairBet] = useState(0);
  const [useQ, setUseQ] = useState(false);
  const [chipSel, setChipSel] = useState(20);
  const [hands, setHands] = useState([]);
  const [hIdx, setHIdx] = useState(0);
  const [dealer, setDealer] = useState([]);
  const [pairRes, setPairRes] = useState(null);
  const [queensRes, setQueensRes] = useState(null);
  const [msg, setMsg] = useState("");
  const [stats, setStats] = useState({ n: 0, w: 0, l: 0, p: 0, bj: 0, profit: 0 });

  const cfg = CFG[tt];
  const cur = hands[hIdx];
  const canSpl = cur && cur.cards.length === 2 && cVal(cur.cards[0].rank) === cVal(cur.cards[1].rank);
  const canDbl = cur && !cur.splitAce && cur.cards.length === 2;

  function addPair() {
    setPairBet((b) => (b === 0 ? cfg.pairMin : b + cfg.pairStep));
  }

  function clearBets() {
    setMainBet(0);
    setPairBet(0);
    setUseQ(false);
  }

  function selectTable(v) {
    setTt(v);
    setMainBet(0);
    setPairBet(0);
    setUseQ(false);
  }

  function deal() {
    if (mainBet < cfg.min) {
      setMsg(`Min €${cfg.min}`);
      return;
    }
    reshuffle();
    const c1 = drawCard();
    const c2 = drawCard();
    const d1 = drawCard();
    const h0 = {
      cards: [c1, c2],
      bet: mainBet,
      done: false,
      result: null,
      doubled: false,
      fromSplit: false,
      splitAce: false,
    };
    setHands([h0]);
    setHIdx(0);
    setDealer([d1]);
    setPhase(PHASE.PLAY);
    setMsg("");

    const pp = pairBet >= 2 ? evalPair(c1, c2) : null;
    setPairRes(
      pairBet >= 2
        ? pp
          ? { ...pp, bet: pairBet }
          : { label: "No Pair", pay: 0, bet: pairBet, color: "#c0392b" }
        : null
    );

    const qp = useQ && cfg.hasQ ? evalQueens(c1, c2, d1) : null;
    setQueensRes(
      useQ && cfg.hasQ
        ? qp
          ? { ...qp, bet: cfg.qCost }
          : { label: "No Queen win", pay: 0, bet: cfg.qCost, color: "#c0392b" }
        : null
    );

    if (hTot([c1, c2]) === 21) setTimeout(() => resolveRound([h0], [d1]), 400);
  }

  function advance(hs) {
    const next = hs.findIndex((h, i) => i > hIdx && !h.done);
    if (next === -1) resolveRound(hs, dealer);
    else setHIdx(next);
  }

  function hit() {
    if (!cur || cur.done) return;
    const card = drawCard();
    const nc = [...cur.cards, card];
    const t = hTot(nc);
    const bust = t > 21;
    const finished = bust || t === 21;
    const hs = hands.map((h, i) =>
      i === hIdx ? { ...h, cards: nc, done: finished, result: bust ? "bust" : null } : h
    );
    setHands(hs);
    if (finished) setTimeout(() => advance(hs), 300);
  }

  function stand() {
    if (!cur) return;
    const hs = hands.map((h, i) => (i === hIdx ? { ...h, done: true } : h));
    setHands(hs);
    setTimeout(() => advance(hs), 200);
  }

  function dbl() {
    if (!canDbl) return;
    const card = drawCard();
    const nc = [...cur.cards, card];
    const t = hTot(nc);
    const hs = hands.map((h, i) =>
      i === hIdx
        ? { ...h, cards: nc, bet: h.bet * 2, doubled: true, done: true, result: t > 21 ? "bust" : null }
        : h
    );
    setHands(hs);
    setTimeout(() => advance(hs), 300);
  }

  function spl() {
    if (!canSpl) return;
    const isAce = cur.cards[0].rank === "A";
    const nc1 = drawCard();
    const nc2 = drawCard();
    const h1 = {
      cards: [cur.cards[0], nc1],
      bet: cur.bet,
      done: isAce && nc1.rank !== "A",
      result: null,
      doubled: false,
      fromSplit: true,
      splitAce: isAce,
    };
    const h2 = {
      cards: [cur.cards[1], nc2],
      bet: cur.bet,
      done: false,
      result: null,
      doubled: false,
      fromSplit: true,
      splitAce: isAce,
    };
    const hs = [...hands.slice(0, hIdx), h1, h2, ...hands.slice(hIdx + 1)];
    setHands(hs);
    if (isAce && h1.done) setTimeout(() => advance(hs), 400);
  }

  function resolveRound(hs, dc) {
    const dCards = [...dc];
    while (hTot(dCards) < 17) dCards.push(drawCard());
    setDealer(dCards);

    const dt = hTot(dCards);
    const dBust = dt > 21;
    const dBJ = dt === 21 && dCards.length === 2;

    let profit = 0;
    if (pairBet >= 2) profit += pairRes?.pay > 0 ? pairBet * pairRes.pay : -pairBet;
    if (useQ && cfg.hasQ) {
      profit +=
        queensRes?.pay && typeof queensRes.pay === "number"
          ? cfg.qCost * queensRes.pay
          : -cfg.qCost;
    }

    const resolved = hs.map((h) => {
      const pt = hTot(h.cards);
      const pBust = pt > 21;
      const pBJ = pt === 21 && h.cards.length === 2 && !h.fromSplit;
      let res, hp;
      if (pBust) {
        res = "lose";
        hp = -h.bet;
      } else if (pBJ && !dBJ) {
        res = "blackjack";
        hp = h.bet * cfg.bjP;
      } else if (dBust || pt > dt) {
        res = "win";
        hp = h.bet;
      } else if (pt === dt) {
        res = "push";
        hp = 0;
      } else {
        res = "lose";
        hp = -h.bet;
      }
      profit += hp;
      return { ...h, result: res, profit: hp, done: true };
    });

    setHands(resolved);
    setPhase(PHASE.DONE);
    setMsg(
      profit > 0
        ? `+€${profit.toFixed(2)} 🎉`
        : profit < 0
        ? `-€${Math.abs(profit).toFixed(2)} 😔`
        : "Push 🤝"
    );
    setStats((prev) => ({
      n: prev.n + resolved.length,
      w: prev.w + resolved.filter((h) => ["win", "blackjack"].includes(h.result)).length,
      l: prev.l + resolved.filter((h) => h.result === "lose").length,
      p: prev.p + resolved.filter((h) => h.result === "push").length,
      bj: prev.bj + resolved.filter((h) => h.result === "blackjack").length,
      profit: prev.profit + profit,
    }));
  }

  function newRound() {
    setPhase(PHASE.BET);
    setHands([]);
    setHIdx(0);
    setDealer([]);
    setPairRes(null);
    setQueensRes(null);
    setMsg("");
  }

  const bsHint =
    cur && dealer[0] ? getAction(cur.cards, dealer[0].rank, strat, canDbl, canSpl) : null;

  return {
    tt,
    selectTable,
    phase,
    mainBet,
    setMainBet,
    pairBet,
    useQ,
    setUseQ,
    chipSel,
    setChipSel,
    hands,
    hIdx,
    dealer,
    pairRes,
    queensRes,
    msg,
    stats,
    cfg,
    cur,
    canSpl,
    canDbl,
    bsHint,
    addPair,
    clearBets,
    deal,
    hit,
    stand,
    dbl,
    spl,
    newRound,
  };
}
