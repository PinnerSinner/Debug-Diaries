# Basketball Scoreboard

I wanted to build a scoreboard that felt like something you’d see courtside at a local gym, but with my own twist. This little app uses nothing more than HTML, CSS and vanilla JavaScript to keep track of two teams going head to head. You tap the +1, +2 or +3 buttons under Home or Guest to push the numbers up. The bigger number lights up green so you can instantly tell who’s in front, and if someone pulls ahead by a clear margin the crowd cheer sound and a burst of confetti celebrate the lead.

There’s a “New game” button that resets everything back to zeros and restarts the ten‑minute countdown timer. I also added fouls counters and a period tracker because once you start keeping score it’s very easy to start keeping track of everything else as well. The timer is just a simple downward count but it was good practice for managing intervals and formatting time strings.

I deliberately wrote the update functions myself rather than relying on a framework. It forced me to think about state and DOM updates, and it was a great reminder that little projects like this are ideal for learning event listeners and data attributes. On the styling side I drew inspiration from digital LED displays, using a dark palette with neon accents to match the rest of the Debug Diaries site.

To try it out just open `index.html` in a browser. If you visit the live site you’ll find it under the Basketball Scoreboard activity on my Debug Diaries page.
