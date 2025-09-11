// Debug Diaries Blackjack Game Logic
//
// This script powers the blackjack game UI. It implements a six-deck shoe,
// betting with chips, hit/stand/double mechanics, automatic bankroll top-up
// and optional keyboard shortcuts. All audio is synthesised on the fly
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
  let bgOsc = null;
  let sfxEnabled = true;
  let musicEnabled = false;

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
  function bg(on) {
    if (on) {
      if (!bgOsc) {
        bgOsc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        bgOsc.type = 'sine';
        bgOsc.frequency.value = 220;
        gain.gain.value = 0.05; // quiet hum
        bgOsc.connect(gain).connect(audioCtx.destination);
        bgOsc.start();
      }
    } else {
      if (bgOsc) {
        bgOsc.stop();
        bgOsc = null;
      }
    }
  }

  // DOM references
  const els = {
    dealer: document.getElementById('dealer-cards'),
    player: document.getElementById('player-cards'),
    dScore: document.getElementById('dealer-score'),
    pScore: document.getElementById('player-score'),
    bank: document.getElementById('bank'),
    bet: document.getElementById('bet'),
    msg: document.getElementById('message'),
    deal: document.getElementById('deal'),
    hit: document.getElementById('hit'),
    stand: document.getElementById('stand'),
    double: document.getElementById('double'),
    clear: document.getElementById('clear-bet'),
    chips: Array.from(document.querySelectorAll('.chip')),
    newShoe: document.getElementById('new-shoe'),
    musicToggle: document.getElementById('music-toggle'),
    sfxToggle: document.getElementById('sfx-toggle'),
    keysToggle: document.getElementById('keys-toggle')
  };

  // Game state variables
  let shoe = [];
  let playerHand = [];
  let dealerHand = [];
  let bank = 1000;
  let bet = 0;
  let inRound = false;

  // Build a shuffled shoe with n decks
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
      el.style.transitionDelay = `${i * 60}ms`;
      els.dealer.appendChild(el);
    });
    playerHand.forEach((c,i) => {
      const el = cardEl(c);
      el.style.transitionDelay = `${i * 60}ms`;
      els.player.appendChild(el);
    });
    const dT = handTotals(dealerHand);
    const pT = handTotals(playerHand);
    els.dScore.textContent = dealerHand.some(c => c.faceDown) ? '?' : dT.best;
    els.pScore.textContent = pT.best;
    els.bank.textContent = bank;
    els.bet.textContent = bet;
    els.hit.disabled = !inRound;
    els.stand.disabled = !inRound;
    els.double.disabled = !inRound || bank < bet;
    els.deal.disabled = inRound || bet <= 0;
    els.clear.disabled = inRound || bet <= 0;
  }
  function message(txt) {
    els.msg.textContent = txt;
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
      message(`Blackjack! You win £${winAmt}.`);
      play('win');
    } else {
      if (outcome === 'win') {
        bank += bet * 2;
        message(`You win £${bet}.`);
        play('win');
      } else if (outcome === 'lose') {
        message(`You lose £${bet}.`);
        play('lose');
      } else {
        bank += bet;
        message('Push. Bet returned.');
        play('push');
      }
    }
    bet = 0;
    inRound = false;
    // Top up when broke
    if (bank <= 0) {
      bank = 500;
      message(`Topped you up to £${bank}. Keep going.`);
    }
    render();
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
      message('Place a bet first.');
      return;
    }
    if (shoe.length < 30) {
      shoe = createShoe(6);
      message('New shoe.');
    }
    inRound = true;
    playerHand = [];
    dealerHand = [];
    message('');
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
          message('Both blackjack. Push.');
          bank += bet;
          bet = 0;
          inRound = false;
          play('push');
          render();
          return;
        }
        if (pBJ) {
          message('Player blackjack!');
          bank += Math.floor(bet * 2.5);
          bet = 0;
          inRound = false;
          play('win');
          render();
          return;
        }
        if (dBJ) {
          message('Dealer blackjack.');
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
    bank -= n;
    bet += n;
    play('bet');
    if (bank < 0) message('Running on house credit. Win it back.');
    render();
  }
  function clearBet() {
    if (inRound || bet <= 0) return;
    bank += bet;
    bet = 0;
    message('Bet cleared.');
    play('click');
    render();
  }
  // Button wiring
  els.deal.addEventListener('click', () => { play('click'); startRound(); });
  els.hit.addEventListener('click', () => {
    if (!inRound) return;
    drawCard('player');
    if (isBust(playerHand)) {
      message('Bust.');
      setTimeout(() => {
        flipDealerHole();
        settle();
      }, 400);
    }
  });
  els.stand.addEventListener('click', () => {
    if (!inRound) return;
    message('Dealer’s turn.');
    dealerPlay();
  });
  els.double.addEventListener('click', () => {
    if (!inRound) return;
    bank -= bet;
    bet *= 2;
    render();
    drawCard('player');
    if (isBust(playerHand)) {
      message('Double and bust.');
      setTimeout(() => {
        flipDealerHole();
        settle();
      }, 400);
    } else {
      dealerPlay();
    }
  });
  els.clear.addEventListener('click', clearBet);
  els.newShoe.addEventListener('click', () => {
    shoe = createShoe(6);
    message('Shuffled a fresh shoe.');
    play('click');
  });
  els.chips.forEach(c => c.addEventListener('click', () => addBet(Number(c.dataset.amt))));
  // Toggles
  els.musicToggle.addEventListener('change', e => {
    musicEnabled = e.target.checked;
    bg(musicEnabled);
  });
  els.sfxToggle.addEventListener('change', e => {
    sfxEnabled = e.target.checked;
  });
  els.keysToggle.addEventListener('change', () => {
    message(els.keysToggle.checked ? 'Keyboard on.' : 'Keyboard off.');
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