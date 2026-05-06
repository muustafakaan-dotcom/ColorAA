const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

// 1. TOTAL_LEVELS
code = code.replace('const TOTAL_LEVELS = 110;', 'const TOTAL_LEVELS = 200;');

// 2. generateLevel - outer ring bounds
code = code.replace('if (lvl > 100 && lvl <= 110) {', 'if (lvl > 100) {');

// 3. Dynamic traps generation
let trapGenOrig = `    if (lvl > 50 && lvl <= 60) {
        let numTraps = Math.floor(nS * 0.25);
        let trapIndices = [];
        for(let i=0; i<nS; i++) trapIndices.push(i);
        seededShuffle(trapIndices, rng);
        for(let i=0; i<numTraps; i++) {
            G.segments[trapIndices[i]].isTrap = true;
            G.segments[trapIndices[i]].color = '#1a1a24';
        }
    }`;
let trapGenNew = `    if ((lvl > 50 && lvl <= 60) || (lvl > 120 && lvl <= 130) || (lvl > 170 && lvl <= 180)) {
        let numTraps = Math.floor(nS * 0.25);
        let trapIndices = [];
        for(let i=0; i<nS; i++) trapIndices.push(i);
        seededShuffle(trapIndices, rng);
        for(let i=0; i<numTraps; i++) {
            G.segments[trapIndices[i]].isTrap = true;
            G.segments[trapIndices[i]].color = '#1a1a24';
        }
    }
    if (lvl > 140 && lvl <= 150) {
        let nSO = G.outerSegments.length;
        let numTraps = Math.floor(nSO * 0.25);
        let trapIndices = [];
        for(let i=0; i<nSO; i++) trapIndices.push(i);
        seededShuffle(trapIndices, rng);
        for(let i=0; i<numTraps; i++) {
            G.outerSegments[trapIndices[i]].isTrap = true;
            G.outerSegments[trapIndices[i]].color = '#1a1a24';
        }
    }`;
code = code.replace(trapGenOrig, trapGenNew);

// 4. Frosted generation
let frostGenOrig = `    if (lvl > 80 && lvl <= 90) {
        for (let i = 0; i < nS; i++) {
            G.segments[i].isFrosted = true;
        }
    }`;
let frostGenNew = `    if ((lvl > 80 && lvl <= 90) || (lvl > 140 && lvl <= 150)) {
        for (let i = 0; i < nS; i++) G.segments[i].isFrosted = true;
    }
    if ((lvl > 110 && lvl <= 120) || (lvl > 160 && lvl <= 170)) {
        for (let i = 0; i < G.outerSegments.length; i++) G.outerSegments[i].isFrosted = true;
    }`;
code = code.replace(frostGenOrig, frostGenNew);

// 5. Shielded generation
let shieldGenOrig = `    if ((lvl > 90 && lvl <= 100) || (lvl > 130 && lvl <= 140) || (lvl > 160 && lvl <= 170) || (lvl > 190 && lvl <= 200)) {`;
let shieldGenFallback = `    if (lvl > 90 && lvl <= 100) {
        let targetShieldCount = Math.floor(nS * 0.4);
        let shieldCount = 0;
        let indices = [];
        for(let i=0; i<nS; i++) indices.push(i);
        seededShuffle(indices, rng);
        for (let idx of indices) {
            let oppositeIdx = (idx + Math.floor(nS / 2)) % nS;
            if (!G.segments[oppositeIdx].isShielded) {
                G.segments[idx].isShielded = true;
                shieldCount++;
                if (shieldCount >= targetShieldCount) break;
            }
        }
    }`;
let shieldGenNew = `    if ((lvl > 90 && lvl <= 100) || (lvl > 130 && lvl <= 140) || (lvl > 160 && lvl <= 170) || (lvl > 190 && lvl <= 200)) {
        let targetShieldCount = Math.floor(nS * 0.4);
        let shieldCount = 0;
        let indices = [];
        for(let i=0; i<nS; i++) indices.push(i);
        seededShuffle(indices, rng);
        for (let idx of indices) {
            let oppositeIdx = (idx + Math.floor(nS / 2)) % nS;
            if (!G.segments[oppositeIdx].isShielded) {
                G.segments[idx].isShielded = true;
                shieldCount++;
                if (shieldCount >= targetShieldCount) break;
            }
        }
    }
    if ((lvl > 150 && lvl <= 160) || (lvl > 180 && lvl <= 190)) {
        let nSO = G.outerSegments.length;
        let targetShieldCount = Math.floor(nSO * 0.4);
        let shieldCount = 0;
        let indices = [];
        for(let i=0; i<nSO; i++) indices.push(i);
        seededShuffle(indices, rng);
        for (let idx of indices) {
            let oppositeIdx = (idx + Math.floor(nSO / 2)) % nSO;
            if (!G.outerSegments[oppositeIdx].isShielded) {
                G.outerSegments[idx].isShielded = true;
                shieldCount++;
                if (shieldCount >= targetShieldCount) break;
            }
        }
    }`;
if (!code.includes(shieldGenOrig)) {
    code = code.replace(shieldGenFallback, shieldGenNew);
}

// 6. shiftTraps function
let shiftTrapsOrig = `function shiftTraps() {
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
}`;
let shiftTrapsNew = `function shiftTraps(segments, rotSpeed) {
    let traps = [];
    for (let i=0; i<segments.length; i++) {
        if (segments[i].isTrap) traps.push(i);
    }
    
    for (let i of traps) {
        segments[i].isTrap = false;
        segments[i].color = segments[i].originalColor;
    }
    
    let dir = rotSpeed > 0 ? 1 : -1;
    let nS = segments.length;
    let newTraps = [];
    
    for (let i of traps) {
        let nextIdx = i;
        for (let offset = 1; offset <= nS; offset++) {
            let idx = (i + dir * offset + nS * nS) % nS;
            if (segments[idx].alive && !newTraps.includes(idx)) {
                nextIdx = idx;
                break;
            }
        }
        newTraps.push(nextIdx);
    }
    
    for (let idx of newTraps) {
        segments[idx].isTrap = true;
        segments[idx].color = '#1a1a24';
    }
}`;
code = code.replace(shiftTrapsOrig, shiftTrapsNew);

// 7. update logic - Dynamic traps, Sine speed, Color roulette, Stepped rot
let updateOrig = `        let speedMult = 1;
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
            if (G.hasOuterRing) {
                G.outerRotation += G.outerRotationSpeed * speedMult;
            }
        }`;
let updateNew = `        let speedMult = 1;
        if ((G.level > 40 && G.level <= 50) || (G.level > 190 && G.level <= 200)) {
            speedMult = 1 + 0.85 * Math.sin(Date.now() * 0.0025);
        }
        
        if ((G.level > 70 && G.level <= 80) || (G.level > 150 && G.level <= 160)) {
            G.continuousRotation = (G.continuousRotation || G.rotation) + G.rotationSpeed;
            const newRot = Math.round(G.continuousRotation / (Math.PI/12)) * (Math.PI/12);
            if (newRot !== G.rotation) {
                G.rotation = newRot;
                playSoundTick();
            }
            if (G.hasOuterRing) {
                G.continuousOuterRotation = (G.continuousOuterRotation || G.outerRotation) + G.outerRotationSpeed;
                const newOuterRot = Math.round(G.continuousOuterRotation / (Math.PI/12)) * (Math.PI/12);
                if (newOuterRot !== G.outerRotation) {
                    G.outerRotation = newOuterRot;
                }
            }
        } else {
            G.rotation += G.rotationSpeed * speedMult;
            if (G.hasOuterRing) G.outerRotation += G.outerRotationSpeed * speedMult;
        }`;
if (!code.includes(updateNew)) {
    code = code.replace(updateOrig, updateNew);
}

let trapShiftOrig = `    if (G.state === 'playing' && G.level > 50 && G.level <= 60) {
        if (!G.trapShiftLastChange) G.trapShiftLastChange = Date.now();
        if (Date.now() - G.trapShiftLastChange > 1500) {
            G.trapShiftLastChange = Date.now();
            shiftTraps();
        }
    }`;
let trapShiftNew = `    if (G.state === 'playing') {
        if (!G.trapShiftLastChange) G.trapShiftLastChange = Date.now();
        if (Date.now() - G.trapShiftLastChange > 1500) {
            if ((G.level > 50 && G.level <= 60) || (G.level > 120 && G.level <= 130) || (G.level > 170 && G.level <= 180)) {
                G.trapShiftLastChange = Date.now();
                shiftTraps(G.segments, G.rotationSpeed);
            }
            if (G.level > 140 && G.level <= 150) {
                G.trapShiftLastChange = Date.now();
                shiftTraps(G.outerSegments, G.outerRotationSpeed);
            }
        }
    }`;
code = code.replace(trapShiftOrig, trapShiftNew);

let rouletteOrig = `if (G.state === 'playing' && G.level > 60 && G.level <= 70 && G.ball && !G.isShooting)`;
let rouletteNew = `if (G.state === 'playing' && ((G.level > 60 && G.level <= 70) || (G.level > 170 && G.level <= 180)) && G.ball && !G.isShooting)`;
code = code.replace(rouletteOrig, rouletteNew);

// 8. checkHit logic - rotation reverse
let revOrig = `        if (G.level > 20 && G.level <= 30) {
            G.rotationSpeed = -G.rotationSpeed;
        }`;
let revNew = `        if ((G.level > 20 && G.level <= 30) || (G.level > 130 && G.level <= 140)) {
            G.rotationSpeed = -G.rotationSpeed;
            if (G.hasOuterRing) G.outerRotationSpeed = -G.outerRotationSpeed;
        }`;
code = code.replace(revOrig, revNew);

// 9. drawRing logic - blinking
let blinkOrig = `    let blinkAlpha = 1;
    if (G.level > 30 && G.level <= 40 && G.state === 'playing') {
        const cycle = Date.now() % 3000;
        // Visible for 1.8s, faded for 1.2s
        blinkAlpha = cycle < 1800 ? 1 : 0.04;
    }`;
let blinkNew = `    let blinkAlpha = 1;
    let outerBlinkAlpha = 1;
    if (G.state === 'playing') {
        const cycle = Date.now() % 3000;
        const alpha = cycle < 1800 ? 1 : 0.04;
        if ((G.level > 30 && G.level <= 40) || (G.level > 180 && G.level <= 190)) {
            blinkAlpha = alpha;
            outerBlinkAlpha = alpha;
        }
        if (G.level > 120 && G.level <= 130) {
            outerBlinkAlpha = alpha;
        }
    }`;
code = code.replace(blinkOrig, blinkNew);

let drawSegOrig = `function drawSegments(segments, rotation, r) {`;
let drawSegNew = `function drawSegments(segments, rotation, r, curBlinkAlpha) {`;
code = code.replace(drawSegOrig, drawSegNew);

let drawBodyMatch = code.match(/function drawSegments\(segments, rotation, r, curBlinkAlpha\) \{([\s\S]*?)\}\s*drawSegments/);
if (drawBodyMatch) {
    let oldBody = drawBodyMatch[1];
    let newBody = oldBody.replace(/blinkAlpha/g, 'curBlinkAlpha');
    code = code.replace(oldBody, newBody);
}

let drawCallsOrig = `    drawSegments(G.segments, G.rotation, r);
    if (G.hasOuterRing) drawSegments(G.outerSegments, G.outerRotation, r + rw*1.5 + 30);`;
let drawCallsNew = `    drawSegments(G.segments, G.rotation, r, blinkAlpha);
    if (G.hasOuterRing) drawSegments(G.outerSegments, G.outerRotation, r + rw*1.5 + 30, outerBlinkAlpha);`;
code = code.replace(drawCallsOrig, drawCallsNew);

fs.writeFileSync('script_extended.js', code);
console.log('Successfully generated script_extended.js');
