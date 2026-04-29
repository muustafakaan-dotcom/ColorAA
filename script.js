// ============================================================
// ColorAA — Color Match Ring Game
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const forestImage = new Image();
forestImage.src = 'forest.png';

// ── Colors & Palettes ──
const PALETTES = {
    default: { id: 'default', name: 'Ana Palet', cost: 0, colors: ['#FF6B6B','#4ECDC4','#FFE66D','#7C5CFC','#F5E6CC','#6BCB77'] },
    neon: { id: 'neon', name: 'Neon Geceler', cost: 0, colors: ['#FF007F','#00FFFF','#39FF14','#FFD700','#FF6F00','#BF00FF'] },
    pastel: { id: 'pastel', name: 'Pastel Rüyası', cost: 0, colors: ['#FFB3BA','#FFDFBA','#FFFFBA','#BAFFC9','#BAE1FF','#E8BAFF'] },
    contrast: { id: 'contrast', name: 'Yüksek Kontrast', cost: 0, colors: ['#FF2A2A','#2A2AFF','#FFEA00','#00E676','#D500F9','#FF6D00'] }
};
const SHAPES = {
    default: { id: 'default', name: 'Daire', cost: 0, icon: '●' },
    star: { id: 'star', name: 'Yıldız', cost: 0, icon: '★' },
    hexagon: { id: 'hexagon', name: 'Altıgen', cost: 0, icon: '⬢' },
    heart: { id: 'heart', name: 'Kalp', cost: 0, icon: '♥' },
    triangle: { id: 'triangle', name: 'Üçgen', cost: 0, icon: '▲' },
    snowflake: { id: 'snowflake', name: 'Kar Tanesi', cost: 0, icon: '❄️', isEmoji: true },
    skull: { id: 'skull', name: 'Kuru Kafa', cost: 0, icon: '💀', isEmoji: true },
    jet: { id: 'jet', name: 'Jet Uçak', cost: 0, icon: '✈️', isEmoji: true },
    paw: { id: 'paw', name: 'Pati', cost: 0, icon: '🐾', isEmoji: true },
    bird: { id: 'bird', name: 'Kuş', cost: 0, icon: '🐦', isEmoji: true },
    sun: { id: 'sun', name: 'Güneş', cost: 0, icon: '☀️', isEmoji: true },
    note: { id: 'note', name: 'Nota', cost: 0, icon: '🎵', isEmoji: true },
    moon: { id: 'moon', name: 'Hilal', cost: 0, icon: '🌙', isEmoji: true },
    bone: { id: 'bone', name: 'Kemik', cost: 0, icon: '🦴', isEmoji: true },
    ghost: { id: 'ghost', name: 'Hayalet', cost: 0, icon: '👻', isEmoji: true },
    butterfly: { id: 'butterfly', name: 'Kelebek', cost: 0, icon: '🦋' },
    daisy: { id: 'daisy', name: 'Papatya', cost: 0, icon: '🌼', isEmoji: true },
    cross: { id: 'cross', name: 'X İşareti', cost: 0, icon: '❌', isEmoji: true },
    fire: { id: 'fire', name: 'Alev', cost: 0, icon: '🔥', isEmoji: true },
    passenger_plane: { id: 'passenger_plane', name: 'Yolcu Uçağı', cost: 0, icon: '✈️', isEmoji: true, rotation: -45 * Math.PI / 180 },
    letter: { id: 'letter', name: 'Mektup', cost: 0, icon: '✉️', isEmoji: true },
    umbrella: { id: 'umbrella', name: 'Şemsiye', cost: 0, icon: '☂️', isEmoji: true },
    dog: { id: 'dog', name: 'Köpek', cost: 0, icon: '🐶', isEmoji: true },
    cat: { id: 'cat', name: 'Kedi', cost: 0, icon: '🐱', isEmoji: true },
    car: { id: 'car', name: 'Araba', cost: 0, icon: '🚗', isEmoji: true },
    glass: { id: 'glass', name: 'Kadeh', cost: 0, icon: '🍷', isEmoji: true },
    leaf: { id: 'leaf', name: 'Yaprak', cost: 0, icon: '🍃', isEmoji: true },
    dollar: { id: 'dollar', name: 'Dolar', cost: 0, icon: '💲', isEmoji: true },
    euro: { id: 'euro', name: 'Euro', cost: 0, icon: '€', isEmoji: true },
    ok_hand: { id: 'ok_hand', name: 'Okey', cost: 0, icon: '👍', isEmoji: true },
    diamond: { id: 'diamond', name: 'Elmas', cost: 0, icon: '💎', isEmoji: true },
    lightning: { id: 'lightning', name: 'Şimşek', cost: 0, icon: '⚡', isEmoji: true },
    crown: { id: 'crown', name: 'Taç', cost: 0, icon: '👑', isEmoji: true },
    rocket: { id: 'rocket', name: 'Roket', cost: 0, icon: '🚀', isEmoji: true, rotation: -45 * Math.PI / 180 },
    anchor: { id: 'anchor', name: 'Çapa', cost: 0, icon: '⚓', isEmoji: true },
    clover: { id: 'clover', name: 'Yonca', cost: 0, icon: '🍀', isEmoji: true },
    invader: { id: 'invader', name: 'Uzaylı', cost: 0, icon: '👾', isEmoji: true },
    guitar: { id: 'guitar', name: 'Gitar', cost: 0, icon: '🎸', isEmoji: true },
    trophy: { id: 'trophy', name: 'Kupa', cost: 0, icon: '🏆', isEmoji: true },
    mushroom: { id: 'mushroom', name: 'Mantar', cost: 0, icon: '🍄', isEmoji: true }
};
const BACKGROUNDS = {
    default: { id: 'default', name: 'Standart', cost: 0, icon: '⬛' },
    grid: { id: 'grid', name: 'Retro Grid', cost: 0, icon: '▦' },
    space: { id: 'space', name: 'Uzay', cost: 0, icon: '✨' },
    radar: { id: 'radar', name: 'Sinyal', cost: 0, icon: '📡' },
    forest: { id: 'forest', name: 'Orman', cost: 0, icon: '🌲' }
};
const POWERUPS = {
    rainbow: { id: 'rainbow', name: 'Gökkuşağı', cost: 0, icon: '🌈' },
    shield: { id: 'shield', name: 'Kalkan', cost: 0, icon: '🛡️' },
    bomb: { id: 'bomb', name: 'Bomba', cost: 0, icon: '💣' }
};
let COLORS = PALETTES.default.colors;
let CURRENT_SHAPE = 'default';
let CURRENT_BG = 'default';
let bgStars = [];
const TOTAL_LEVELS = 80;

// ── Layout Config ──
let cfg = { ringRadius:120, ringWidth:28, ballRadius:13, ballSpeed:10, shooterY:600, centerX:0, centerY:0 };

// ── State ──
let G = {
    state:'home', mode:'campaign',
    level:1, score:0, maxCombo:0, combo:0,
    rotation:0, rotationSpeed:0.012, cx:0, cy:0,
    segments:[], ball:null, ballQueue:[],
    isShooting:false, particles:[],
    ringPulse:0, shakeTimer:0, shakeIntensity:0,
    loseFlash:0, shotsFired:0, totalSegments:0,
    activeRainbow: false, activeShield: false, shieldsUsedThisLevel: 0,
    activeBomb: false,
    endlessScore: 0, endlessHits: 0, endlessHiScore: 0, endlessColors: 3
};

let dpr=1, W=0, H=0;

// ── DOM ──
const $level   = document.getElementById('hud-level');
const $hud     = document.getElementById('hud');
const $combo   = document.getElementById('combo-popup');
const $comboTx = document.getElementById('combo-text');

const screens = {
    home:        document.getElementById('screen-home'),
    levels:      document.getElementById('screen-levels'),
    store:       document.getElementById('screen-store'),
    powerups:    document.getElementById('screen-powerups'),
    achievements:document.getElementById('screen-achievements'),
    wheel:       document.getElementById('screen-wheel'),
    gameover:    document.getElementById('screen-gameover'),
    levelup:     document.getElementById('screen-levelup'),
    settings:    document.getElementById('screen-settings'),
};

// ============================================================
// AUDIO SYSTEM
// ============================================================

let audioCtx = null;
let bgmInterval = null;
let bgmNextNoteTime = 0;
let bgmCurrentNote = 0;

// Mario-style upbeat retro frequencies (C Major)
const N_G3 = 196.00, N_A3 = 220.00, N_B3 = 246.94;
const N_C4 = 261.63, N_D4 = 293.66, N_E4 = 329.63, N_F4 = 349.23;
const N_G4 = 392.00, N_A4 = 440.00, N_B4 = 493.88, N_C5 = 523.25;
const N_D5 = 587.33, N_E5 = 659.25, N_F5 = 698.46, N_G5 = 783.99, N_A5 = 880.00, REST = 0;

const P_C = [N_C4, N_E4, N_G4, N_E4, N_C5, N_G4, N_E4, N_C4]; 
const P_F = [N_F4, N_A4, N_C5, N_A4, N_F5, N_C5, N_A4, N_F4];
const P_G = [N_G4, N_B4, N_D5, N_B4, N_G5, N_D5, N_B4, N_G4];
const P_Am = [N_A4, N_C5, N_E5, N_C5, N_A5, N_E5, N_C5, N_A4];
const P_C_desc = [N_C5, REST, N_G4, REST, N_E4, REST, N_C4, REST];
const P_G_desc = [N_G5, REST, N_D5, REST, N_B4, REST, N_G4, REST];
const P_F_desc = [N_F5, REST, N_C5, REST, N_A4, REST, N_F4, REST];
const P_Walk = [N_C4, N_D4, N_E4, N_F4, N_G4, N_A4, N_B4, N_C5];
const P_Walk_D = [N_C5, N_B4, N_A4, N_G4, N_F4, N_E4, N_D4, N_C4];

const patterns = [P_C, P_F, P_G, P_Am, P_C_desc, P_G_desc, P_F_desc, P_Walk, P_Walk_D];
const songStructure = [
    0, 0, 1, 1,  0, 0, 2, 2,  // Verse
    0, 3, 1, 2,  0, 3, 4, 5,  
    0, 7, 1, 8,  0, 7, 2, 5,  // Chorus
    3, 3, 1, 1,  2, 2, 4, 5,  
    0, 0, 1, 1,  0, 0, 2, 2,  // Verse 2
    0, 3, 1, 2,  0, 3, 6, 5,  
    0, 7, 1, 8,  0, 7, 2, 5,  // Chorus 2
    3, 3, 1, 1,  2, 2, 8, 4   // Outro walk down
];
let bgmNotes = [];
for(let p of songStructure) bgmNotes.push(...patterns[p]);
const bgmTempo = 150; 
const bgmNoteLength = (60.0 / bgmTempo) / 4; // 16th notes (fast and bouncy)

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        bgmNextNoteTime = audioCtx.currentTime + 0.1;
        bgmInterval = setInterval(scheduleBGM, 25);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Unlock audio on first interaction
window.addEventListener('mousedown', initAudio, { once: true });
window.addEventListener('touchstart', initAudio, { once: true });

function playTone(freq, type, duration, vol, slideFreq) {
    if (!audioSettings.sfx) return;
    if (!audioCtx || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    osc.frequency.setValueAtTime(freq, now);
    if (slideFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideFreq, now + duration);
    }
    
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
}

function playBGMNote(freq, time) {
    if (!audioSettings.bgm) return;
    if (!audioCtx || audioCtx.state === 'suspended' || freq === 0) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'square'; // Classic 8-bit Atari/Mario sound
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(freq, time);
    
    // Bouncy staccato envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.02, time + 0.01); // Sharp attack, very low volume 0.02
    gain.gain.exponentialRampToValueAtTime(0.001, time + bgmNoteLength * 0.8); // Quick decay for bounce
    
    osc.start(time);
    osc.stop(time + bgmNoteLength);
}

function scheduleBGM() {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    
    while (bgmNextNoteTime < audioCtx.currentTime + 0.1) {
        playBGMNote(bgmNotes[bgmCurrentNote], bgmNextNoteTime);
        bgmNextNoteTime += bgmNoteLength;
        bgmCurrentNote = (bgmCurrentNote + 1) % bgmNotes.length;
    }
}

function playSoundShoot() { playTone(300, 'sine', 0.1, 0.3, 100); }
function playSoundHit(combo) {
    const baseFreq = 120;
    const pitchShift = Math.min(combo * 15, 150); 
    // Slide down frequency to create a "dub / tok" sound
    playTone(baseFreq + pitchShift, 'sine', 0.15, 0.6, 40);
}
function playSoundError() { playTone(150, 'sawtooth', 0.3, 0.5, 50); }
function playSoundStar(starIndex) {
    const freqs = [0, 523.25, 659.25, 783.99]; 
    playTone(freqs[starIndex], 'sine', 0.3, 0.5);
    playTone(freqs[starIndex] * 2, 'triangle', 0.4, 0.2);
}
function playSoundLevelUp() {
    setTimeout(() => playTone(440, 'square', 0.1, 0.2), 0);
    setTimeout(() => playTone(554.37, 'square', 0.1, 0.2), 100);
    setTimeout(() => playTone(659.25, 'square', 0.3, 0.2), 200);
}
function playSoundTick() { playTone(800, 'square', 0.05, 0.05, 400); }
function playSoundRoulette() { playTone(1200, 'sine', 0.05, 0.1); }

// ============================================================
// PROGRESS & SETTINGS
// ============================================================
const SKEY = 'coloraa_progress';
const SETTINGS_KEY = 'coloraa_settings';
let audioSettings = { bgm: true, sfx: true };

function loadSettings() {
    try { 
        const s = JSON.parse(localStorage.getItem(SETTINGS_KEY)); 
        if (s) audioSettings = { ...audioSettings, ...s }; 
    } catch(e){}
    document.getElementById('toggle-bgm').checked = audioSettings.bgm;
    document.getElementById('toggle-sfx').checked = audioSettings.sfx;
    document.getElementById('toggle-theme').checked = (audioSettings.theme === 'light');
    document.body.classList.toggle('light-mode', audioSettings.theme === 'light');
}
function saveSettings() { 
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(audioSettings)); 
}

function loadProgress() {
    let p = { done:[], hi:{}, stars:{}, unlockedPalettes:['default'], equippedPalette:'default', unlockedShapes:['default'], equippedShape:'default', unlockedBackgrounds:['default'], equippedBackground:'default', starsSpent:0, inventory:{ rainbow: 0, shield: 0, bomb: 0 } };
    try { 
        const d = JSON.parse(localStorage.getItem(SKEY)); 
        if(d && d.done) { 
            if(!d.stars) d.stars={}; 
            if(!d.unlockedPalettes) d.unlockedPalettes=['default'];
            if(!d.equippedPalette) d.equippedPalette='default';
            if(!d.unlockedShapes) d.unlockedShapes=['default'];
            if(!d.equippedShape) d.equippedShape='default';
            if(!d.unlockedBackgrounds) d.unlockedBackgrounds=['default'];
            if(!d.equippedBackground) d.equippedBackground='default';
            if(!d.inventory) d.inventory={ rainbow: 0, shield: 0, bomb: 0 };
            if(d.inventory.bomb === undefined) d.inventory.bomb = 0;
            if(d.starsSpent === undefined) d.starsSpent=0;
            return d; 
        } 
    } catch(e){}
    return p;
}
function saveProgress(p) { localStorage.setItem(SKEY, JSON.stringify(p)); }

function markDone(lvl, stars) {
    const p = loadProgress();
    if (!p.done.includes(lvl)) p.done.push(lvl);
    p.stars[lvl] = Math.max(p.stars[lvl] || 0, stars);
    saveProgress(p);
}

function highestPlayable() {
    const p = loadProgress();
    if (p.done.length === 0) return 1;
    return Math.min(Math.max(...p.done) + 1, TOTAL_LEVELS);
}

function isUnlocked(lvl) {
    return true; // TODO: restore lock logic after testing
}

function isDone(lvl) { return loadProgress().done.includes(lvl); }

// ============================================================
// LEVEL SELECT GRID
// ============================================================

function buildGrid() {
    const grid = document.getElementById('levels-grid');
    grid.innerHTML = '';
    const highest = highestPlayable();
    const p = loadProgress();

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const btn = document.createElement('button');
        btn.className = 'lvl-circle';

        const done = p.done.includes(i);
        const unlocked = isUnlocked(i);

        if (i === highest && !done) {
            btn.classList.add('current');
        } else if (done) {
            btn.classList.add('done');
        } else if (unlocked) {
            btn.classList.add('current');
        } else {
            btn.classList.add('locked');
        }

        let subHtml = '';
        if (done) {
            const stars = p.stars[i] || 1;
            subHtml = '<div class="lvl-stars-mini">';
            for(let k=1; k<=3; k++) subHtml += `<span class="star-mini${k<=stars ? ' active' : ''}">★</span>`;
            subHtml += '</div>';
        } else {
            subHtml = `<span class="lvl-sub">${unlocked ? 'OYNA' : '🔒'}</span>`;
        }

        btn.innerHTML = `
            <span class="lvl-num">${i}</span>
            ${subHtml}
        `;

        if (unlocked || done) {
            btn.addEventListener('click', (e) => { e.stopPropagation(); startLevel(i); });
        }

        grid.appendChild(btn);
    }
}

// ============================================================
// SCREEN MANAGEMENT
// ============================================================

function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    if (screens[name]) screens[name].classList.remove('hidden');
    $hud.classList.toggle('hud-hidden', name !== null);
}

function getTotalStars() {
    const p = loadProgress();
    let total = 0;
    for (const lvl in p.stars) {
        total += p.stars[lvl] || 0;
    }
    return total - (p.starsSpent || 0);
}

function showHome() {
    G.state = 'home';
    showScreen('home');
    const totalStarsEl = document.getElementById('total-stars-count');
    if (totalStarsEl) {
        totalStarsEl.textContent = getTotalStars();
    }
    updateDailyButton();
}

function showLevels() {
    G.state = 'levels';
    buildGrid();
    showScreen('levels');
}

function showStore() {
    G.state = 'store';
    renderStore();
    showScreen('store');
    const storeStarsEl = document.getElementById('store-stars-count');
    if (storeStarsEl) {
        storeStarsEl.textContent = getTotalStars();
    }
}

function renderStore() {
    const list = document.getElementById('store-list');
    if (!list) return;
    list.innerHTML = '';
    const p = loadProgress();
    const availableStars = getTotalStars();
    
    const palettesHeader = document.createElement('h3');
    palettesHeader.className = 'store-section-title';
    palettesHeader.textContent = 'RENK TEMALARI';
    list.appendChild(palettesHeader);

    Object.values(PALETTES).forEach(pal => {
        const isUnlocked = p.unlockedPalettes.includes(pal.id);
        const isEquipped = p.equippedPalette === pal.id;
        
        const card = document.createElement('div');
        card.className = `palette-card ${isEquipped ? 'equipped' : ''}`;
        
        let colorDots = '';
        pal.colors.forEach(c => {
            colorDots += `<div class="color-dot" style="background:${c}"></div>`;
        });
        
        let btnHtml = '';
        if (isEquipped) {
            btnHtml = `<button class="btn-equipped" disabled>KULLANILIYOR</button>`;
        } else if (isUnlocked) {
            btnHtml = `<button class="btn-equip" onclick="equipPalette('${pal.id}')">KULLAN</button>`;
        } else {
            const canAfford = availableStars >= pal.cost;
            btnHtml = `<button class="btn-buy" ${canAfford ? '' : 'disabled'} onclick="buyPalette('${pal.id}')">${pal.cost} ★ İLE AÇ</button>`;
        }
        
        card.innerHTML = `
            <div class="palette-header">
                <span class="palette-name">${pal.name}</span>
                <div class="palette-colors">${colorDots}</div>
            </div>
            ${btnHtml}
        `;
        list.appendChild(card);
    });

    const shapesHeader = document.createElement('h3');
    shapesHeader.className = 'store-section-title';
    shapesHeader.textContent = 'TOP ŞEKİLLERİ';
    shapesHeader.style.marginTop = '24px';
    list.appendChild(shapesHeader);

    const grid = document.createElement('div');
    grid.className = 'shape-grid';

    Object.values(SHAPES).forEach(shape => {
        const isUnlocked = p.unlockedShapes.includes(shape.id);
        const isEquipped = p.equippedShape === shape.id;

        const tile = document.createElement('div');
        let stateClass = isEquipped ? 'shape-tile equipped' : isUnlocked ? 'shape-tile unlocked' : 'shape-tile locked';
        tile.className = stateClass;
        tile.title = shape.name;

        const rotStyle = shape.rotation ? `transform: rotate(${shape.rotation}rad); display: inline-block;` : '';
        tile.innerHTML = `
            <span class="shape-tile-icon" style="${rotStyle}">${shape.icon}</span>
            <span class="shape-tile-name">${shape.name}</span>
            ${isEquipped ? '<span class="shape-tile-badge equipped-badge">✓</span>' : ''}
            ${!isUnlocked ? `<span class="shape-tile-badge locked-badge">${shape.cost}★</span>` : ''}
        `;

        tile.addEventListener('click', () => {
            if (isEquipped) return;
            if (isUnlocked) {
                equipShape(shape.id);
            } else {
                buyShape(shape.id);
            }
        });

        grid.appendChild(tile);
    });

    list.appendChild(grid);

    const bgHeader = document.createElement('h3');
    bgHeader.className = 'store-section-title';
    bgHeader.textContent = 'ARKA PLANLAR';
    bgHeader.style.marginTop = '24px';
    list.appendChild(bgHeader);

    Object.values(BACKGROUNDS).forEach(bg => {
        const isUnlocked = p.unlockedBackgrounds.includes(bg.id);
        const isEquipped = p.equippedBackground === bg.id;
        const card = document.createElement('div');
        card.className = `palette-card ${isEquipped ? 'equipped' : ''}`;
        
        let btnHtml = '';
        if (isEquipped) {
            btnHtml = `<button class="btn-equipped" disabled>KULLANILIYOR</button>`;
        } else if (isUnlocked) {
            btnHtml = `<button class="btn-equip" onclick="equipBackground('${bg.id}')">KULLAN</button>`;
        } else {
            const canAfford = availableStars >= bg.cost;
            btnHtml = `<button class="btn-buy" ${canAfford ? '' : 'disabled'} onclick="buyBackground('${bg.id}')">${bg.cost} ★ İLE AÇ</button>`;
        }
                     
        card.innerHTML = `
            <div class="palette-header">
                <span class="palette-name"><span style="color:var(--teal);margin-right:8px">${bg.icon}</span>${bg.name}</span>
            </div>
            ${btnHtml}
        `;
        list.appendChild(card);
    });
}

function showPowerups() {
    G.state = 'powerups';
    renderPowerups();
    showScreen('powerups');
    const puStarsEl = document.getElementById('powerups-stars-count');
    if (puStarsEl) puStarsEl.textContent = getTotalStars();
}

function renderPowerups() {
    const list = document.getElementById('powerups-list');
    if (!list) return;
    list.innerHTML = '';
    const p = loadProgress();
    const availableStars = getTotalStars();

    Object.values(POWERUPS).forEach(pu => {
        const card = document.createElement('div');
        card.className = 'palette-card';
        
        const canAfford = availableStars >= pu.cost;
        const btnHtml = `<button class="btn-buy" ${canAfford ? '' : 'disabled'} onclick="buyPowerup('${pu.id}')">${pu.cost} ★ İLE AL</button>`;
                     
        card.innerHTML = `
            <div class="palette-header">
                <span class="palette-name"><span style="color:var(--teal);margin-right:8px">${pu.icon}</span>${pu.name}</span>
                <span style="font-size:12px; color:var(--text-dim); margin-left:auto;">Envanter: ${p.inventory[pu.id]}</span>
            </div>
            ${btnHtml}
        `;
        list.appendChild(card);
    });
}

window.buyPowerup = function(id) {
    const p = loadProgress();
    const availableStars = getTotalStars();
    const pu = POWERUPS[id];
    
    if (availableStars >= pu.cost) {
        p.inventory[id] = (p.inventory[id] || 0) + 1;
        p.starsSpent = (p.starsSpent || 0) + pu.cost;
        saveProgress(p);
        renderPowerups();
        
        const puStarsEl = document.getElementById('powerups-stars-count');
        if (puStarsEl) puStarsEl.textContent = getTotalStars();
        const mainStarsEl = document.getElementById('total-stars-count');
        if (mainStarsEl) mainStarsEl.textContent = getTotalStars();
    }
};

window.equipBackground = function(id) {
    const p = loadProgress();
    if (p.unlockedBackgrounds.includes(id)) {
        p.equippedBackground = id;
        saveProgress(p);
        CURRENT_BG = id;
        renderStore();
    }
};

window.buyBackground = function(id) {
    const p = loadProgress();
    const availableStars = getTotalStars();
    const bg = BACKGROUNDS[id];
    
    if (!p.unlockedBackgrounds.includes(id) && availableStars >= bg.cost) {
        p.unlockedBackgrounds.push(id);
        p.starsSpent = (p.starsSpent || 0) + bg.cost;
        p.equippedBackground = id;
        saveProgress(p);
        CURRENT_BG = id;
        renderStore();
        
        const storeStarsEl = document.getElementById('store-stars-count');
        if (storeStarsEl) storeStarsEl.textContent = getTotalStars();
        const mainStarsEl = document.getElementById('total-stars-count');
        if (mainStarsEl) mainStarsEl.textContent = getTotalStars();
    }
};

window.equipShape = function(id) {
    const p = loadProgress();
    if (p.unlockedShapes.includes(id)) {
        p.equippedShape = id;
        saveProgress(p);
        CURRENT_SHAPE = id;
        renderStore();
    }
};

window.buyShape = function(id) {
    const p = loadProgress();
    const availableStars = getTotalStars();
    const shape = SHAPES[id];
    
    if (!p.unlockedShapes.includes(id) && availableStars >= shape.cost) {
        p.unlockedShapes.push(id);
        p.starsSpent = (p.starsSpent || 0) + shape.cost;
        p.equippedShape = id;
        saveProgress(p);
        CURRENT_SHAPE = id;
        renderStore();
        
        const storeStarsEl = document.getElementById('store-stars-count');
        if (storeStarsEl) storeStarsEl.textContent = getTotalStars();
        const mainStarsEl = document.getElementById('total-stars-count');
        if (mainStarsEl) mainStarsEl.textContent = getTotalStars();
    }
};

window.equipPalette = function(id) {
    const p = loadProgress();
    if (p.unlockedPalettes.includes(id)) {
        p.equippedPalette = id;
        saveProgress(p);
        COLORS = PALETTES[id].colors;
        renderStore();
    }
};

window.buyPalette = function(id) {
    const p = loadProgress();
    const availableStars = getTotalStars();
    const pal = PALETTES[id];
    
    if (!p.unlockedPalettes.includes(id) && availableStars >= pal.cost) {
        p.unlockedPalettes.push(id);
        p.starsSpent = (p.starsSpent || 0) + pal.cost;
        p.equippedPalette = id;
        saveProgress(p);
        COLORS = PALETTES[id].colors;
        renderStore();
        
        const storeStarsEl = document.getElementById('store-stars-count');
        if (storeStarsEl) storeStarsEl.textContent = getTotalStars();
        
        const mainStarsEl = document.getElementById('total-stars-count');
        if (mainStarsEl) mainStarsEl.textContent = getTotalStars();
    }
};

// ============================================================
// RESIZE
// ============================================================

function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W+'px'; canvas.style.height = H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cfg.centerX = W/2;
    cfg.centerY = H*0.38;
    cfg.ringRadius = Math.min(W,H)*0.20;
    cfg.ringWidth  = cfg.ringRadius*0.12;
    cfg.ballRadius = cfg.ringWidth*0.44;
    cfg.ballSpeed  = H*0.016;
    cfg.shooterY   = H*0.80;

    bgStars = [];
    for(let i=0; i<80; i++) {
        bgStars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.5 + 0.5,
            a: Math.random() * 0.8 + 0.2,
            v: Math.random() * 0.5 + 0.1
        });
    }
}
window.addEventListener('resize', resize);
resize();

// ============================================================
// SEEDED RANDOM (deterministic levels)
// ============================================================

function seededRng(seed) {
    let s = seed;
    return function() {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function seededShuffle(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// ============================================================
// LEVEL CONFIG
// ============================================================

// Returns { numColors, numSegments, speed } for each level
function getLevelConfig(lvl) {
    if (lvl <= 10) {
        // Tutorial / easy levels
        const colors = Math.min(lvl, 3);        // 1→1, 2→2, 3→3, 4-10→3
        const segs   = 6 + lvl;                  // 7..16
        const speed  = 0.006 + (lvl - 1) * 0.001; // very slow ramp
        return { numColors: colors, numSegments: segs, speed };
    } else {
        // Normal levels 11-80
        let t = (lvl - 1) % 10 + 1; // 1..10 ramp for each 10-level block
        const overall_t = lvl > 20 ? 10 : (lvl - 10); // cap colors and segments at level 20's difficulty for 21-80
        const colors = Math.min(3 + Math.floor(overall_t / 3), COLORS.length); // 3→6
        const segs   = 14 + overall_t * 2;               // capped at 24
        const speed  = Math.min(0.012 + (t - 1) * 0.003, 0.023);  // cap at 0.023
        return { numColors: colors, numSegments: Math.min(segs, 24), speed };
    }
}

// ============================================================
// LEVEL GENERATION (deterministic)
// ============================================================

function generateLevel(lvl) {
    G.segments=[]; G.rotation=0; G.isShooting=false;
    G.combo=0; G.particles=[]; G.ringPulse=0;
    G.shotsFired=0;
    G.activeRainbow=false; G.activeShield=false; G.shieldsUsedThisLevel=0;
    G.activeBomb=false;

    const rng = seededRng(lvl * 7919);  // deterministic seed per level
    const cfg_lvl = getLevelConfig(lvl);

    G.rotationSpeed = cfg_lvl.speed * (lvl % 2 === 0 ? -1 : 1);

    const pal = COLORS.slice(0, cfg_lvl.numColors);
    const nS  = cfg_lvl.numSegments;
    G.totalSegments = nS;
    const sa  = (Math.PI * 2) / nS;

    const cl = [];
    for (let i = 0; i < nS; i++) cl.push(pal[i % cfg_lvl.numColors]);
    seededShuffle(cl, rng);

    for (let i = 0; i < nS; i++) {
        G.segments.push({ start: i * sa, end: (i + 1) * sa, color: cl[i], originalColor: cl[i], alive: true, isTrap: false });
    }

    if (lvl > 50 && lvl <= 60) {
        const numTraps = 2;
        let trapIndices = [];
        for(let i=0; i<nS; i++) trapIndices.push(i);
        seededShuffle(trapIndices, rng);
        for(let i=0; i<numTraps; i++) {
            G.segments[trapIndices[i]].isTrap = true;
            G.segments[trapIndices[i]].color = '#1a1a24';
        }
    }

    G.ballQueue = [];
    for (let i = 0; i < 4; i++) G.ballQueue.push(pickColor());
    spawnBall();
    refreshHUD();
}

// ============================================================
// BALL
// ============================================================

function pickColor() {
    const a = [...new Set(G.segments.filter(s=>s.alive && !s.isTrap).map(s=>s.color))];
    return a.length>0 ? a[Math.floor(Math.random()*a.length)] : COLORS[0];
}

function spawnBall() {
    const c = G.ballQueue.shift();
    G.ballQueue.push(pickColor());
    G.ball = { x:cfg.centerX, y:cfg.shooterY, color:c, vy:0, trail:[] };
    G.isShooting = false;
    G.colorLastChange = Date.now(); // Reset timer for the new ball
}

function shoot() {
    if (G.isShooting || G.state!=='playing' || !G.ball) return;
    G.isShooting = true;
    G.shotsFired++;
    G.ball.vy = -cfg.ballSpeed;
    if (audioCtx) initAudio();
    playSoundShoot();
}

// ============================================================
// COLLISION
// ============================================================

function checkHit(isTop) {
    const dy = G.ball.y - G.cy;
    const dx = G.ball.x - G.cx;
    let hitAngle = Math.atan2(dy, dx);
    let la = hitAngle - G.rotation;
    la = ((la%(Math.PI*2)) + Math.PI*2) % (Math.PI*2);

    let hit = null;
    for (const seg of G.segments) {
        if (!seg.alive) continue;
        let s = ((seg.start%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
        let e = ((seg.end  %(Math.PI*2))+Math.PI*2)%(Math.PI*2);
        if (s<e) { if (la>=s && la<e) { hit=seg; break; } }
        else     { if (la>=s || la<e) { hit=seg; break; } }
    }

    if (!hit) {
        if (isTop) G.ball.passedTop = true;
        else G.ball.passedBottom = true;
        return;
    }

    G.ball.vy = 0;
    const R = isTop ? (cfg.ringRadius - cfg.ringWidth / 2) : (cfg.ringRadius + cfg.ringWidth / 2);
    if (R*R >= dx*dx) {
        const hdy = Math.sqrt(R*R - dx*dx);
        G.ball.y = G.cy + (isTop ? -hdy : hdy);
    }
    G.isShooting = false;

    if (hit.isTrap) {
        G.combo = 0;
        playSoundError();
        G.shakeTimer = 20;
        G.shakeIntensity = 12;
        G.loseFlash = 1.0;
        emitParticles(G.ball.x, G.ball.y, '#FF3B3B', 20);
        G.state = 'dead';
        if (G.mode === 'endless') {
            setTimeout(() => { if (G.state === 'dead') showEndlessGameOver(); }, 800);
        } else {
            setTimeout(() => { if (G.state === 'dead') startLevel(G.level); }, 800);
        }
        return;
    }

    if (hit.color === G.ball.color || G.activeRainbow) {
        // ✅ Correct
        hit.alive = false;
        G.activeRainbow = false;
        G.combo++;
        if (G.combo > G.maxCombo) {
            G.maxCombo = G.combo;
            const achD = loadAchData();
            if (G.maxCombo > (achD.maxComboEver || 0)) {
                achD.maxComboEver = G.maxCombo;
                saveAchData(achD);
            }
        }
        if (G.mode === 'endless') {
            G.endlessScore += Math.max(1, G.combo);
        }
        playSoundHit(G.combo);
        G.ringPulse = 1;

        // Update queue colors to only contain alive colors
        const aliveColors = [...new Set(G.segments.filter(s=>s.alive && !s.isTrap).map(s=>s.color))];
        if (aliveColors.length > 0) {
            for (let i=0; i<G.ballQueue.length; i++) {
                if (!aliveColors.includes(G.ballQueue[i])) {
                    G.ballQueue[i] = aliveColors[Math.floor(Math.random()*aliveColors.length)];
                }
            }
        }

        // Change rotation direction on every hit for levels 21-30
        if (G.level > 20 && G.level <= 30) {
            G.rotationSpeed = -G.rotationSpeed;
        }

        const ma = (hit.start+hit.end)/2 + G.rotation;
        emitParticles(G.cx+Math.cos(ma)*cfg.ringRadius, G.cy+Math.sin(ma)*cfg.ringRadius, hit.color, 18);

        // Bomb: destroy adjacent segments
        if (G.activeBomb) {
            G.activeBomb = false;
            const hitIdx = G.segments.indexOf(hit);
            const nS = G.segments.length;
            for (let offset = -1; offset <= 1; offset++) {
                if (offset === 0) continue; // already destroyed
                const adjIdx = (hitIdx + offset + nS) % nS;
                const adj = G.segments[adjIdx];
                if (adj.alive && !adj.isTrap) {
                    adj.alive = false;
                    const adjMa = (adj.start+adj.end)/2 + G.rotation;
                    emitParticles(G.cx+Math.cos(adjMa)*cfg.ringRadius, G.cy+Math.sin(adjMa)*cfg.ringRadius, adj.color, 18);
                }
            }
            G.shakeTimer = 15;
            G.shakeIntensity = 10;
        }

        if (G.combo>=2) showCombo(G.combo);

        if (G.segments.filter(s=>!s.isTrap).every(s=>!s.alive)) {
            if (G.mode === 'endless') {
                // Endless: refill ring with more segments
                G.endlessHits += G.segments.filter(s=>!s.isTrap).length;
                G.endlessScore += G.segments.filter(s=>!s.isTrap).length * Math.max(1, G.combo);
                
                // Increase difficulty
                const absSpeed = Math.abs(G.rotationSpeed);
                const newSpeed = Math.min(absSpeed * 1.1, 0.035);
                G.rotationSpeed = G.rotationSpeed > 0 ? newSpeed : -newSpeed;
                
                // Add more colors every 25 hits
                if (G.endlessHits >= G.endlessColors * 25 - 50 && G.endlessColors < COLORS.length) {
                    G.endlessColors++;
                }
                
                generateEndlessRing();
                playSoundLevelUp();
                refreshHUD();
                return;
            }

            G.state = 'levelup';
            playSoundLevelUp();
            
            let stars = 1;
            if (G.shotsFired <= G.totalSegments) stars = 3;
            else if (G.shotsFired <= G.totalSegments + 3) stars = 2;
            
            markDone(G.level, stars);
            document.getElementById('completed-level').textContent = G.level;
            
            const starsContainer = document.getElementById('level-stars');
            starsContainer.innerHTML = '';
            for (let i = 1; i <= 3; i++) {
                const star = document.createElement('span');
                star.className = 'star' + (i <= stars ? ' active' : '');
                star.textContent = '★';
                star.style.animationDelay = `${(i-1)*0.15}s`;
                starsContainer.appendChild(star);
                
                if (i <= stars) {
                    setTimeout(() => playSoundStar(i), (i-1) * 150 + 300);
                }
            }

            document.getElementById('btn-nextlevel').style.display = G.level>=TOTAL_LEVELS ? 'none' : '';
            showScreen('levelup');
            refreshHUD();
            return;
        }
        refreshHUD();
        spawnBall();
    } else {
        // ❌ Wrong color
        if (G.activeShield) {
            G.activeShield = false;
            G.shieldsUsedThisLevel++;
            playSoundError();
            emitParticles(G.ball.x, G.ball.y, '#4ECDC4', 20); // Cyan shield break
            G.combo = 0;
            G.shakeTimer = 10;
            G.shakeIntensity = 5;
            // Track for achievement
            const achD = loadAchData(); achD.shieldUsed = true; saveAchData(achD);
            spawnBall();
            refreshHUD();
            return;
        }

        G.combo = 0;
        playSoundError();
        G.shakeTimer = 20;
        G.shakeIntensity = 12;
        G.loseFlash = 1.0;
        emitParticles(G.ball.x, G.ball.y, '#FF3B3B', 20);
        G.state = 'dead';

        if (G.mode === 'endless') {
            setTimeout(() => { if (G.state === 'dead') showEndlessGameOver(); }, 800);
        } else {
            setTimeout(() => { if (G.state === 'dead') startLevel(G.level); }, 800);
        }
    }
}

// ============================================================
// PARTICLES & COMBO
// ============================================================

function emitParticles(x,y,color,n) {
    for (let i=0;i<n;i++) {
        const a=Math.random()*Math.PI*2, sp=Math.random()*4+1.5;
        G.particles.push({ x,y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, color, alpha:1, size:Math.random()*4+2, life:1 });
    }
}

function showCombo(n) {
    $comboTx.textContent = `x${n} KOMBO!`;
    $combo.classList.remove('hidden');
    $comboTx.style.animation = 'none';
    void $comboTx.offsetHeight;
    $comboTx.style.animation = '';
    setTimeout(()=> $combo.classList.add('hidden'), 900);
}

function refreshHUD() { 
    if (G.mode === 'endless') {
        document.querySelector('#hud .hud-label').textContent = 'SKOR';
        $level.textContent = G.endlessScore;
    } else {
        document.querySelector('#hud .hud-label').textContent = 'BÖLÜM';
        $level.textContent = G.level;
    }
    const p = loadProgress();
    
    const countRainbow = document.getElementById('pu-count-rainbow');
    const countShield = document.getElementById('pu-count-shield');
    if (countRainbow) countRainbow.textContent = p.inventory.rainbow;
    if (countShield) countShield.textContent = p.inventory.shield;

    const btnRainbow = document.getElementById('btn-pu-rainbow');
    if (btnRainbow) {
        if (G.activeRainbow) btnRainbow.classList.add('active-pu');
        else btnRainbow.classList.remove('active-pu');
        btnRainbow.disabled = p.inventory.rainbow <= 0 && !G.activeRainbow;
    }

    const btnShield = document.getElementById('btn-pu-shield');
    if (btnShield) {
        if (G.activeShield) btnShield.classList.add('active-pu');
        else btnShield.classList.remove('active-pu');
        btnShield.disabled = (p.inventory.shield <= 0 && !G.activeShield) || G.shieldsUsedThisLevel >= 2;
    }

    const countBomb = document.getElementById('pu-count-bomb');
    if (countBomb) countBomb.textContent = p.inventory.bomb;
    const btnBomb = document.getElementById('btn-pu-bomb');
    if (btnBomb) {
        if (G.activeBomb) btnBomb.classList.add('active-pu');
        else btnBomb.classList.remove('active-pu');
        btnBomb.disabled = p.inventory.bomb <= 0 && !G.activeBomb;
    }
}

// ============================================================
// DYNAMIC TRAPS
// ============================================================

function shiftTraps() {
    let traps = [];
    for (let i=0; i<G.segments.length; i++) {
        if (G.segments[i].isTrap) traps.push(i);
    }
    
    for (let i of traps) {
        G.segments[i].isTrap = false;
        G.segments[i].color = G.segments[i].originalColor;
    }
    
    let dir = G.rotationSpeed > 0 ? 1 : -1;
    let nS = G.segments.length;
    let newTraps = [];
    
    for (let i of traps) {
        let nextIdx = i;
        for (let offset = 1; offset <= nS; offset++) {
            let idx = (i + dir * offset + nS * nS) % nS;
            if (G.segments[idx].alive && !newTraps.includes(idx)) {
                nextIdx = idx;
                break;
            }
        }
        newTraps.push(nextIdx);
    }
    
    for (let idx of newTraps) {
        G.segments[idx].isTrap = true;
        G.segments[idx].color = '#1a1a24';
    }
}

// ============================================================
// UPDATE
// ============================================================

function update() {
    if (G.state!=='playing' && G.state!=='dead') return;
    
    G.cx = cfg.centerX;
    G.cy = cfg.centerY;

    if (G.state === 'playing') {
        let speedMult = 1;
        if (G.level > 40 && G.level <= 50) {
            // Sine wave speed multiplier: goes from 0.15 to 1.85 smoothly
            speedMult = 1 + 0.85 * Math.sin(Date.now() * 0.0025);
        }
        
        if (G.level > 70 && G.level <= 80) {
            G.continuousRotation = (G.continuousRotation || G.rotation) + G.rotationSpeed;
            const newRot = Math.round(G.continuousRotation / (Math.PI/12)) * (Math.PI/12);
            if (newRot !== G.rotation) {
                G.rotation = newRot;
                playSoundTick();
            }
        } else {
            G.rotation += G.rotationSpeed * speedMult;
        }
    }
    if (G.ringPulse>0) G.ringPulse*=0.9;
    if (G.shakeTimer>0) { G.shakeTimer--; G.shakeIntensity*=0.85; }
    if (G.loseFlash>0) G.loseFlash -= 0.025;
    
    // Dynamic Traps for 51-60
    if (G.state === 'playing' && G.level > 50 && G.level <= 60) {
        if (!G.trapShiftLastChange) G.trapShiftLastChange = Date.now();
        if (Date.now() - G.trapShiftLastChange > 1500) {
            G.trapShiftLastChange = Date.now();
            shiftTraps();
        }
    }

    // Color Roulette for 61-70
    if (G.state === 'playing' && G.level > 60 && G.level <= 70 && G.ball && !G.isShooting) {
        if (!G.colorLastChange) G.colorLastChange = Date.now();
        if (Date.now() - G.colorLastChange > 3000) {
            G.colorLastChange = Date.now();
            const aliveColors = [...new Set(G.segments.filter(s=>s.alive && !s.isTrap).map(s=>s.color))];
            if (aliveColors.length > 1) {
                let idx = aliveColors.indexOf(G.ball.color);
                if (idx === -1) idx = 0;
                G.ball.color = aliveColors[(idx + 1) % aliveColors.length];
                playSoundRoulette();
            }
        }
    }

    if (G.ball && G.isShooting) {
        let oldY = G.ball.y;
        G.ball.y += G.ball.vy;
        G.ball.trail.push({x:G.ball.x, y:G.ball.y, a:1});
        if (G.ball.trail.length>12) G.ball.trail.shift();

        const rOuter = cfg.ringRadius + cfg.ringWidth/2;
        const rInner = cfg.ringRadius - cfg.ringWidth/2;
        const d = Math.hypot(G.ball.x - G.cx, G.ball.y - G.cy);
        const oldD = Math.hypot(G.ball.x - G.cx, oldY - G.cy);

        if (!G.ball.passedBottom && oldD > rOuter && d <= rOuter) {
            checkHit(false);
        } else if (G.ball.passedBottom && !G.ball.passedTop && oldD < rInner && d >= rInner && G.ball.y < G.cy) {
            checkHit(true);
        }
        
        if (G.ball && G.ball.y<-50) {
            if (!G.ball.passedBottom || !G.ball.passedTop) {
                // Completely missed the ring or flew through an empty ring without hitting the top
                G.ball.vy = 0;
                G.combo = 0;
                G.shakeTimer = 20;
                G.shakeIntensity = 12;
                G.loseFlash = 1.0;
                G.state = 'dead';
                setTimeout(() => { if (G.state === 'dead') startLevel(G.level); }, 800);
            } else {
                spawnBall();
            }
        }
    }

    if (G.ball) {
        G.ball.trail.forEach(t=> t.a-=0.09);
        G.ball.trail = G.ball.trail.filter(t=> t.a>0);
    }

    for (const p of G.particles) {
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.05;
        p.life-=0.025; p.alpha=Math.max(0,p.life); p.size*=0.98;
    }
    G.particles = G.particles.filter(p=> p.life>0);
}

// ============================================================
// DRAW
// ============================================================

function draw() {
    ctx.clearRect(0,0,W,H);
    const isLight = document.body.classList.contains('light-mode');
    const bg = ctx.createRadialGradient(cfg.centerX,cfg.centerY,0, cfg.centerX,cfg.centerY,Math.max(W,H)*0.7);
    if (isLight) {
        bg.addColorStop(0,'#ffffff'); bg.addColorStop(1,'#f4f6fb');
    } else {
        bg.addColorStop(0,'#10121a'); bg.addColorStop(1,'#08090d');
    }
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    if (CURRENT_BG === 'grid') {
        ctx.save();
        ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        const offset = (Date.now() * 0.02) % gridSize;
        ctx.beginPath();
        for (let x = 0; x < W; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
        for (let y = offset; y < H; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
        ctx.stroke();
        ctx.restore();
    } else if (CURRENT_BG === 'space') {
        ctx.save();
        ctx.fillStyle = isLight ? '#000' : '#fff';
        for (let s of bgStars) {
            ctx.globalAlpha = s.a;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
            if (G.state === 'playing') s.y += s.v;
            if (s.y > H) s.y = 0;
        }
        ctx.restore();
    } else if (CURRENT_BG === 'radar') {
        ctx.save();
        ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 2;
        const maxR = Math.max(W, H) * 1.2;
        const t = Date.now() * 0.0008;
        for (let i = 0; i < 4; i++) {
            let phase = ((t + i * 0.25) % 1.0);
            let r = phase * maxR;
            ctx.globalAlpha = 1 - Math.pow(phase, 1.5); // non-linear fade for better aesthetics
            ctx.beginPath();
            ctx.arc(cfg.centerX, cfg.centerY, r, 0, Math.PI*2);
            ctx.stroke();
        }
        ctx.restore();
    } else if (CURRENT_BG === 'forest') {
        if (forestImage.complete && forestImage.naturalWidth !== 0) {
            ctx.save();
            ctx.imageSmoothingEnabled = false; // keep retro pixel look sharp
            const imgRatio = forestImage.width / forestImage.height;
            const canvasRatio = W / H;
            let w, h, x, y;
            if (canvasRatio > imgRatio) {
                w = W; h = W / imgRatio;
                x = 0; y = (H - h) / 2;
            } else {
                h = H; w = H * imgRatio;
                y = 0; x = (W - w) / 2;
            }
            ctx.drawImage(forestImage, x, y, w, h);
            // Apply overlay tint to keep game elements readable
            ctx.fillStyle = isLight ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.55)';
            ctx.fillRect(0, 0, W, H);
            ctx.restore();
        }
    }

    ctx.save();
    if (G.shakeTimer>0) ctx.translate((Math.random()-0.5)*G.shakeIntensity,(Math.random()-0.5)*G.shakeIntensity);

    if (G.state==='playing'||G.state==='dead'||G.state==='levelup') {
        drawRing(); drawBall(); drawParticles(); drawProgress();
    }
    ctx.restore();

    // ── "KAYBETTİN" flash ──
    if (G.loseFlash > 0) {
        // Red overlay
        ctx.save();
        ctx.globalAlpha = G.loseFlash * 0.15;
        ctx.fillStyle = '#FF3B3B';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();

        // Text
        ctx.save();
        ctx.globalAlpha = Math.min(G.loseFlash * 2, 1);
        ctx.fillStyle = '#FF3B3B';
        ctx.font = `800 ${cfg.ringRadius * 0.22}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#FF3B3B';
        ctx.shadowBlur = 30;
        ctx.fillText('KAYBETTİN!', cfg.centerX, cfg.centerY);
        ctx.restore();
    }
}

function drawRing() {
    const cx=G.cx || cfg.centerX, cy=G.cy || cfg.centerY, r=cfg.ringRadius, rw=cfg.ringWidth;

    let blinkAlpha = 1;
    if (G.level > 30 && G.level <= 40 && G.state === 'playing') {
        const cycle = Date.now() % 3000;
        // Visible for 1.8s, faded for 1.2s
        blinkAlpha = cycle < 1800 ? 1 : 0.04;
    }

    // glow
    ctx.save();
    ctx.globalAlpha = (0.06+G.ringPulse*0.1) * blinkAlpha;
    ctx.beginPath();
    ctx.arc(cx,cy,r+rw*0.5+G.ringPulse*15,0,Math.PI*2);
    ctx.arc(cx,cy,r-rw*0.5-G.ringPulse*15,0,Math.PI*2,true);
    ctx.fillStyle='#4ECDC4'; ctx.fill();
    ctx.restore();

    for (const seg of G.segments) {
        if (!seg.alive) continue;
        const sa=seg.start+G.rotation, ea=seg.end+G.rotation;
        ctx.beginPath();
        ctx.arc(cx,cy,r+rw/2,sa,ea);
        ctx.arc(cx,cy,r-rw/2,ea,sa,true);
        ctx.closePath();
        ctx.fillStyle=seg.color; 
        ctx.globalAlpha = blinkAlpha;
        ctx.fill();

        if (seg.isTrap) {
            ctx.save();
            ctx.strokeStyle = '#FF3B3B';
            ctx.lineWidth = 2;
            ctx.globalAlpha = blinkAlpha * 0.8;
            const midAngle = (sa + ea)/2;
            const trapX = cx + Math.cos(midAngle) * r;
            const trapY = cy + Math.sin(midAngle) * r;
            ctx.beginPath();
            ctx.moveTo(trapX - 5, trapY - 5); ctx.lineTo(trapX + 5, trapY + 5);
            ctx.moveTo(trapX + 5, trapY - 5); ctx.lineTo(trapX - 5, trapY + 5);
            ctx.stroke();
            ctx.restore();
        }

        ctx.save(); ctx.globalAlpha = 0.15 * blinkAlpha; ctx.shadowColor=seg.color; ctx.shadowBlur=12;
        ctx.beginPath(); ctx.arc(cx,cy,r+rw/2,sa,ea); ctx.arc(cx,cy,r-rw/2,ea,sa,true);
        ctx.closePath(); ctx.fill(); ctx.restore();
    }

    ctx.beginPath(); ctx.arc(cx,cy,r-rw/2-2,0,Math.PI*2);
    const isLight = document.body.classList.contains('light-mode');
    ctx.fillStyle = isLight ? 'rgba(230,235,245,0.5)' : 'rgba(16,18,26,0.5)'; 
    ctx.globalAlpha = blinkAlpha; ctx.fill();

    const rem = G.segments.filter(s=>s.alive && !s.isTrap).length;
    ctx.fillStyle = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';
    ctx.globalAlpha = blinkAlpha;
    ctx.font=`${r*0.5}px Inter`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(rem,cx,cy);
    ctx.globalAlpha = 1; // restore
}



function drawShapePath(ctx, shape, x, y, r) {
    ctx.beginPath();
    if (shape === 'star') {
        const spikes = 5;
        const outer = r * 1.2;
        const inner = r * 0.5;
        for (let i = 0; i < spikes * 2; i++) {
            const rad = Math.PI/2 + (i * Math.PI) / spikes;
            const dist = (i % 2 === 0) ? outer : inner;
            ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(rad) * dist, y - Math.sin(rad) * dist);
        }
        ctx.closePath();
    } else if (shape === 'hexagon') {
        for (let i = 0; i < 6; i++) {
            const rad = Math.PI/2 + (i * Math.PI) / 3;
            ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(rad) * r * 1.1, y - Math.sin(rad) * r * 1.1);
        }
        ctx.closePath();
    } else if (shape === 'triangle') {
        for (let i = 0; i < 3; i++) {
            const rad = Math.PI/2 + (i * Math.PI * 2) / 3;
            ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(rad) * r * 1.3, y - Math.sin(rad) * r * 1.3);
        }
        ctx.closePath();
    } else if (shape === 'heart') {
        ctx.moveTo(x, y - r * 0.2);
        ctx.bezierCurveTo(x - r * 1.5, y - r * 1.2, x - r * 1.2, y + r * 0.8, x, y + r * 1.2);
        ctx.bezierCurveTo(x + r * 1.2, y + r * 0.8, x + r * 1.5, y - r * 1.2, x, y - r * 0.2);
        ctx.closePath();
    } else if (shape === 'butterfly') {
        ctx.moveTo(x, y - r * 0.3);
        ctx.bezierCurveTo(x + r * 0.8, y - r * 1.3, x + r * 1.4, y - r * 0.1, x + r * 0.3, y + r * 0.2);
        ctx.bezierCurveTo(x + r * 1.0, y + r * 0.7, x + r * 0.5, y + r * 1.2, x, y + r * 0.6);
        ctx.bezierCurveTo(x - r * 0.5, y + r * 1.2, x - r * 1.0, y + r * 0.7, x - r * 0.3, y + r * 0.2);
        ctx.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.8, y - r * 1.3, x, y - r * 0.3);
        ctx.closePath();
    } else {
        ctx.arc(x, y, r, 0, Math.PI*2);
    }
}

const tintCanvas = document.createElement('canvas');
const tintCtx = tintCanvas.getContext('2d');

function drawTintedEmoji(ctx, emoji, x, y, r, color, rotation = 0) {
    const size = r * 3;
    if (tintCanvas.width !== Math.ceil(size)) {
        tintCanvas.width = Math.ceil(size);
        tintCanvas.height = Math.ceil(size);
    } else {
        tintCtx.clearRect(0, 0, size, size);
    }
    
    tintCtx.save();
    tintCtx.translate(size/2, size/2);
    if (rotation) tintCtx.rotate(rotation);
    tintCtx.font = `${r * 1.8}px Arial`;
    tintCtx.textAlign = 'center';
    tintCtx.textBaseline = 'middle';
    tintCtx.fillText(emoji, 0, r * 0.1);
    tintCtx.restore();
    
    tintCtx.globalCompositeOperation = 'source-in';
    tintCtx.fillStyle = color;
    tintCtx.fillRect(0, 0, size, size);
    tintCtx.globalCompositeOperation = 'source-over';
    
    ctx.drawImage(tintCanvas, x - size/2, y - size/2);
}

function drawBall() {
    if (!G.ball) return;
    const b=G.ball, br=cfg.ballRadius;

    // trail
    for (const t of b.trail) {
        const tColor = b.color+Math.floor(t.a*40).toString(16).padStart(2,'0');
        if (SHAPES[CURRENT_SHAPE].isEmoji) {
            drawTintedEmoji(ctx, SHAPES[CURRENT_SHAPE].icon, t.x, t.y, br*0.6, tColor, SHAPES[CURRENT_SHAPE].rotation);
        } else {
            drawShapePath(ctx, CURRENT_SHAPE, t.x, t.y, br*0.6);
            ctx.fillStyle = tColor;
            ctx.fill();
        }
    }

    // aim line
    if (!G.isShooting) {
        ctx.save(); ctx.setLineDash([4,8]);
        ctx.beginPath(); ctx.moveTo(b.x,b.y-br-4);
        ctx.lineTo(cfg.centerX, cfg.centerY + cfg.ringRadius + cfg.ringWidth);
        ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1.5; ctx.stroke();
        ctx.restore();

        // 61-70 Countdown timer
        if (G.level > 60 && G.level <= 70 && G.state === 'playing') {
            const remaining = 3000 - (Date.now() - (G.colorLastChange || Date.now()));
            const secs = Math.max(1, Math.ceil(remaining / 1000));
            ctx.save();
            ctx.fillStyle = b.color;
            ctx.font = `800 ${br * 3.5}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 12;
            ctx.fillText(secs, b.x, b.y - br * 2.8);
            ctx.restore();
        }
    }

    // body + glow
    let ballColor = G.activeRainbow ? `hsl(${Date.now()%360}, 100%, 60%)` : b.color;
    
    if (SHAPES[CURRENT_SHAPE].isEmoji) {
        drawTintedEmoji(ctx, SHAPES[CURRENT_SHAPE].icon, b.x, b.y, br, ballColor, SHAPES[CURRENT_SHAPE].rotation);
        ctx.save(); 
        ctx.shadowColor = ballColor; 
        ctx.shadowBlur = 18;
        drawTintedEmoji(ctx, SHAPES[CURRENT_SHAPE].icon, b.x, b.y, br, ballColor, SHAPES[CURRENT_SHAPE].rotation);
        ctx.restore();
    } else {
        drawShapePath(ctx, CURRENT_SHAPE, b.x, b.y, br);
        ctx.fillStyle=ballColor; ctx.fill();
        ctx.save(); ctx.shadowColor=ballColor; ctx.shadowBlur=18;
        drawShapePath(ctx, CURRENT_SHAPE, b.x, b.y, br);
        ctx.fillStyle=ballColor; ctx.fill(); ctx.restore();
    }

    // bomb outer glow (always visible when active, even while shooting)
    if (G.activeBomb) {
        ctx.save();
        const bombPulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
        ctx.shadowColor = '#FF6F00'; ctx.shadowBlur = 20 * bombPulse;
        ctx.strokeStyle = `rgba(255, 111, 0, ${bombPulse})`;
        ctx.lineWidth = 3;
        drawShapePath(ctx, CURRENT_SHAPE, b.x, b.y, br + 8);
        ctx.stroke();
        // second ring
        ctx.strokeStyle = `rgba(255, 60, 0, ${bombPulse * 0.5})`;
        ctx.lineWidth = 1.5;
        drawShapePath(ctx, CURRENT_SHAPE, b.x, b.y, br + 14);
        ctx.stroke();
        ctx.restore();
    }

    // highlight
    if (!SHAPES[CURRENT_SHAPE].isEmoji) {
        drawShapePath(ctx, CURRENT_SHAPE, b.x-br*0.25, b.y-br*0.25, br*0.35);
        ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fill();
    }

    // idle pulse
    if (!G.isShooting) {
        if (G.activeShield) {
            drawShapePath(ctx, CURRENT_SHAPE, b.x, b.y, br+10);
            ctx.strokeStyle = 'rgba(78, 205, 196, 0.8)';
            ctx.lineWidth = 3; 
            ctx.stroke();
            ctx.save();
            ctx.shadowColor = 'rgba(78, 205, 196, 1)'; ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.restore();
        } else if (!G.activeBomb) {
            const p=Math.sin(Date.now()*0.004)*0.15+0.15;
            drawShapePath(ctx, CURRENT_SHAPE, b.x, b.y, br+6);
            ctx.strokeStyle=ballColor+Math.floor(p*255).toString(16).padStart(2,'0');
            ctx.lineWidth=1.5; ctx.stroke();
        }
    }

    // ── queue below ──
    const sizes=[br*0.7, br*0.55, br*0.4];
    const opac =[0.55, 0.3, 0.15];
    let oy = cfg.shooterY + br + 16;
    for (let i=0; i<3; i++) {
        const c=G.ballQueue[i]; if(!c) continue;
        const r=sizes[i];
        ctx.save(); ctx.globalAlpha=opac[i]; ctx.shadowColor=c; ctx.shadowBlur=8;
        
        if (SHAPES[CURRENT_SHAPE].isEmoji) {
            drawTintedEmoji(ctx, SHAPES[CURRENT_SHAPE].icon, cfg.centerX, oy+r, r, c, SHAPES[CURRENT_SHAPE].rotation);
        } else {
            drawShapePath(ctx, CURRENT_SHAPE, cfg.centerX, oy+r, r);
            ctx.fillStyle=c; ctx.fill();
        }
        
        ctx.restore();
        oy += r*2+6;
    }
}

function drawParticles() {
    for (const p of G.particles) {
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fillStyle=p.color; ctx.globalAlpha=p.alpha; ctx.fill(); ctx.globalAlpha=1;
    }
}

function drawProgress() {
    const tot=G.segments.length, clr=G.segments.filter(s=>!s.alive).length, pr=clr/tot;
    if (pr>0 && pr<1) {
        ctx.beginPath();
        ctx.arc(cfg.centerX,cfg.centerY,cfg.ringRadius+cfg.ringWidth/2+6,-Math.PI/2,-Math.PI/2+Math.PI*2*pr);
        ctx.strokeStyle='rgba(78,205,196,0.15)'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.stroke();
    }
}

// ============================================================
// GAME LOOP
// ============================================================

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

// ============================================================
// INPUT
// ============================================================

function handleTap(e) { e.preventDefault(); if(G.state==='playing') shoot(); }
canvas.addEventListener('pointerdown', handleTap);
canvas.addEventListener('touchstart', handleTap, {passive:false});
document.addEventListener('keydown', (e)=>{
    if(e.code==='Space'||e.code==='Enter'){ e.preventDefault(); if(G.state==='playing') shoot(); }
});

// ============================================================
// BUTTONS
// ============================================================

// Home → Play (highest unlocked)
document.getElementById('btn-play').addEventListener('click', (e)=>{
    e.stopPropagation();
    startLevel(highestPlayable());
});

// Home → Levels
document.getElementById('btn-levels').addEventListener('click', (e)=>{
    e.stopPropagation();
    showLevels();
});

// Levels → Back
document.getElementById('btn-back-home').addEventListener('click', (e)=>{
    e.stopPropagation();
    showHome();
});

// Home → Store
document.getElementById('btn-store').addEventListener('click', (e)=>{
    e.stopPropagation();
    showStore();
});

// Store → Back
document.getElementById('btn-back-store').addEventListener('click', (e)=>{
    e.stopPropagation();
    showHome();
});

// Home → Powerups
document.getElementById('btn-powerups').addEventListener('click', (e)=>{
    e.stopPropagation();
    showPowerups();
});

// Powerups → Back
document.getElementById('btn-back-powerups').addEventListener('click', (e)=>{
    e.stopPropagation();
    showHome();
});

// Home → Settings
document.getElementById('btn-settings').addEventListener('click', (e)=>{
    e.stopPropagation();
    showScreen('settings');
});

// Home → Daily Wheel
document.getElementById('btn-daily').addEventListener('click', (e)=>{
    e.stopPropagation();
    showWheel();
});

// Spin button
document.getElementById('btn-spin').addEventListener('click', (e)=>{
    e.stopPropagation();
    spinWheel();
});

// Wheel → Close
document.getElementById('btn-wheel-close').addEventListener('click', (e)=>{
    e.stopPropagation();
    showHome();
});

// Settings → Back
document.getElementById('btn-close-settings').addEventListener('click', (e)=>{
    e.stopPropagation();
    showHome();
});

// Power-ups
document.getElementById('btn-pu-rainbow').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (G.state !== 'playing' || G.isShooting) return;
    const p = loadProgress();
    if (p.inventory.rainbow > 0 && !G.activeRainbow) {
        p.inventory.rainbow--;
        saveProgress(p);
        G.activeRainbow = true;
        refreshHUD();
    }
});
document.getElementById('btn-pu-shield').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (G.state !== 'playing') return;
    const p = loadProgress();
    if (p.inventory.shield > 0 && !G.activeShield && G.shieldsUsedThisLevel < 2) {
        p.inventory.shield--;
        saveProgress(p);
        G.activeShield = true;
        refreshHUD();
    }
});
document.getElementById('btn-pu-bomb').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (G.state !== 'playing' || G.isShooting) return;
    const p = loadProgress();
    if (p.inventory.bomb > 0 && !G.activeBomb) {
        p.inventory.bomb--;
        saveProgress(p);
        G.activeBomb = true;
        refreshHUD();
    }
});

// Setting Toggles
document.getElementById('toggle-theme').addEventListener('change', (e)=>{
    audioSettings.theme = e.target.checked ? 'light' : 'dark';
    document.body.classList.toggle('light-mode', e.target.checked);
    saveSettings();
});

document.getElementById('toggle-bgm').addEventListener('change', (e)=>{
    audioSettings.bgm = e.target.checked;
    saveSettings();
});
document.getElementById('toggle-sfx').addEventListener('change', (e)=>{
    audioSettings.sfx = e.target.checked;
    saveSettings();
});

// HUD → Home
document.getElementById('btn-hud-home').addEventListener('click', (e)=>{
    e.stopPropagation();
    showHome();
});

// Next level
document.getElementById('btn-nextlevel').addEventListener('click', (e)=>{
    e.stopPropagation();
    startLevel(Math.min(G.level+1, TOTAL_LEVELS));
});

// Level complete → Home
document.getElementById('btn-go-home-2').addEventListener('click', (e)=>{
    e.stopPropagation();
    showHome();
});

// Home → Endless
document.getElementById('btn-endless').addEventListener('click', (e)=>{
    e.stopPropagation();
    startEndless();
});

// Endless Game Over → Retry
document.getElementById('btn-endless-retry').addEventListener('click', (e)=>{
    e.stopPropagation();
    startEndless();
});

// Endless Game Over → Home
document.getElementById('btn-endless-home').addEventListener('click', (e)=>{
    e.stopPropagation();
    showHome();
});

// Home → Achievements
document.getElementById('btn-achievements').addEventListener('click', (e)=>{
    e.stopPropagation();
    showAchievements();
});

// Achievements → Back
document.getElementById('btn-back-achievements').addEventListener('click', (e)=>{
    e.stopPropagation();
    showHome();
});

// ============================================================
// START LEVEL
// ============================================================

function startLevel(lvl) {
    G.state='playing'; G.mode='campaign'; G.level=lvl; G.maxCombo=0; G.combo=0;
    G.ballQueue=[]; G.particles=[]; G.loseFlash=0; G.shakeTimer=0; G.shakeIntensity=0;
    showScreen(null);
    $hud.classList.remove('hud-hidden');
    generateLevel(lvl);
    refreshHUD();
}

const ENDLESS_HISCORE_KEY = 'coloraa_endless_hiscore';

function startEndless() {
    G.state='playing'; G.mode='endless'; G.maxCombo=0; G.combo=0;
    G.ballQueue=[]; G.particles=[]; G.loseFlash=0; G.shakeTimer=0; G.shakeIntensity=0;
    G.endlessScore=0; G.endlessHits=0; G.endlessColors=3;
    G.activeRainbow=false; G.activeShield=false; G.shieldsUsedThisLevel=0; G.activeBomb=false;
    G.rotationSpeed = 0.008;
    
    const hi = localStorage.getItem(ENDLESS_HISCORE_KEY);
    G.endlessHiScore = hi ? parseInt(hi) : 0;
    
    showScreen(null);
    $hud.classList.remove('hud-hidden');
    generateEndlessRing();
    refreshHUD();
}

function generateEndlessRing() {
    G.segments = []; G.rotation = 0; G.isShooting = false;
    G.ringPulse = 0;
    
    const nS = 8 + Math.min(Math.floor(G.endlessHits / 20), 8); // 8 to 16 segments
    const pal = COLORS.slice(0, G.endlessColors);
    const sa = (Math.PI * 2) / nS;
    
    const cl = [];
    for (let i = 0; i < nS; i++) cl.push(pal[i % G.endlessColors]);
    shuffle(cl);
    
    for (let i = 0; i < nS; i++) {
        G.segments.push({ start: i * sa, end: (i + 1) * sa, color: cl[i], originalColor: cl[i], alive: true, isTrap: false });
    }
    G.totalSegments = nS;
    
    // Alternate rotation direction
    if (Math.random() > 0.5) G.rotationSpeed = -G.rotationSpeed;
    
    // Reset ball queue with correct colors
    G.ballQueue = [];
    for (let i = 0; i < 4; i++) G.ballQueue.push(pickColor());
    spawnBall();
}

function showEndlessGameOver() {
    // Save hi-score
    if (G.endlessScore > G.endlessHiScore) {
        G.endlessHiScore = G.endlessScore;
        localStorage.setItem(ENDLESS_HISCORE_KEY, G.endlessHiScore.toString());
    }
    
    document.getElementById('gameover-score').textContent = G.endlessScore;
    document.getElementById('gameover-hiscore').textContent = G.endlessHiScore;
    document.getElementById('gameover-combo').textContent = G.maxCombo;
    showScreen('gameover');
}

// ============================================================
// UTILS
// ============================================================

function shuffle(a) { for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }

// ============================================================
// ACHIEVEMENTS
// ============================================================

const ACH_KEY = 'coloraa_achievements';
const ACHIEVEMENTS = [
    { id:'first_clear',   icon:'🎯', name:'İlk Adım',           desc:'İlk bölümü tamamla',                  reward:10, check: () => { const p=loadProgress(); return p.done.length >= 1; } },
    { id:'star3',         icon:'⭐', name:'Mükemmeliyetci',     desc:'Bir bölümde 3 yıldız al',              reward:10, check: () => { const p=loadProgress(); return Object.values(p.stars).some(s=>s>=3); } },
    { id:'combo5',        icon:'🔥', name:'Kombo Ustası',       desc:'5x kombo yap',                        reward:10, check: () => { const a=loadAchData(); return (a.maxComboEver||0) >= 5; } },
    { id:'combo10',       icon:'💥', name:'Durdurulamaz',       desc:'10x kombo yap',                       reward:10, check: () => { const a=loadAchData(); return (a.maxComboEver||0) >= 10; } },
    { id:'clear10',       icon:'💎', name:'Koleksiyoncu',       desc:'10 bölüm tamamla',                    reward:10, check: () => { const p=loadProgress(); return p.done.length >= 10; } },
    { id:'clear40',       icon:'🏆', name:'Yarı Yolda',         desc:'40 bölüm tamamla',                    reward:10, check: () => { const p=loadProgress(); return p.done.length >= 40; } },
    { id:'clear80',       icon:'👑', name:'Efsane',             desc:'Tüm 80 bölümü tamamla',                reward:10, check: () => { const p=loadProgress(); return p.done.length >= 80; } },
    { id:'endless50',     icon:'♾️',  name:'Sonsuz Başlangıç',   desc:'Sonsuz modda 50 puan yap',            reward:10, check: () => { const hi=localStorage.getItem(ENDLESS_HISCORE_KEY); return hi && parseInt(hi)>=50; } },
    { id:'endless200',    icon:'🌌', name:'Uzay Yolcusu',       desc:'Sonsuz modda 200 puan yap',           reward:10, check: () => { const hi=localStorage.getItem(ENDLESS_HISCORE_KEY); return hi && parseInt(hi)>=200; } },
    { id:'shield_save',   icon:'🛡️', name:'Hayatta Kalan',     desc:'Kalkanla ölümden kurtul',              reward:10, check: () => { const a=loadAchData(); return a.shieldUsed === true; } },
    { id:'lvl10',         icon:'🎖️', name:'10. Bölüm',          desc:'10. bölümü bitir',                    reward:5,  check: () => { const p=loadProgress(); return p.done.includes(10); } },
    { id:'lvl20',         icon:'🎖️', name:'20. Bölüm',          desc:'20. bölümü bitir',                    reward:5,  check: () => { const p=loadProgress(); return p.done.includes(20); } },
    { id:'lvl30',         icon:'🎖️', name:'30. Bölüm',          desc:'30. bölümü bitir',                    reward:5,  check: () => { const p=loadProgress(); return p.done.includes(30); } },
    { id:'lvl40',         icon:'🎖️', name:'40. Bölüm',          desc:'40. bölümü bitir',                    reward:5,  check: () => { const p=loadProgress(); return p.done.includes(40); } },
    { id:'lvl50',         icon:'🎖️', name:'50. Bölüm',          desc:'50. bölümü bitir',                    reward:5,  check: () => { const p=loadProgress(); return p.done.includes(50); } },
    { id:'lvl60',         icon:'🎖️', name:'60. Bölüm',          desc:'60. bölümü bitir',                    reward:5,  check: () => { const p=loadProgress(); return p.done.includes(60); } },
    { id:'lvl70',         icon:'🎖️', name:'70. Bölüm',          desc:'70. bölümü bitir',                    reward:5,  check: () => { const p=loadProgress(); return p.done.includes(70); } },
    { id:'lvl80',         icon:'🥇', name:'80. Bölüm',          desc:'80. bölümü bitir',                    reward:5,  check: () => { const p=loadProgress(); return p.done.includes(80); } }
];

function loadAchData() {
    try { return JSON.parse(localStorage.getItem(ACH_KEY)) || { claimed:[], shieldUsed:false, maxComboEver:0 }; } catch(e) { return { claimed:[], shieldUsed:false, maxComboEver:0 }; }
}
function saveAchData(d) { localStorage.setItem(ACH_KEY, JSON.stringify(d)); }

function showAchievements() {
    showScreen('achievements');
    renderAchievements();
}

function renderAchievements() {
    const list = document.getElementById('achievements-list');
    if (!list) return;
    list.innerHTML = '';
    const achData = loadAchData();
    
    // Update maxComboEver
    if (G.maxCombo > (achData.maxComboEver || 0)) {
        achData.maxComboEver = G.maxCombo;
        saveAchData(achData);
    }
    
    ACHIEVEMENTS.forEach(ach => {
        const isClaimed = achData.claimed.includes(ach.id);
        const isUnlocked = ach.check();
        
        const card = document.createElement('div');
        card.className = `ach-card ${isClaimed ? 'claimed' : isUnlocked ? 'unlocked' : 'locked'}`;
        
        let actionHtml = '';
        if (isClaimed) {
            actionHtml = '<span class="ach-claimed-badge">✓ ALINDI</span>';
        } else if (isUnlocked) {
            actionHtml = `<button class="btn-claim" onclick="claimAchievement('${ach.id}')">${ach.reward} ★ AL</button>`;
        } else {
            actionHtml = `<span class="ach-claimed-badge" style="opacity:0.3">🔒</span>`;
        }
        
        card.innerHTML = `
            <span class="ach-icon">${ach.icon}</span>
            <div class="ach-info">
                <div class="ach-name">${ach.name}</div>
                <div class="ach-desc">${ach.desc}</div>
            </div>
            ${actionHtml}
        `;
        list.appendChild(card);
    });
}

window.claimAchievement = function(id) {
    const achData = loadAchData();
    if (achData.claimed.includes(id)) return;
    
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach || !ach.check()) return;
    
    achData.claimed.push(id);
    saveAchData(achData);
    
    // Award stars
    const p = loadProgress();
    p.starsSpent = (p.starsSpent || 0) - ach.reward;
    saveProgress(p);
    
    renderAchievements();
    
    const mainStarsEl = document.getElementById('total-stars-count');
    if (mainStarsEl) mainStarsEl.textContent = getTotalStars();
};

// ============================================================
// DAILY REWARD WHEEL
// ============================================================

const WHEEL_KEY = 'coloraa_last_spin';
const WHEEL_PRIZES = [
    { label: '5 ★', type: 'star', amount: 5 },
    { label: '🌈 x5', type: 'powerup', id: 'rainbow', amount: 5 },
    { label: '10 ★', type: 'star', amount: 10 },
    { label: '🛡️ x2', type: 'powerup', id: 'shield', amount: 2 },
    { label: '20 ★', type: 'star', amount: 20 },
    { label: '💣 x5', type: 'powerup', id: 'bomb', amount: 5 },
    { label: '5 ★', type: 'star', amount: 5 },
    { label: '🛡️ x5', type: 'powerup', id: 'shield', amount: 5 }
];

let wheelSpinning = false;
let wheelAngle = 0;
let wheelVelocity = 0;
let wheelAnimId = null;
let dailyCountdownInterval = null;

const WHEEL_COOLDOWN = 60 * 1000; // 1 dakika (60 saniye)

function canSpinToday() {
    const last = localStorage.getItem(WHEEL_KEY);
    if (!last) return true;
    return (Date.now() - parseInt(last)) >= WHEEL_COOLDOWN;
}

function markSpun() {
    localStorage.setItem(WHEEL_KEY, Date.now().toString());
}

function getMsUntilNextSpin() {
    const last = localStorage.getItem(WHEEL_KEY);
    if (!last) return 0;
    const elapsed = Date.now() - parseInt(last);
    return Math.max(0, WHEEL_COOLDOWN - elapsed);
}

function formatCountdown(ms) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updateDailyButton() {
    const btn = document.getElementById('btn-daily');
    const cdSpan = document.getElementById('daily-countdown');
    if (!btn) return;
    
    if (canSpinToday()) {
        btn.disabled = false;
        cdSpan.textContent = '';
        if (dailyCountdownInterval) { clearInterval(dailyCountdownInterval); dailyCountdownInterval = null; }
    } else {
        btn.disabled = true;
        function tick() {
            cdSpan.textContent = formatCountdown(getMsUntilNextSpin());
            if (canSpinToday()) {
                btn.disabled = false;
                cdSpan.textContent = '';
                clearInterval(dailyCountdownInterval);
                dailyCountdownInterval = null;
            }
        }
        tick();
        if (!dailyCountdownInterval) dailyCountdownInterval = setInterval(tick, 1000);
    }
}

function drawWheel(angle) {
    const wCanvas = document.getElementById('wheelCanvas');
    if (!wCanvas) return;
    const wCtx = wCanvas.getContext('2d');
    const size = 300;
    const cx = size / 2, cy = size / 2, r = size / 2 - 8;
    const n = WHEEL_PRIZES.length;
    const arc = (Math.PI * 2) / n;
    
    wCtx.clearRect(0, 0, size, size);
    
    for (let i = 0; i < n; i++) {
        const startAngle = angle + i * arc;
        const endAngle = startAngle + arc;
        
        // Segment
        wCtx.beginPath();
        wCtx.moveTo(cx, cy);
        wCtx.arc(cx, cy, r, startAngle, endAngle);
        wCtx.closePath();
        wCtx.fillStyle = COLORS[i % COLORS.length] || '#4ECDC4';
        wCtx.globalAlpha = 0.35;
        wCtx.fill();
        wCtx.globalAlpha = 1;
        
        // Border
        wCtx.strokeStyle = 'rgba(255,255,255,0.15)';
        wCtx.lineWidth = 1.5;
        wCtx.stroke();
        
        // Label
        wCtx.save();
        wCtx.translate(cx, cy);
        wCtx.rotate(startAngle + arc / 2);
        wCtx.textAlign = 'center';
        wCtx.textBaseline = 'middle';
        wCtx.font = '600 20px Inter';
        wCtx.fillStyle = '#fff';
        wCtx.shadowColor = 'rgba(0,0,0,0.5)';
        wCtx.shadowBlur = 4;
        wCtx.fillText(WHEEL_PRIZES[i].label, r * 0.6, 0);
        wCtx.restore();
    }
    
    // Center circle
    wCtx.beginPath();
    wCtx.arc(cx, cy, 18, 0, Math.PI * 2);
    wCtx.fillStyle = '#10121a';
    wCtx.fill();
    wCtx.strokeStyle = 'rgba(255,255,255,0.2)';
    wCtx.lineWidth = 2;
    wCtx.stroke();
}

function getPrizeIndex(angle) {
    const n = WHEEL_PRIZES.length;
    const arc = (Math.PI * 2) / n;
    // Pointer is at top (-PI/2). Find which segment is under it.
    let normalized = (-angle - Math.PI / 2) % (Math.PI * 2);
    if (normalized < 0) normalized += Math.PI * 2;
    return Math.floor(normalized / arc) % n;
}

function spinWheel() {
    if (wheelSpinning || !canSpinToday()) return;
    wheelSpinning = true;
    
    document.getElementById('btn-spin').classList.add('hidden');
    document.getElementById('wheel-result').classList.add('hidden');
    document.getElementById('btn-wheel-close').classList.add('hidden');
    
    // Random velocity: 5-8 full rotations + random offset
    wheelVelocity = 0.3 + Math.random() * 0.15;
    const friction = 0.985;
    
    function animate() {
        wheelAngle += wheelVelocity;
        wheelVelocity *= friction;
        drawWheel(wheelAngle);
        
        if (wheelVelocity > 0.001) {
            wheelAnimId = requestAnimationFrame(animate);
        } else {
            // Stopped
            wheelSpinning = false;
            markSpun();
            
            const prizeIdx = getPrizeIndex(wheelAngle);
            const prize = WHEEL_PRIZES[prizeIdx];
            
            // Award prize
            const p = loadProgress();
            if (prize.type === 'star') {
                // Add bonus stars by reducing starsSpent
                p.starsSpent = (p.starsSpent || 0) - prize.amount;
            } else if (prize.type === 'powerup') {
                p.inventory[prize.id] = (p.inventory[prize.id] || 0) + prize.amount;
            }
            saveProgress(p);
            
            // Show result
            const resultEl = document.getElementById('wheel-result');
            if (prize.type === 'star') {
                resultEl.textContent = `🎉 ${prize.amount} Yıldız kazandın!`;
            } else {
                const puName = POWERUPS[prize.id].name;
                resultEl.textContent = `🎉 ${prize.amount} ${puName} kazandın!`;
            }
            resultEl.classList.remove('hidden');
            document.getElementById('btn-wheel-close').classList.remove('hidden');
            
            // Update stars display
            const mainStarsEl = document.getElementById('total-stars-count');
            if (mainStarsEl) mainStarsEl.textContent = getTotalStars();
        }
    }
    
    animate();
}

function showWheel() {
    if (!canSpinToday()) return;
    showScreen('wheel');
    document.getElementById('btn-spin').classList.remove('hidden');
    document.getElementById('wheel-result').classList.add('hidden');
    document.getElementById('btn-wheel-close').classList.add('hidden');
    drawWheel(wheelAngle);
}


// ============================================================
// BOOT
// ============================================================

loadSettings();
const initialProgress = loadProgress();
if (initialProgress.equippedPalette && PALETTES[initialProgress.equippedPalette]) {
    COLORS = PALETTES[initialProgress.equippedPalette].colors;
}
if (initialProgress.equippedShape && SHAPES[initialProgress.equippedShape]) {
    CURRENT_SHAPE = initialProgress.equippedShape;
}
if (initialProgress.equippedBackground && BACKGROUNDS[initialProgress.equippedBackground]) {
    CURRENT_BG = initialProgress.equippedBackground;
}
showHome();
gameLoop();
