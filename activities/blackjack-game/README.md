# Flapjack Blackjack

I turned a lazy weekend experiment into a breakfast‑themed blackjack table. It runs in the browser using plain HTML, CSS and JavaScript—no frameworks, just cards, a bit of sound, and a whole lot of flapjacks.

Play it here: https://pinnersinner.github.io/Debug-Diaries/activities/blackjack-game
<img width="2499" height="986" alt="image" src="https://github.com/user-attachments/assets/234786f0-faca-4bbe-9c9a-41bd82f5c857" />

## Features
- Dealer and player hands sit side by side so you can see who’s ahead at a glance.
- A big amber **Deal** button and chunky **Stand** button keep things thumb‑friendly on phones.
- You bet flapjacks instead of cash, and the stash quietly refills if you ever run out.
- Keyboard shortcuts: **Space** to deal, **H** hit, **S** stand, **D** double, **C** clear, **B** bet ten flapjacks.

## What I tinkered with
- A tiny state object to track the shoe, hands and wagers.
- Rendering full playing cards and sliding them in with CSS keyframes.
- Little click and win/lose tones built with the Web Audio API.

Open `index.html` directly or serve the folder to start a round.
