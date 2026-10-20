# Blackjack Simulator

A blackjack simulator built around a Monte Carlo expected-value engine. It plays
the Holland Casino ruleset, computes a basic strategy table from scratch instead
of hardcoding one, and measures what the Pair Pursuit and Queens Pursuit side
bets actually cost the player.

Built with React and Vite. No backend, no dependencies beyond React.

## What it does

The app has four tabs.

**Game** is a playable table. You pick a stake, place the main bet and the side
bets, and play a hand out with hit, stand, double and split. While a hand is
live it shows the action the current strategy table recommends.

**Strategy** builds a basic strategy table from nothing. For every player state
against every dealer upcard, it deals 500 random shoes, plays each action to the
end, and keeps whichever action has the highest expected value. A double has to
beat hitting and standing by 0.02 EV before it is chosen, and a split by 0.01,
which stops sampling noise from flipping borderline cells. The work runs in
chunks on a timer so the page stays responsive, and it takes about a minute.

**Statistics** runs 150,000 deals to measure how often each side bet outcome
lands, turns those frequencies into an expected value, and compares three
sessions on the €20 table: no side bets, Pair Pursuit, and both.

**Simulation** plays up to 20,000 rounds at once and reports profit, return to
player, win rate and blackjack rate. It also replays every seat at the table to
show that seat choice makes no difference.

## Results

| Measure | Result | Source |
| --- | --- | --- |
| Any pair frequency, 6 decks | 7.4% | measured, matches the exact 23/311 |
| Pair Pursuit house edge | about 3.8% | measured over 150,000 deals |
| Long-run return to player, €20 table | about 99.7% | measured over 50,000 rounds |
| House edge, €20 and €50 tables (3:2) | about 0.55% | published reference, shown in the app |
| House edge, €10 table (6:5) | about 1.98% | published reference, shown in the app |

The measured return to player sits a little above the published figure because
of the simplifications listed under known issues, mainly the way splits are
handled in the session simulator.

Two conclusions come out of this. The €10 table pays 6:5 on a blackjack instead
of 3:2, which nearly quadruples the house edge, so the lower minimum is more
expensive per hand than the higher one. And Pair Pursuit costs roughly seven
times more per euro staked than the main game, so it is the worst bet available
at the table.

## Rules modelled

6 decks, continuous shuffling machine, dealer stands on soft 17, no surrender,
European no hole card. Blackjack pays 3:2 on the €20 and €50 tables and 6:5 on
the €10 table. Pair Pursuit is available everywhere. Queens Pursuit costs a
fixed €2.50 and runs only on the €20 and €50 tables.

## Running it

```
npm install
npm run dev
```

Then open the address Vite prints. To produce a production build:

```
npm run build
npm run preview
```

## Project layout

```
src/
  engine/                   pure game logic, no React
    cards.js                deck construction, shuffling, hand totals
    tables.js               the three table configurations
    sideBets.js             Pair Pursuit and Queens Pursuit evaluators
    ev.js                   Monte Carlo EV engine and strategy builder
    referenceStrategy.js    published basic strategy, used as the fallback
    session.js              plays many rounds and reports profit
    sideBetStats.js         side bet probabilities by sampling
  hooks/                    state, one hook per tab
  components/               Card, Chip, StatBox, StratGrid
  tabs/                     one component per tab
  theme.js                  shared colours and constants
  App.jsx                   shell, owns the shared strategy table
```

Everything under `engine/` is plain JavaScript with no React import, so it runs
in Node as easily as in the browser and can be tested on its own.

## Known issues

These are real limitations rather than things waiting on polish.

**The "optimise for table" control has no effect.** `buildStrategy` accepts a
blackjack payout but never uses it, so the 6:5 and 3:2 options produce the same
table. The payout only matters for naturals, which are never decision points,
but it does change the value of splitting into a 21.

**Splits are simplified in the session simulator.** When the strategy says
split, `runSession` replaces the hand with one new card instead of playing two
hands. The live Game tab splits properly. This undervalues splitting, so
simulated results are slightly pessimistic.

**Side bet results are stale on a natural blackjack.** When the opening two
cards total 21 the round resolves immediately, and the resolver reads the side
bet state from before it was updated, so the side bet profit for that round
comes from the previous round.

**The EV engine samples from a full shoe.** `computeEV` deals from a fresh
6-deck shoe without removing the cards the player is already holding, which
biases the result slightly.

**Near the end of a shoe the simulator restarts the index** rather than
reshuffling, so a few cards can repeat inside a round.

**Queens Pursuit expected value uses reset jackpot values.** The real meters sit
above those, so the figure shown is a floor, not a fixed number.

## Credits

Strategy tables in `referenceStrategy.js` are the standard published basic
strategy for 6 decks with the dealer standing on soft 17.
