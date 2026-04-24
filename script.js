// ============================================================
// ColorAA — Color Match Ring Game
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ── Colors ──
const COLORS = ['#FF6B6B','#4ECDC4','#FFE66D','#7C5CFC','#F5E6CC','#6BCB77'];
const TOTAL_LEVELS = 50;

// ── Layout Config ──
let cfg = { ringRadius:120, ringWidth:28, ballRadius:13, ballSpeed:10, shooterY:600, centerX:0, centerY:0 };

// ── State ──
let G = {
    state:'home',
    level:1, score:0, maxCombo:0, combo:0,
    rotation:0, rotationSpeed:0.012,
    segments:[], ball:null, ballQueue:[],
    isShooting:false, particles:[],
    ringPulse:0, shakeTimer:0, shakeIntensity:0,
    loseFlash:0,
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
};

// ============================================================
// PROGRESS
// ============================================================
const SKEY = 'coloraa_progress';

function loadProgress() {
    try { const d = JSON.parse(localStorage.getItem(SKEY)); if(d&&d.done) return d; } catch(e){}
    return { done:[], hi:{} };
}
function saveProgress(p) { localStorage.setItem(SKEY, JSON.stringify(p)); }

function markDone(lvl, score) {
    const p = loadProgress();
    if (!p.done.includes(lvl)) p.done.push(lvl);
    if (score > (p.hi[lvl]||0)) p.hi[lvl] = score;
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

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const btn = document.createElement('button');
        btn.className = 'lvl-circle';

        const done = isDone(i);
        const unlocked = isUnlocked(i);

        if (i === highest && !isDone(i)) {
            btn.classList.add('current');
        } else if (done) {
            btn.classList.add('done');
        } else if (unlocked) {
            btn.classList.add('current');
        } else {
            btn.classList.add('locked');
        }

        btn.innerHTML = `
            <span class="lvl-num">${i}</span>
            <span class="lvl-sub">${done ? '✓' : (unlocked ? 'OYNA' : '🔒')}</span>
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
        // Normal levels 11-50
        let t = (lvl - 1) % 10 + 1; // 1..10 ramp for each 10-level block
        const overall_t = lvl > 20 ? 10 : (lvl - 10); // cap colors and segments at level 20's difficulty for 21-50
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

    const rng = seededRng(lvl * 7919);  // deterministic seed per level
    const cfg_lvl = getLevelConfig(lvl);

    G.rotationSpeed = cfg_lvl.speed * (lvl % 2 === 0 ? -1 : 1);

    const pal = COLORS.slice(0, cfg_lvl.numColors);
    const nS  = cfg_lvl.numSegments;
    const sa  = (Math.PI * 2) / nS;

    const cl = [];
    for (let i = 0; i < nS; i++) cl.push(pal[i % cfg_lvl.numColors]);
    seededShuffle(cl, rng);

    for (let i = 0; i < nS; i++) {
        G.segments.push({ start: i * sa, end: (i + 1) * sa, color: cl[i], alive: true });
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
    const a = [...new Set(G.segments.filter(s=>s.alive).map(s=>s.color))];
    return a.length>0 ? a[Math.floor(Math.random()*a.length)] : COLORS[0];
}

function spawnBall() {
    const c = G.ballQueue.shift();
    G.ballQueue.push(pickColor());
    G.ball = { x:cfg.centerX, y:cfg.shooterY, color:c, vy:0, trail:[] };
    G.isShooting = false;
}

function shoot() {
    if (G.isShooting || G.state!=='playing' || !G.ball) return;
    G.isShooting = true;
    G.ball.vy = -cfg.ballSpeed;
}

// ============================================================
// COLLISION
// ============================================================

function checkHit() {
    // Stop ball at the ring edge
    G.ball.vy = 0;
    G.ball.y = cfg.centerY + cfg.ringRadius + cfg.ringWidth / 2;
    G.isShooting = false;

    let la = Math.PI/2 - G.rotation;
    la = ((la%(Math.PI*2)) + Math.PI*2) % (Math.PI*2);

    let hit = null;
    for (const seg of G.segments) {
        if (!seg.alive) continue;
        let s = ((seg.start%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
        let e = ((seg.end  %(Math.PI*2))+Math.PI*2)%(Math.PI*2);
        if (s<e) { if (la>=s && la<e) { hit=seg; break; } }
        else     { if (la>=s || la<e) { hit=seg; break; } }
    }

    // If ball lands on a cleared gap, just respawn
    if (!hit) {
        refreshHUD();
        spawnBall();
        return;
    }

    if (hit.color === G.ball.color) {
        // ✅ Correct
        hit.alive = false;
        G.combo++;
        if (G.combo > G.maxCombo) G.maxCombo = G.combo;
        G.ringPulse = 1;

        // Change rotation direction on every hit for levels 21-30
        if (G.level > 20 && G.level <= 30) {
            G.rotationSpeed = -G.rotationSpeed;
        }

        const ma = (hit.start+hit.end)/2 + G.rotation;
        emitParticles(cfg.centerX+Math.cos(ma)*cfg.ringRadius, cfg.centerY+Math.sin(ma)*cfg.ringRadius, hit.color, 18);
        if (G.combo>=2) showCombo(G.combo);

        if (G.segments.every(s=>!s.alive)) {
            G.state = 'levelup';
            const bonus = G.level*100;
            markDone(G.level, 0);
            document.getElementById('completed-level').textContent = G.level;
            document.getElementById('level-bonus').textContent = bonus;
            document.getElementById('btn-nextlevel').style.display = G.level>=TOTAL_LEVELS ? 'none' : '';
            showScreen('levelup');
            refreshHUD();
            return;
        }
        refreshHUD();
        spawnBall();
    } else {
        // ❌ Wrong color — flash "KAYBETTİN" then restart
        G.combo = 0;
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
// UPDATE
// ============================================================

function update() {
    if (G.state!=='playing' && G.state!=='dead') return;
    if (G.state === 'playing') {
        let speedMult = 1;
        if (G.level > 40 && G.level <= 50) {
            // Sine wave speed multiplier: goes from 0.15 to 1.85 smoothly
            speedMult = 1 + 0.85 * Math.sin(Date.now() * 0.0025);
        }
        G.rotation += G.rotationSpeed * speedMult;
    }
    if (G.ringPulse>0) G.ringPulse*=0.9;
    if (G.shakeTimer>0) { G.shakeTimer--; G.shakeIntensity*=0.85; }
    if (G.loseFlash>0) G.loseFlash -= 0.025;

    if (G.ball && G.isShooting) {
        G.ball.y += G.ball.vy;
        G.ball.trail.push({x:G.ball.x, y:G.ball.y, a:1});
        if (G.ball.trail.length>12) G.ball.trail.shift();
        const d = Math.hypot(G.ball.x-cfg.centerX, G.ball.y-cfg.centerY);
        if (d <= cfg.ringRadius+cfg.ringWidth/2) checkHit();
        if (G.ball && G.ball.y<-50) spawnBall();
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
    const cx=cfg.centerX, cy=cfg.centerY, r=cfg.ringRadius, rw=cfg.ringWidth;

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
        ctx.save(); ctx.globalAlpha = 0.15 * blinkAlpha; ctx.shadowColor=seg.color; ctx.shadowBlur=12;
        ctx.beginPath(); ctx.arc(cx,cy,r+rw/2,sa,ea); ctx.arc(cx,cy,r-rw/2,ea,sa,true);
        ctx.closePath(); ctx.fill(); ctx.restore();
    }

    ctx.beginPath(); ctx.arc(cx,cy,r-rw/2-2,0,Math.PI*2);
    ctx.fillStyle='rgba(16,18,26,0.5)'; ctx.globalAlpha = blinkAlpha; ctx.fill();

    const rem = G.segments.filter(s=>s.alive).length;
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
        ctx.lineTo(cfg.centerX,cfg.centerY+cfg.ringRadius+cfg.ringWidth);
        ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1.5; ctx.stroke();
        ctx.restore();
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
    if (!G.isShooting) {
        const sizes=[br*0.7, br*0.55, br*0.4];
        const opac =[0.55, 0.3, 0.15];
        let oy = b.y + br + 16;
        for (let i=0; i<3; i++) {
            const c=G.ballQueue[i]; if(!c) continue;
            const r=sizes[i];
            ctx.save(); ctx.globalAlpha=opac[i]; ctx.shadowColor=c; ctx.shadowBlur=8;
            ctx.beginPath(); ctx.arc(b.x,oy+r,r,0,Math.PI*2);
            ctx.fillStyle=c; ctx.fill(); ctx.restore();
            oy += r*2+6;
        }
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

gameLoop();
