// Marcoverse Blackjack, vanilla JS
const state = {
  deck: [],
  player: { hand: [], total: 0 },
  dealer: { hand: [], total: 0 },
  chips: 1000,
  bet: 0,
  lastBet: 0,
  inRound: false,
  soundsOn: true,
  dealerHitsSoft17: false
};

const el = {
  chips: document.getElementById("chips"),
  bet: document.getElementById("bet"),
  status: document.getElementById("status"),
  stats: document.getElementById("stats"),
  dealerCards: document.getElementById("dealer-cards"),
  playerCards: document.getElementById("player-cards"),
  dealerSum: document.getElementById("dealer-sum"),
  playerSum: document.getElementById("player-sum"),
  betting: document.getElementById("betting-controls"),
  play: document.getElementById("play-controls"),
  btnDeal: document.getElementById("btn-deal"),
  btnClear: document.getElementById("btn-clearbet"),
  btnHit: document.getElementById("btn-hit"),
  btnStand: document.getElementById("btn-stand"),
  btnDouble: document.getElementById("btn-double"),
  btnNew: document.getElementById("btn-newround"),
  btnRebet: document.getElementById("btn-rebet"),
  btnHow: document.getElementById("btn-howto"),
  btnSound: document.getElementById("btn-sound"),
  btnTheme: document.getElementById("btn-theme"),
  dlgHow: document.getElementById("howto"),
  sfxCard: document.getElementById("sfx-card"),
  sfxChip: document.getElementById("sfx-chip"),
  sfxWin: document.getElementById("sfx-win")
};

const stats = { wins: 0, losses: 0, pushes: 0 };

init();

function init() {
  loadPersisted();
  updateHUD();
  wireEvents();
  buildNewShoe();
  hint("Place your bet");
}

function wireEvents() {
  document.querySelectorAll(".chip").forEach(c =>
    c.addEventListener("click", () => addBet(parseInt(c.dataset.chip, 10)))
  );
  el.btnClear.addEventListener("click", clearBet);
  el.btnDeal.addEventListener("click", deal);
  el.btnHit.addEventListener("click", playerHit);
  el.btnStand.addEventListener("click", playerStand);
  el.btnDouble.addEventListener("click", playerDouble);
  el.btnNew.addEventListener("click", newRound);
  el.btnRebet.addEventListener("click", rebet);
  el.btnHow.addEventListener("click", () => el.dlgHow.showModal());
  el.btnSound.addEventListener("click", toggleSound);
  el.btnTheme.addEventListener("click", toggleTheme);
  window.addEventListener("keydown", onKey);
}
function onKey(e) {
  if (e.code === "Space" && state.inRound) { e.preventDefault(); playerStand(); }
  else if (e.key.toLowerCase() === "h" && state.inRound) { playerHit(); }
  else if (e.key.toLowerCase() === "d" && state.inRound) { playerDouble(); }
  else if (e.key.toLowerCase() === "n") { newRound(); }
  else if (e.key.toLowerCase() === "s") { toggleSound(); }
  else if (e.key.toLowerCase() === "t") { toggleTheme(); }
}

function buildNewShoe() {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const deck = [];
  for (let d = 0; d < 6; d++) {
    for (const s of suits) {
      for (const r of ranks) deck.push({ r, s });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  state.deck = deck;
}

function drawCard() {
  if (state.deck.length < 60) buildNewShoe();
  const card = state.deck.pop();
  playSound(el.sfxCard);
  return card;
}

function cardValue(card) {
  if (card.r === "A") return 11;
  if (["K","Q","J"].includes(card.r)) return 10;
  return parseInt(card.r, 10);
}

function handTotal(hand) {
  let total = 0, aces = 0;
  for (const c of hand) {
    total += cardValue(c);
    if (c.r === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function renderHands(showDealerHole = false) {
  el.dealerCards.innerHTML = "";
  state.dealer.hand.forEach((c, idx) => {
    el.dealerCards.appendChild(renderCard(c, idx === 0 && !showDealerHole && state.inRound));
  });
  el.dealerSum.textContent = showDealerHole || !state.inRound ? handTotal(state.dealer.hand) : "??";

  el.playerCards.innerHTML = "";
  state.player.hand.forEach(c => {
    el.playerCards.appendChild(renderCard(c));
  });
  el.playerSum.textContent = handTotal(state.player.hand);
}

function renderCard(card, back = false) {
  const div = document.createElement("div");
  div.className = "card" + (back ? " back" : "");
  if (!back) {
    if (card.s === "♥" || card.s === "♦") div.classList.add("red");
    const rank = document.createElement("div");
    rank.className = "rank";
    rank.textContent = card.r;
    const suit = document.createElement("div");
    suit.className = "suit";
    suit.textContent = card.s;
    div.append(rank, suit);
  }
  return div;
}

function addBet(amount) {
  if (state.inRound) return;
  if (state.chips < amount) {
    hint("Not enough chips");
    return;
  }
  state.chips -= amount;
  state.bet += amount;
  state.lastBet = state.bet;
  updateHUD();
  playSound(el.sfxChip);
}

function clearBet() {
  if (state.inRound) return;
  state.chips += state.bet;
  state.bet = 0;
  updateHUD();
}

function deal() {
  if (state.inRound) return;
  if (state.bet <= 0) {
    hint("Place a bet first");
    return;
  }
  state.inRound = true;
  toggleControls();

  state.player.hand = [drawCard(), drawCard()];
  state.dealer.hand = [drawCard(), drawCard()];
  renderHands(false);
  if (isBlackjack(state.player.hand) || isBlackjack(state.dealer.hand)) {
    setTimeout(() => settleEnd(true), 450);
  } else {
    hint("Your move");
  }
}

function playerHit() {
  if (!state.inRound) return;
  state.player.hand.push(drawCard());
  renderHands(false);
  if (handTotal(state.player.hand) > 21) {
    setTimeout(() => settleEnd(true), 350);
  }
}

function playerStand() {
  if (!state.inRound) return;
  dealerPlay();
}

function playerDouble() {
  if (!state.inRound) return;
  if (state.chips < state.bet) {
    hint("Not enough chips to double");
    return;
  }
  state.chips -= state.bet;
  state.bet *= 2;
  state.player.hand.push(drawCard());
  renderHands(false);
  dealerPlay();
}

function dealerPlay() {
  renderHands(true);
  const soft17 = () => {
    const t = handTotal(state.dealer.hand);
    if (t !== 17) return false;
    let sum = 0, aces = 0;
    for (const c of state.dealer.hand) {
      const v = cardValue(c);
      sum += v;
      if (c.r === "A") aces++;
    }
    return aces > 0 && sum - 10 >= 7 && sum - 10 <= 16;
  };

  let total = handTotal(state.dealer.hand);
  while (total < 17 || (state.dealerHitsSoft17 && soft17())) {
    state.dealer.hand.push(drawCard());
    renderHands(true);
    total = handTotal(state.dealer.hand);
  }
  setTimeout(() => settleEnd(false), 400);
}

function settleEnd(revealedAlready) {
  if (!revealedAlready) renderHands(true);
  const p = handTotal(state.player.hand);
  const d = handTotal(state.dealer.hand);
  let outcome = "";
  let payout = 0;

  if (isBlackjack(state.player.hand) && isBlackjack(state.dealer.hand)) {
    outcome = "Push, both blackjack";
    payout = state.bet;
    stats.pushes++;
  } else if (isBlackjack(state.player.hand)) {
    outcome = "Blackjack";
    payout = state.bet + Math.floor(state.bet * 1.5);
    stats.wins++;
    playSound(el.sfxWin);
  } else if (isBlackjack(state.dealer.hand)) {
    outcome = "Dealer blackjack";
    payout = 0;
    stats.losses++;
  } else if (p > 21) {
    outcome = "Bust";
    payout = 0;
    stats.losses++;
  } else if (d > 21) {
    outcome = "Dealer busts";
    payout = state.bet * 2;
    stats.wins++;
    playSound(el.sfxWin);
  } else if (p > d) {
    outcome = "You win";
    payout = state.bet * 2;
    stats.wins++;
    playSound(el.sfxWin);
  } else if (p < d) {
    outcome = "You lose";
    payout = 0;
    stats.losses++;
  } else {
    outcome = "Push";
    payout = state.bet;
    stats.pushes++;
  }

  state.chips += payout;
  hint(outcome);
  state.inRound = false;
  persist();
  updateHUD();
  toggleControls();
}

function newRound() {
  if (state.inRound) return;
  state.player.hand = [];
  state.dealer.hand = [];
  state.bet = 0;
  renderHands(false);
  updateHUD();
  hint("Place your bet");
}

function rebet() {
  if (state.inRound) return;
  if (state.lastBet <= 0) return;
  if (state.chips < state.lastBet) {
    hint("Not enough chips");
    return;
  }
  state.bet = state.lastBet;
  state.chips -= state.bet;
  updateHUD();
}

function toggleControls() {
  const bet = document.getElementById("betting-controls");
  const play = document.getElementById("play-controls");
  if (state.inRound) {
    bet.classList.add("hidden");
    play.classList.remove("hidden");
  } else {
    bet.classList.remove("hidden");
    play.classList.add("hidden");
  }
}

function hint(text) {
  el.status.textContent = text;
}

function updateHUD() {
  el.chips.textContent = `$${state.chips.toLocaleString()}`;
  el.bet.textContent = `$${state.bet.toLocaleString()}`;
  el.stats.textContent = `W ${stats.wins} • L ${stats.losses} • P ${stats.pushes}`;
}

function isBlackjack(hand) {
  return hand.length === 2 && handTotal(hand) === 21;
}

function toggleSound() {
  state.soundsOn = !state.soundsOn;
  el.btnSound.textContent = state.soundsOn ? "🔊" : "🔈";
  persist();
}

function playSound(a) {
  if (state.soundsOn) {
    a.currentTime = 0;
    a.play().catch(() => {});
  }
}

function toggleTheme() {
  const root = document.documentElement;
  const isLight = root.classList.toggle("theme-light");
  localStorage.setItem("mv-blackjack-theme", isLight ? "light" : "dark");
}

function persist() {
  localStorage.setItem("mv-blackjack-chips", String(state.chips));
  localStorage.setItem("mv-blackjack-stats", JSON.stringify(stats));
  localStorage.setItem("mv-blackjack-sounds", state.soundsOn ? "1" : "0");
  localStorage.setItem("mv-blackjack-lastbet", String(state.lastBet));
}

function loadPersisted() {
  const savedChips = parseInt(localStorage.getItem("mv-blackjack-chips") || "1000", 10);
  state.chips = Number.isFinite(savedChips) ? savedChips : 1000;
  const savedStats = localStorage.getItem("mv-blackjack-stats");
  if (savedStats) {
    try {
      Object.assign(stats, JSON.parse(savedStats));
    } catch {}
  }
  state.soundsOn = localStorage.getItem("mv-blackjack-sounds") !== "0";
  state.lastBet = parseInt(localStorage.getItem("mv-blackjack-lastbet") || "0", 10);

  const savedTheme = localStorage.getItem("mv-blackjack-theme");
  if (savedTheme === "light") document.documentElement.classList.add("theme-light");
}
