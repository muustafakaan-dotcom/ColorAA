// ============================================================
// ColorAA — Color Match Ring Game
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ── Colors ──
const COLORS = ['#FF6B6B','#4ECDC4','#FFE66D','#7C5CFC','#F5E6CC','#6BCB77'];
const TOTAL_LEVELS = 80;

// ── Layout Config ──
let cfg = { ringRadius:120, ringWidth:28, ballRadius:13, ballSpeed:10, shooterY:600, centerX:0, centerY:0 };

// ── State ──
let G = {
    state:'home',
    level:1, score:0, maxCombo:0, combo:0,
    rotation:0, rotationSpeed:0.012, cx:0, cy:0,
    segments:[], ball:null, ballQueue:[],
    isShooting:false, particles:[],
    ringPulse:0, shakeTimer:0, shakeIntensity:0,
    loseFlash:0, shotsFired:0, totalSegments:0
};

let dpr=1, W=0, H=0;

// ── DOM ──
const $level   = document.getElementById('hud-level');
const $hud     = document.getElementById('hud');
const $combo   = document.getElementById('combo-popup');
const $comboTx = document.getElementById('combo-text');

const screens = {
    home:     document.getElementById('screen-home'),
    levels:   document.getElementById('screen-levels'),
    levelup:  document.getElementById('screen-levelup'),
    settings: document.getElementById('screen-settings'),
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
}
function saveSettings() { 
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(audioSettings)); 
}

function loadProgress() {
    try { const d = JSON.parse(localStorage.getItem(SKEY)); if(d&&d.done) { if(!d.stars) d.stars={}; return d; } } catch(e){}
    return { done:[], hi:{}, stars:{} };
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

function showHome() {
    G.state = 'home';
    showScreen('home');
}

function showLevels() {
    G.state = 'levels';
    buildGrid();
    showScreen('levels');
}

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
        setTimeout(() => {
            if (G.state === 'dead') startLevel(G.level);
        }, 800);
        return;
    }

    if (hit.color === G.ball.color) {
        // ✅ Correct
        hit.alive = false;
        G.combo++;
        if (G.combo > G.maxCombo) G.maxCombo = G.combo;
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
        if (G.combo>=2) showCombo(G.combo);

        if (G.segments.filter(s=>!s.isTrap).every(s=>!s.alive)) {
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
        G.combo = 0;
        playSoundError();
        G.shakeTimer = 20;
        G.shakeIntensity = 12;
        G.loseFlash = 1.0;
        emitParticles(G.ball.x, G.ball.y, '#FF3B3B', 20);
        G.state = 'dead';

        setTimeout(() => {
            if (G.state === 'dead') startLevel(G.level);
        }, 800);
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

function refreshHUD() { $level.textContent=G.level; }

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
    const bg = ctx.createRadialGradient(cfg.centerX,cfg.centerY,0, cfg.centerX,cfg.centerY,Math.max(W,H)*0.7);
    bg.addColorStop(0,'#10121a'); bg.addColorStop(1,'#08090d');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

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
    ctx.fillStyle='rgba(16,18,26,0.5)'; ctx.globalAlpha = blinkAlpha; ctx.fill();

    const rem = G.segments.filter(s=>s.alive && !s.isTrap).length;
    ctx.fillStyle='rgba(255,255,255,0.08)';
    ctx.globalAlpha = blinkAlpha;
    ctx.font=`${r*0.5}px Inter`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(rem,cx,cy);
    ctx.globalAlpha = 1; // restore
}

function drawBall() {
    if (!G.ball) return;
    const b=G.ball, br=cfg.ballRadius;

    // trail
    for (const t of b.trail) {
        ctx.beginPath(); ctx.arc(t.x,t.y,br*0.6,0,Math.PI*2);
        ctx.fillStyle=b.color+Math.floor(t.a*40).toString(16).padStart(2,'0');
        ctx.fill();
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
    ctx.beginPath(); ctx.arc(b.x,b.y,br,0,Math.PI*2);
    ctx.fillStyle=b.color; ctx.fill();
    ctx.save(); ctx.shadowColor=b.color; ctx.shadowBlur=18;
    ctx.beginPath(); ctx.arc(b.x,b.y,br,0,Math.PI*2);
    ctx.fillStyle=b.color; ctx.fill(); ctx.restore();

    // highlight
    ctx.beginPath(); ctx.arc(b.x-br*0.25,b.y-br*0.25,br*0.35,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fill();

    // idle pulse
    if (!G.isShooting) {
        const p=Math.sin(Date.now()*0.004)*0.15+0.15;
        ctx.beginPath(); ctx.arc(b.x,b.y,br+6,0,Math.PI*2);
        ctx.strokeStyle=b.color+Math.floor(p*255).toString(16).padStart(2,'0');
        ctx.lineWidth=1.5; ctx.stroke();
    }

    // ── queue below ──
    const sizes=[br*0.7, br*0.55, br*0.4];
    const opac =[0.55, 0.3, 0.15];
    let oy = cfg.shooterY + br + 16;
    for (let i=0; i<3; i++) {
        const c=G.ballQueue[i]; if(!c) continue;
        const r=sizes[i];
        ctx.save(); ctx.globalAlpha=opac[i]; ctx.shadowColor=c; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.arc(cfg.centerX, oy+r, r, 0, Math.PI*2);
        ctx.fillStyle=c; ctx.fill(); ctx.restore();
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

// Home → Settings
document.getElementById('btn-settings').addEventListener('click', (e)=>{
    e.stopPropagation();
    showScreen('settings');
});

// Settings → Back
document.getElementById('btn-close-settings').addEventListener('click', (e)=>{
    e.stopPropagation();
    showHome();
});

// Setting Toggles
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

// ============================================================
// START LEVEL
// ============================================================

function startLevel(lvl) {
    G.state='playing'; G.level=lvl; G.maxCombo=0; G.combo=0;
    G.ballQueue=[]; G.particles=[]; G.loseFlash=0; G.shakeTimer=0; G.shakeIntensity=0;
    showScreen(null);          // hide all overlays
    $hud.classList.remove('hud-hidden');
    generateLevel(lvl);
}

// ============================================================
// UTILS
// ============================================================

function shuffle(a) { for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }


// ============================================================
// BOOT
// ============================================================

loadSettings();
gameLoop();
