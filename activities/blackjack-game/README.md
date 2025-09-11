# Debug Diaries Blackjack

A browser blackjack table built to practice state management, DOM rendering and tiny audio effects without any frameworks. Drop the folder on a web server or open `index.html` directly and you can deal.

## System architecture


- **State container** – one object tracks the shoe, both hands, the current bet and bankroll.
- **Rendering pipeline** – `render()` rebuilds the table from state. `cardEl()` draws full playing cards with corners, pips and backs.
- **Game flow** – button and keyboard listeners drive dealing, hitting, standing and doubling. A simple state machine guards illegal moves.
- **Bankroll logic** – wagers come off the bank. If you run dry the house automatically tops you back up so play never stalls.
- **Audio/animation** – the Web Audio API synthesises clicks and win/lose tones. CSS keyframes slide cards into place and buttons brighten on hover.

## Features
- Six‑deck shoe with aces counting as 1 or 11; dealer stands on all 17s.
- Side‑by‑side dealer and player hands with round indicator for clarity.
- Mobile‑friendly layout with oversized Deal and Stand buttons.
- Bet flapjacks instead of cash. Double down, clear bet and keyboard shortcuts: **Space** to deal, **H** hit, **S** stand, **D** double, **C** clear, **B** bet 10 flapjacks.
- Shuffle the shoe at any time and toggle sound, music and keyboard input.

## Development notes
Everything is plain HTML, CSS and vanilla JavaScript. No build step or dependencies are required.
