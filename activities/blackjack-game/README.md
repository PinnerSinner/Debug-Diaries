
 # Marcoverse Blackjack
 
I wanted a little table to play with while learning how to juggle state, DOM updates and audio in plain JavaScript, so I wrote a tiny blackjack game. It sits in `activities/blackjack-game/` and runs straight in the browser—just open `index.html` and you’re dealing.
 
The whole thing is held together by one `state` object. It tracks a six‑deck shoe, both hands, the stash of **stars** you wager with and whose turn it is. I cache the elements I need in an `el` lookup so I can update the interface without constantly querying the DOM. When a card is dealt `renderCard` builds the markup on the fly, drawing the rank in the corners and the suit in the middle so the cards look like the real thing. Small WAV files and a couple of CSS animations add some personality: there’s a flick for every card, a clink for each star token and a short fanfare when you win.
 
Instead of betting money, you stake stars. Run out and the next round refills your supply so the game keeps moving. The layout rearranges itself on narrow screens and the Deal and Stand buttons swell to full width so your thumbs always land where they should.
 
### Features

- Six‑deck shoe, aces flex between 1 and 11 and the dealer stands on all 17s
- Star‑based stakes instead of cash for a playful USP
- Oversized Deal and Stand buttons designed for mobile thumbs
- Double down, restake and keyboard shortcuts: H, Space, D, N, S and T
- Sound effects, card slide animation and light/dark theme
- Star stash auto‑refills and stats persist across refreshes

### What I learned

- Modeling game flow with a simple state machine  
- Rendering components and caching DOM nodes by hand  
- Using `localStorage` for persistence and audio for feedback  
- Making a responsive layout without any framework  
