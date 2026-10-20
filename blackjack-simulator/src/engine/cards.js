// Card engine: deck construction, shuffling and hand totals.

export const SUITS = ["♠", "♥", "♦", "♣"];
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
export const RED = new Set(["♥", "♦"]);

/** Blackjack value of a rank. Aces count as 11 here and are reduced in hTot. */
export function cVal(rank) {
  if (["J", "Q", "K"].includes(rank)) return 10;
  if (rank === "A") return 11;
  return parseInt(rank);
}

/** Best total for a hand, reducing aces from 11 to 1 while busting. */
export function hTot(cards) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cVal(c.rank);
    if (c.rank === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

/** True when the hand still holds an ace counted as 11. */
export function isSoft(cards) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cVal(c.rank);
    if (c.rank === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return aces > 0;
}

/** Ordered shoe of n decks. */
export function freshDeck(n = 6) {
  const deck = [];
  for (let i = 0; i < n; i++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, id: `${i}${suit}${rank}` });
      }
    }
  }
  return deck;
}

/** Fisher-Yates shuffle. Returns a new array. */
export function shuffle(deck) {
  const a = [...deck];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A shuffled 6-deck shoe, the Holland Casino configuration. */
export function mkDeck() {
  return shuffle(freshDeck(6));
}
