# Marcoverse Blackjack

Self-contained Blackjack in vanilla JS and CSS. Lives under `activities/blackjack-game/` in Debug Diaries.

## Run
Open `index.html` in a browser or let the GitHub Pages build publish the activity.

## Features
- Six-deck shoe with proper shuffling
- Aces count as 1 or 11, dealer stands on all 17s
- 3:2 blackjack payouts, double and rebet
- Betting chips with chip selector
- Keyboard controls: H (hit), Space (stand), D (double), N (new round), S (toggle sound), T (toggle theme)
- Sound effects and theme toggle (light/dark)
- LocalStorage persistence for chips and statistics (wins, losses, pushes)
- Modern UI with rounder shapes, thinner strokes, brighter colours

## What you learned
In building this game, you practiced using arrays to hold decks and hands, objects to store state, and booleans to track the game’s progress. You wrote conditional logic using if/else and operators to compare sums, loops to shuffle and render cards, and used the Math object for randomness. You also built functions that return values for scores, and manipulated the DOM. This hands-on project strengthens your understanding of these core JavaScript concepts.
