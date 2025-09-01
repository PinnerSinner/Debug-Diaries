// Basketball Scoreboard logic
let homeScore = 0;
let guestScore = 0;

const homeScoreEl = document.getElementById('home-score');
const guestScoreEl = document.getElementById('guest-score');
const newGameBtn = document.getElementById('new-game');
const airhorn = document.getElementById('airhorn');
const cheer = document.getElementById('cheer');

function updateScores() {
  homeScoreEl.textContent = homeScore;
  guestScoreEl.textContent = guestScore;

  // Highlight the leader
  homeScoreEl.classList.toggle('leader', homeScore > guestScore);
  guestScoreEl.classList.toggle('leader', guestScore > homeScore);
}

// Attach click handlers to scoring buttons

document.querySelectorAll('.controls button').forEach(btn => {
  btn.addEventListener('click', () => {
    const team = btn.dataset.team;
    const points = parseInt(btn.dataset.points, 10);
    if (team === 'home') {
      homeScore += points;
    } else {
      guestScore += points;
    }
    updateScores();

    // Always play the airhorn on scoring
    airhorn.currentTime = 0;
    airhorn.play();

    // Play a cheer when the lead changes hands
    const homeLeading = homeScore > guestScore;
    const guestLeading = guestScore > homeScore;
    if ((homeLeading && guestScoreEl.classList.contains('leader')) ||
        (guestLeading && homeScoreEl.classList.contains('leader'))) {
      cheer.currentTime = 0;
      cheer.play();
    }
  });
});

// Reset scores and start a new game
newGameBtn.addEventListener('click', () => {
  homeScore = 0;
  guestScore = 0;
  updateScores();
  airhorn.currentTime = 0;
  airhorn.play();
});

// Initialize display
updateScores();
