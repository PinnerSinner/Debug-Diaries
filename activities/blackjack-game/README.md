# Flapjack Blackjack

Flapjack Blackjack is a breakfast‑themed take on twenty‑one built with plain HTML, CSS and JavaScript—no frameworks, just cards, a sprinkle of sound effects and a heap of flapjacks.

Play it here: https://pinnersinner.github.io/Debug-Diaries/activities/blackjack-game

## Features
- Dealer and player hands sit side by side so you can compare them at a glance.
- A big amber **Deal** button and a syrupy **Hit** button keep play thumb‑friendly, while the stand button proudly reads “That's quite enough for me thank you I'm full”.
- You bet flapjacks instead of cash, and the stash quietly refills if you run out.
- After each round a roomy peek window shows the next cards that would have been dealt to you and the dealer.
- Confetti rains down when you win, and hitting plays a sharp hit‑marker tone.
- Keyboard shortcuts: **Space** deal, **H** hit, **S** stand, **C** clear, **B** bet ten flapjacks.

## Under the hood
- A tiny state container tracks the shoe, hands, bankroll and round number.
- A rendering pipeline builds full playing cards in the DOM and animates them with CSS keyframes and delays.
- All sound effects are generated on the fly with the Web Audio API—there's no background music and no audio files.

Open `index.html` directly or serve the folder to start a round of Flapjack Blackjack.
