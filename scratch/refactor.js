const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

code = code.replace('const TOTAL_LEVELS = 100;', 'const TOTAL_LEVELS = 110;');

code = code.replace(
    'G.activeRainbow=false; G.activeShield=false; G.shieldsUsedThisLevel=0;\r\n    G.activeBomb=false;',
    'G.activeRainbow=false; G.activeShield=false; G.shieldsUsedThisLevel=0;\r\n    G.activeBomb=false;\r\n    G.hasOuterRing=false; G.outerSegments=[]; G.outerRotation=0; G.outerRotationSpeed=0;'
);

let genLevelReplace = `
    if (lvl > 100 && lvl <= 110) {
        G.hasOuterRing = true;
        G.outerRotationSpeed = -G.rotationSpeed;
        const outerS = Math.min(nS + 8, 30);
        const outerSa = (Math.PI * 2) / outerS;
        const clO = [];
        for (let i = 0; i < outerS; i++) clO.push(pal[i % cfg_lvl.numColors]);
        seededShuffle(clO, rng);
        for (let i = 0; i < outerS; i++) {
            G.outerSegments.push({ start: i * outerSa, end: (i + 1) * outerSa, color: clO[i], originalColor: clO[i], alive: true, isTrap: false });
        }
    }

    G.ballQueue = [];`;
code = code.replace('    G.ballQueue = [];', genLevelReplace);

let pickColorOrig = `function pickColor() {
    const a = [...new Set(G.segments.filter(s=>s.alive && !s.isTrap).map(s=>s.color))];
    return a.length>0 ? a[Math.floor(Math.random()*a.length)] : COLORS[0];
}`;
let pickColorNew = `function pickColor() {
    let a = G.segments.filter(s=>s.alive && !s.isTrap).map(s=>s.color);
    if (G.hasOuterRing && G.outerSegments) {
        a = a.concat(G.outerSegments.filter(s=>s.alive && !s.isTrap).map(s=>s.color));
    }
    a = [...new Set(a)];
    return a.length>0 ? a[Math.floor(Math.random()*a.length)] : COLORS[0];
}`;
code = code.replace(pickColorOrig, pickColorNew);

let updateRot1 = `G.rotation += G.rotationSpeed * speedMult;`;
let updateRot2 = `G.rotation += G.rotationSpeed * speedMult;
        if (G.hasOuterRing) {
            G.outerRotation += G.outerRotationSpeed * speedMult;
        }`;
code = code.replace(updateRot1, updateRot2);

let updateColOrig = `        const rOuter = cfg.ringRadius + cfg.ringWidth/2;
        const rInner = cfg.ringRadius - cfg.ringWidth/2;
        const d = Math.hypot(G.ball.x - G.cx, G.ball.y - G.cy);
        const oldD = Math.hypot(G.ball.x - G.cx, oldY - G.cy);

        if (!G.ball.passedBottom && oldD > rOuter && d <= rOuter) {
            checkHit(false);
        } else if (G.ball.passedBottom && !G.ball.passedTop && oldD < rInner && d >= rInner && G.ball.y < G.cy) {
            checkHit(true);
        }`;
let updateColNew = `        const d = Math.hypot(G.ball.x - G.cx, G.ball.y - G.cy);
        const oldD = Math.hypot(G.ball.x - G.cx, oldY - G.cy);

        if (G.hasOuterRing) {
            const roOuter = cfg.ringRadius + cfg.ringWidth*1.5 + cfg.ringWidth/2 + 30; // 30px gap
            const roInner = cfg.ringRadius + cfg.ringWidth*1.5 - cfg.ringWidth/2 + 30;
            if (!G.ball.passedOuterBottom && oldD > roOuter && d <= roOuter) {
                checkHit(false, true);
            } else if (G.ball.passedOuterBottom && !G.ball.passedOuterTop && oldD < roInner && d >= roInner && G.ball.y < G.cy) {
                checkHit(true, true);
            }
            if (!G.isShooting) return; // If hit, stop processing this frame
        }

        const rOuter = cfg.ringRadius + cfg.ringWidth/2;
        const rInner = cfg.ringRadius - cfg.ringWidth/2;

        if (!G.ball.passedBottom && oldD > rOuter && d <= rOuter) {
            checkHit(false, false);
        } else if (G.ball.passedBottom && !G.ball.passedTop && oldD < rInner && d >= rInner && G.ball.y < G.cy) {
            checkHit(true, false);
        }`;
code = code.replace(updateColOrig, updateColNew);

let chOrig1 = `function checkHit(isTop) {
    const dy = G.ball.y - G.cy;
    const dx = G.ball.x - G.cx;
    let hitAngle = Math.atan2(dy, dx);
    let la = hitAngle - G.rotation;
    la = ((la%(Math.PI*2)) + Math.PI*2) % (Math.PI*2);

    let hit = null;
    for (const seg of G.segments) {`;
let chNew1 = `function checkHit(isTop, isOuter = false) {
    let segments = isOuter ? G.outerSegments : G.segments;
    let rotation = isOuter ? G.outerRotation : G.rotation;
    let radius   = isOuter ? (cfg.ringRadius + cfg.ringWidth*1.5 + 30) : cfg.ringRadius;

    const dy = G.ball.y - G.cy;
    const dx = G.ball.x - G.cx;
    let hitAngle = Math.atan2(dy, dx);
    let la = hitAngle - rotation;
    la = ((la%(Math.PI*2)) + Math.PI*2) % (Math.PI*2);

    let hit = null;
    for (const seg of segments) {`;
code = code.replace(chOrig1, chNew1);

let chOrig2 = `    if (!hit) {
        if (isTop) G.ball.passedTop = true;
        else G.ball.passedBottom = true;
        return;
    }

    G.ball.vy = 0;
    const R = isTop ? (cfg.ringRadius - cfg.ringWidth / 2) : (cfg.ringRadius + cfg.ringWidth / 2);`;
let chNew2 = `    if (!hit) {
        if (isOuter) {
            if (isTop) G.ball.passedOuterTop = true;
            else G.ball.passedOuterBottom = true;
        } else {
            if (isTop) G.ball.passedTop = true;
            else G.ball.passedBottom = true;
        }
        return;
    }

    G.ball.vy = 0;
    const R = isTop ? (radius - cfg.ringWidth / 2) : (radius + cfg.ringWidth / 2);`;
code = code.replace(chOrig2, chNew2);

code = code.replace(
    'emitParticles(G.cx+Math.cos(ma)*cfg.ringRadius, G.cy+Math.sin(ma)*cfg.ringRadius, \'#ffffff\', 18);',
    'emitParticles(G.cx+Math.cos(ma)*radius, G.cy+Math.sin(ma)*radius, \'#ffffff\', 18);'
);

let bombOrig = `            const hitIdx = G.segments.indexOf(hit);
            const nS = G.segments.length;
            for (let offset = -1; offset <= 1; offset++) {
                if (offset === 0) continue;
                const adjIdx = (hitIdx + offset + nS) % nS;
                const adj = G.segments[adjIdx];
                if (adj.alive && !adj.isTrap) {
                    adj.alive = false;
                    const adjMa = (adj.start+adj.end)/2 + G.rotation;
                    emitParticles(G.cx+Math.cos(adjMa)*cfg.ringRadius, G.cy+Math.sin(adjMa)*cfg.ringRadius, adj.color, 18);
                }
            }`;
let bombNew = `            const hitIdx = segments.indexOf(hit);
            const nS = segments.length;
            for (let offset = -1; offset <= 1; offset++) {
                if (offset === 0) continue;
                const adjIdx = (hitIdx + offset + nS) % nS;
                const adj = segments[adjIdx];
                if (adj.alive && !adj.isTrap) {
                    adj.alive = false;
                    const adjMa = (adj.start+adj.end)/2 + rotation;
                    emitParticles(G.cx+Math.cos(adjMa)*radius, G.cy+Math.sin(adjMa)*radius, adj.color, 18);
                }
            }`;
code = code.split(bombOrig).join(bombNew);

code = code.replace(
    'emitParticles(G.cx+Math.cos(ma)*cfg.ringRadius, G.cy+Math.sin(ma)*cfg.ringRadius, hit.color, 18);',
    'emitParticles(G.cx+Math.cos(ma)*radius, G.cy+Math.sin(ma)*radius, hit.color, 18);'
);

let endOrig = `        if (G.segments.filter(s=>!s.isTrap).every(s=>!s.alive)) {`;
let endNew = `        let allDead = G.segments.filter(s=>!s.isTrap).every(s=>!s.alive);
        if (G.hasOuterRing) allDead = allDead && G.outerSegments.filter(s=>!s.isTrap).every(s=>!s.alive);
        if (allDead) {`;
code = code.replace(endOrig, endNew);

code = code.replace(
    'const aliveColors = [...new Set(G.segments.filter(s=>s.alive && !s.isTrap).map(s=>s.color))];',
    'let aliveC = G.segments.filter(s=>s.alive && !s.isTrap).map(s=>s.color); if (G.hasOuterRing) aliveC = aliveC.concat(G.outerSegments.filter(s=>s.alive && !s.isTrap).map(s=>s.color)); const aliveColors = [...new Set(aliveC)];'
);
code = code.replace(
    'const aliveColors = [...new Set(G.segments.filter(s=>s.alive && !s.isTrap).map(s=>s.color))];',
    'let aliveC = G.segments.filter(s=>s.alive && !s.isTrap).map(s=>s.color); if (G.hasOuterRing) aliveC = aliveC.concat(G.outerSegments.filter(s=>s.alive && !s.isTrap).map(s=>s.color)); const aliveColors = [...new Set(aliveC)];'
);

let drawOrigRe = /for \\(const seg of G\\.segments\\) \\{[\\s\\S]*?const rem = G\\.segments\\.filter\\(s=>s\\.alive && !s\\.isTrap\\)\\.length;/;
let drawNewStr = `    function drawSegments(segments, rotation, r) {
        for (const seg of segments) {
            if (!seg.alive) continue;
            const sa=seg.start+rotation, ea=seg.end+rotation;
            ctx.beginPath();
            ctx.arc(cx,cy,r+rw/2,sa,ea);
            ctx.arc(cx,cy,r-rw/2,ea,sa,true);
            ctx.closePath();
            if (seg.isFrosted) {
                ctx.fillStyle = '#D4F1F9';
                ctx.globalAlpha = blinkAlpha;
                ctx.fill();
                ctx.save();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(cx, cy, r, sa, ea);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.restore();
            } else {
                ctx.fillStyle=seg.color; 
                ctx.globalAlpha = blinkAlpha;
                ctx.fill();
            }

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

            if (seg.isShielded) {
                ctx.save();
                ctx.strokeStyle = '#ADB5BD';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.globalAlpha = blinkAlpha;
                ctx.beginPath();
                let pad = (ea - sa) * 0.1;
                ctx.arc(cx, cy, r + rw/2 + 5, sa + pad, ea - pad);
                ctx.stroke();
                ctx.shadowColor = '#ADB5BD';
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(cx, cy, r + rw/2 + 5, sa + pad + (ea - sa)*0.1, sa + pad + (ea - sa)*0.3);
                ctx.stroke();
                ctx.restore();
            }

            ctx.save(); 
            ctx.globalAlpha = 0.15 * blinkAlpha; 
            ctx.shadowColor = seg.isFrosted ? '#FFFFFF' : seg.color; 
            ctx.shadowBlur = 12;
            ctx.beginPath(); 
            ctx.arc(cx,cy,r+rw/2,sa,ea); 
            ctx.arc(cx,cy,r-rw/2,ea,sa,true);
            ctx.closePath(); 
            ctx.fillStyle = seg.isFrosted ? '#FFFFFF' : seg.color;
            ctx.fill(); 
            ctx.restore();
        }
    }

    drawSegments(G.segments, G.rotation, r);
    if (G.hasOuterRing) drawSegments(G.outerSegments, G.outerRotation, r + rw*1.5 + 30);

    ctx.beginPath(); ctx.arc(cx,cy,r-rw/2-2,0,Math.PI*2);
    const isLight = document.body.classList.contains('light-mode');
    ctx.fillStyle = isLight ? 'rgba(230,235,245,0.5)' : 'rgba(16,18,26,0.5)'; 
    ctx.globalAlpha = blinkAlpha; ctx.fill();

    const rem = G.segments.filter(s=>s.alive && !s.isTrap).length + (G.hasOuterRing ? G.outerSegments.filter(s=>s.alive && !s.isTrap).length : 0);`;

code = code.replace(drawOrigRe, drawNewStr);

fs.writeFileSync('script_refactored.js', code);
console.log('Script updated successfully');
