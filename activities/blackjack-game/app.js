// Flapjack Blackjack Game Logic
//
// This script powers the Flapjack Blackjack UI. It implements a six-deck shoe,
// betting with flapjacks, hit/stand/double mechanics, automatic stash top-up
// and optional keyboard shortcuts. All audio effects are synthesised on the fly

// using the Web Audio API, so no external sound files are required.

(function() {
  'use strict';

  // Card definitions
  const SUITS = ['♠','♥','♦','♣'];
  const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const VALUES = r => r === 'A' ? [1,11] : ['J','Q','K'].includes(r) ? [10] : [Number(r)];

  // Audio context and simple tone generator
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const toneMap = {
    click: { freq: 1000, duration: 0.1 },
    deal:  { freq: 600,  duration: 0.15 },
    flip:  { freq: 800,  duration: 0.15 },
    bet:   { freq: 1200, duration: 0.2 },
    win:   { freq: 1500, duration: 0.35 },
    lose:  { freq: 300,  duration: 0.35 },
    push:  { freq: 900,  duration: 0.25 }
  };
  let sfxEnabled = true;

  function play(key) {
    if (!sfxEnabled || !toneMap[key]) return;
    const cfg = toneMap[key];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = cfg.freq;
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + cfg.duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + cfg.duration + 0.1);
  }

  // DOM references
  const els = {
    dealer: document.getElementById('dealer-cards'),
    player: document.getElementById('player-cards'),
    dScore: document.getElementById('dealer-score'),
    pScore: document.getElementById('player-score'),
    bank: document.getElementById('bank'),
    bet: document.getElementById('bet'),
    round: document.getElementById('round'),
    msg: document.getElementById('message'),
    deal: document.getElementById('deal'),
    hit: document.getElementById('hit'),
    stand: document.getElementById('stand'),
    double: document.getElementById('double'),
    clear: document.getElementById('clear-bet'),
    chips: Array.from(document.querySelectorAll('.chip')),
    sfxToggle: document.getElementById('sfx-toggle'),
    keysToggle: document.getElementById('keys-toggle'),
    peek: document.getElementById('peek'),
    peekPlayer: document.getElementById('peek-player'),
    peekDealer: document.getElementById('peek-dealer')
  };

  // Game state variables
  let shoe = [];
  let playerHand = [];
  let dealerHand = [];
  let bank = 1000;
  let bet = 0;
  let round = 1;
  let inRound = false;

  // Build a shoe with n decks
  function createShoe(decks = 6) {
    const cards = [];
    for (let d = 0; d < decks; d++) {
      for (const s of SUITS) {
        for (const r of RANKS) {
          cards.push({ suit: s, rank: r });
        }
      }
    }
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }
  // Evaluate hand totals
  function handTotals(hand) {
    let totals = [0];
    for (const c of hand) {
      const vals = VALUES(c.rank);
      const next = [];
      for (const t of totals) {
        for (const v of vals) {
          next.push(t + v);
        }
      }
      totals = Array.from(new Set(next)).sort((a,b) => a - b);
    }
    const best = totals.filter(t => t <= 21).pop() ?? Math.min(...totals);
    return { best, totals };
  }
  function isBlackjack(hand) { return hand.length === 2 && handTotals(hand).best === 21; }
  function isBust(hand) { return handTotals(hand).best > 21; }

  // Draw a card to player or dealer
  function drawCard(to = 'player', faceDown = false) {
    const c = shoe.pop();
    (to === 'player' ? playerHand : dealerHand).push({ ...c, faceDown });
    render();
    play('deal');
  }
  function flipDealerHole() {
    const hole = dealerHand.find(c => c.faceDown);
    if (hole) {
      hole.faceDown = false;
      render();
      play('flip');
    }
  }

  // Render the current table state
  function cardEl(card) {
    const div = document.createElement('div');
    div.className = 'card show ' + (['♥','♦'].includes(card.suit) ? 'red' : '');
    if (card.faceDown) {
      div.className = 'card back show';
      return div;
    }
    const cornerTL = document.createElement('div');
    cornerTL.className = 'corner top';
    cornerTL.textContent = `${card.rank}\n${card.suit}`;
    const cornerBR = document.createElement('div');
    cornerBR.className = 'corner bottom';
    cornerBR.textContent = `${card.rank}\n${card.suit}`;
    const pips = document.createElement('div');
    pips.className = 'pips';
    const isPicture = ['J','Q','K'].includes(card.rank);
    const countMap = { A:1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '10':10 };
    const count = countMap[card.rank] ?? 1;
    if (isPicture) {
      const face = document.createElement('div');
      face.className = 'pip';
      face.style.fontSize = '48px';
      face.textContent = card.suit;
      pips.style.gridTemplateColumns = '1fr';
      pips.appendChild(face);
    } else {
      for (let i = 0; i < count; i++) {
        const pip = document.createElement('div');
        pip.className = 'pip';
        pip.textContent = card.suit;
        pips.appendChild(pip);
      }
    }
    div.appendChild(cornerTL);
    div.appendChild(cornerBR);
    div.appendChild(pips);
    return div;
  }
  function render() {
    els.dealer.innerHTML = '';
    els.player.innerHTML = '';
    dealerHand.forEach((c,i) => {
      const el = cardEl(c);
      el.style.animationDelay = `${i * 60}ms`;
      els.dealer.appendChild(el);
    });
    playerHand.forEach((c,i) => {
      const el = cardEl(c);
      el.style.animationDelay = `${i * 60}ms`;
      els.player.appendChild(el);
    });
    const dT = handTotals(dealerHand);
    const pT = handTotals(playerHand);
    els.dScore.textContent = dealerHand.some(c => c.faceDown) ? '?' : dT.best;
    els.pScore.textContent = pT.best;
    els.bank.textContent = bank;
    els.bet.textContent = bet;
    els.round.textContent = round;
    els.hit.disabled = !inRound;
    els.stand.disabled = !inRound;
    els.double.disabled = !inRound || bank < bet;
    els.deal.disabled = inRound || bet <= 0;
    els.clear.disabled = inRound || bet <= 0;
  }
  function message(txt, type = 'info') {
    els.msg.textContent = txt;
    if (txt) {
      els.msg.className = `status show ${type}`;
    } else {
      els.msg.className = 'status';
    }
  }
  function showPeek() {
    if (shoe.length < 4) return;
    els.peekPlayer.innerHTML = '';
    els.peekDealer.innerHTML = '';
    const next = shoe.slice(-4);
    const pCards = [next[3], next[1]];
    const dCards = [next[2], next[0]];
    pCards.forEach(c => els.peekPlayer.appendChild(cardEl(c)));
    dCards.forEach(c => els.peekDealer.appendChild(cardEl(c)));
    els.peek.classList.add('show');
  }
  function hidePeek() {
    els.peek.classList.remove('show');
    els.peekPlayer.innerHTML = '';
    els.peekDealer.innerHTML = '';

  }
  // Settle bets and update bankroll
  function settle() {
    const p = handTotals(playerHand).best;
    const d = handTotals(dealerHand).best;
    let outcome = '';
    if (isBust(playerHand)) outcome = 'lose';
    else if (isBust(dealerHand)) outcome = 'win';
    else if (p > d) outcome = 'win';
    else if (p < d) outcome = 'lose';
    else outcome = 'push';
    if (isBlackjack(playerHand) && !isBlackjack(dealerHand)) {
      const winAmt = Math.floor(bet * 1.5);
      bank += bet + winAmt;
      message(`Blackjack! You earn ${winAmt} flapjacks.`, 'win');

      play('win');
    } else {
      if (outcome === 'win') {
        bank += bet * 2;
        message(`You win ${bet} flapjacks.`, 'win');
        play('win');
      } else if (outcome === 'lose') {
        message(`You lose ${bet} flapjacks.`, 'lose');

        play('lose');
      } else {
        bank += bet;
        message('Push. Bet returned.', 'push');
        play('push');
      }
    }
    bet = 0;
    inRound = false;
    // Top up when broke
    if (bank <= 0) {
      bank = 500;
      message(`The kitchen refilled you to ${bank} flapjacks. Keep going.`, 'info');

    }
    round++;
    render();
    showPeek();
  }
  function dealerPlay() {
    setTimeout(() => {
      flipDealerHole();
      const playDraw = () => {
        const dBest = handTotals(dealerHand).best;
        if (dBest < 17) {
          setTimeout(() => {
            drawCard('dealer');
            playDraw();
          }, 550);
        } else {
          setTimeout(settle, 600);
        }
      };
      playDraw();
    }, 600);
  }
  function startRound() {
    if (inRound) return;
    if (bet <= 0) {
      message('Place a bet first.', 'info');
      return;
    }
    if (shoe.length < 30) {
      shoe = createShoe(6);

    }
    inRound = true;
    playerHand = [];
    dealerHand = [];
    message('');
    hidePeek();
    drawCard('player');
    drawCard('dealer', true);
    drawCard('player');
    drawCard('dealer');
    // Natural check after slight delay
    setTimeout(() => {
      const pBJ = isBlackjack(playerHand);
      const dBJ = isBlackjack(dealerHand);
      if (pBJ || dBJ) {
        flipDealerHole();
        if (pBJ && dBJ) {
          message('Both blackjack. Push.', 'push');
          bank += bet;
          bet = 0;
          inRound = false;
          play('push');
          render();
          return;
        }
        if (pBJ) {
          message('Player blackjack!', 'win');
          bank += Math.floor(bet * 2.5);
          bet = 0;
          inRound = false;
          play('win');
          render();
          return;
        }
        if (dBJ) {
          message('Dealer blackjack.', 'lose');
          bet = 0;
          inRound = false;
          play('lose');
          render();
          return;
        }
      }
      render();
    }, 700);
  }
  // Bet handling
  function addBet(n) {
    if (inRound) return;
    if (bank < n) {
      bank += 500;
      message(`The kitchen refilled you to ${bank} flapjacks.`, 'info');

    }
    bank -= n;
    bet += n;
    play('bet');
    render();
  }
  function clearBet() {
    if (inRound || bet <= 0) return;
    bank += bet;
    bet = 0;
    message('Bet cleared.', 'info');
    play('click');
    render();
  }
  // Button wiring
  els.deal.addEventListener('click', () => { play('click'); startRound(); });
  els.hit.addEventListener('click', () => {
    if (!inRound) return;
    drawCard('player');
    if (isBust(playerHand)) {
      message('Bust.', 'lose');
      setTimeout(() => {
        flipDealerHole();
        settle();
      }, 400);
    }
  });
  els.stand.addEventListener('click', () => {
    if (!inRound) return;
    message('Dealer’s turn.', 'info');
    dealerPlay();
  });
  els.double.addEventListener('click', () => {
    if (!inRound) return;
    bank -= bet;
    bet *= 2;
    render();
    drawCard('player');
    if (isBust(playerHand)) {
      message('Double and bust.', 'lose');
      setTimeout(() => {
        flipDealerHole();
        settle();
      }, 400);
    } else {
      dealerPlay();
    }
  });
  els.clear.addEventListener('click', clearBet);

  els.chips.forEach(c => c.addEventListener('click', () => addBet(Number(c.dataset.amt))));
  // Toggles
  els.sfxToggle.addEventListener('change', e => {
    sfxEnabled = e.target.checked;
  });
  els.keysToggle.addEventListener('change', () => {
    message(els.keysToggle.checked ? 'Keyboard on.' : 'Keyboard off.', 'info');
  });
  // Keyboard handlers
  window.addEventListener('keydown', e => {
    if (!els.keysToggle.checked) return;
    const k = e.key.toLowerCase();
    if (k === ' ') { e.preventDefault(); if (!inRound) els.deal.click(); }
    if (k === 'h') els.hit.click();
    if (k === 's') els.stand.click();
    if (k === 'd') els.double.click();
    if (k === 'c') els.clear.click();
    if (k === 'b') addBet(10);
  });
  // Initialise game
  shoe = createShoe(6);
  render();
})();