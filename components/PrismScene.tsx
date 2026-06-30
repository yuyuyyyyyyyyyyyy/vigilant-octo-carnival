'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pt { x: number; y: number; }

interface PrismSceneProps {
  collapsed: boolean;
  ends: Pt[];
  cardBottom: Pt[];
  ready: boolean;
  inputSignal?: number;
}

const deg = Math.PI / 180;
function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function cauchyDenseFlint(lambdaUm: number) {
  // Dense flint glass SF10, lambda in micrometres: n = A + B / lambda^2.
  return 1.728 + 0.01342 / (lambdaUm * lambdaUm);
}

function prismDeviation(n: number, apexRad: number) {
  return 2 * Math.asin(n * Math.sin(apexRad / 2)) - apexRad;
}

function fresnelReflectance(n1: number, n2: number, thetaI: number) {
  const sinT = (n1 / n2) * Math.sin(thetaI);
  if (Math.abs(sinT) >= 1) return 1;
  const thetaT = Math.asin(sinT);
  const ci = Math.cos(thetaI);
  const ct = Math.cos(thetaT);
  const rs = ((n1 * ci - n2 * ct) / (n1 * ci + n2 * ct)) ** 2;
  const rp = ((n1 * ct - n2 * ci) / (n1 * ct + n2 * ci)) ** 2;
  return (rs + rp) / 2;
}

export default function PrismScene({ collapsed, ends, cardBottom, ready, inputSignal = 0 }: PrismSceneProps) {
  const spectrum = useMemo(() => [
    { color: '#ff5a70', lambda: 0.650, label: 'red' },
    { color: '#ffd36a', lambda: 0.589, label: 'yellow' },
    { color: '#61d99b', lambda: 0.532, label: 'green' },
    { color: '#62a8ff', lambda: 0.486, label: 'blue' },
  ], []);

  const source = { x: 78, y: 72 };
  const entry = { x: 297, y: 188 };
  const exit = { x: 356, y: 235 };
  const prismTop = { x: 314, y: 158 };
  const prismLeft = { x: 248, y: 272 };
  const prismRight = { x: 382, y: 282 };
  const prismBase = { x: 310, y: 314 };

  const incidentAngle = Math.atan2(entry.y - source.y, entry.x - source.x);
  const incidentPerp = incidentAngle + Math.PI / 2;
  const cosP = Math.cos(incidentPerp);
  const sinP = Math.sin(incidentPerp);

  // 左面法线（向外）和镜面反射计算
  const faceVx = prismLeft.x - prismTop.x;
  const faceVy = prismLeft.y - prismTop.y;
  const faceLen = Math.sqrt(faceVx * faceVx + faceVy * faceVy);
  const normOutX = -faceVy / faceLen;
  const normOutY = faceVx / faceLen;
  const incDx = entry.x - source.x;
  const incDy = entry.y - source.y;
  const incLen = Math.sqrt(incDx * incDx + incDy * incDy);
  const incUnitX = incDx / incLen;
  const incUnitY = incDy / incLen;
  const dotIN = incUnitX * normOutX + incUnitY * normOutY;
  const reflectDist = 126;
  const reflEndX = entry.x + (incUnitX - 2 * dotIN * normOutX) * reflectDist;
  const reflEndY = entry.y + (incUnitY - 2 * dotIN * normOutY) * reflectDist;

  const rays = useMemo(() => {
    const apex = 50 * deg;
    const optical = spectrum.map((item) => {
      const n = cauchyDenseFlint(item.lambda);
      const deviation = prismDeviation(n, apex);
      // Minimum deviation geometry: ray passes symmetrically through prism
      const incident = (apex + deviation) / 2;   // external angle at each face
      const inside  = apex / 2;                   // internal angle at each face
      const entryT = 1 - fresnelReflectance(1, n, incident);
      const exitT  = 1 - fresnelReflectance(n, 1, inside);
      const rawIntensity = entryT * exitT;
      return { ...item, n, deviation, rawIntensity };
    });
    const centerDeviation = optical.reduce((sum, item) => sum + item.deviation, 0) / optical.length;
    const minI = Math.min(...optical.map((item) => item.rawIntensity));
    const maxI = Math.max(...optical.map((item) => item.rawIntensity));
    return optical.map((item) => ({
      ...item,
      relativeDeviation: item.deviation - centerDeviation,
      intensity: 0.62 + ((item.rawIntensity - minI) / Math.max(0.0001, maxI - minI)) * 0.28,
    }));
  }, [spectrum]);

  const topY = ends[0]?.y ?? 340;
  const cardBottomY = cardBottom[0]?.y ?? 525;
  const typedEnergy = Math.min(1, Math.max(0, inputSignal));
  const beamEnergy = 0.22 + typedEnergy * 0.78;
  const spectralEnergy = beamEnergy;
  const centerTopX = ends.length ? ends.reduce((sum, p) => sum + p.x, 0) / ends.length : 520;
  const verticalDistance = Math.max(80, topY - exit.y);
  const targetSpan = ends.length > 1 ? Math.max(80, ends[ends.length - 1].x - ends[0].x) : 360;
  const maxDeviation = Math.max(...rays.map((ray) => Math.abs(ray.relativeDeviation)), 0.001);
  const visualDispersion = Math.min(4.2, Math.max(1.55, (targetSpan * 0.26) / (verticalDistance * maxDeviation)));
  const centerAngle = Math.atan2(topY - exit.y, centerTopX - exit.x);

  const beamPoints = (startWidth: number, endWidth: number) =>
    `${source.x + cosP * startWidth},${source.y + sinP * startWidth} ${source.x - cosP * startWidth},${source.y - sinP * startWidth} ${entry.x - cosP * endWidth},${entry.y - sinP * endWidth} ${entry.x + cosP * endWidth},${entry.y + sinP * endWidth}`;

  const dust = useMemo(() => {
    const pts: Array<{ x: number; y: number; r: number; a: number; d: number }> = [];
    let idx = 0;
    for (let t = 0.05; t < 0.95; t += 0.028) {
      const bx = source.x + (entry.x - source.x) * t;
      const by = source.y + (entry.y - source.y) * t;
      const spread = 10 + t * 44;
      for (let j = 0; j < 2; j++) {
        const off = (seeded(idx + 1) - 0.5) * spread;
        pts.push({
          x: bx + cosP * off,
          y: by + sinP * off,
          r: 0.35 + seeded(idx + 11) * 1.4,
          a: 0.08 + seeded(idx + 23) * 0.28,
          d: seeded(idx + 37) * 0.7,
        });
        idx += 1;
      }
    }
    return pts;
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 25, mixBlendMode: 'screen' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="deep" x="-180%" y="-180%" width="460%" height="460%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b22" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b8" />
            <feMerge><feMergeNode in="b22" /><feMergeNode in="b8" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="mid" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b9" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b3" />
            <feMerge><feMergeNode in="b9" /><feMergeNode in="b3" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="soft" x="-90%" y="-90%" width="280%" height="280%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="refract" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b9" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b3" />
            <feMerge><feMergeNode in="b9" /><feMergeNode in="b3" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="incidentWide" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="24%" stopColor="#dbeafe" stopOpacity="0.16" />
            <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          <filter id="glassShadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="28" stdDeviation="32" floodColor="#020617" floodOpacity="0.38" />
            <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#c8d0da" floodOpacity="0.10" />
          </filter>
          <linearGradient id="glassFace" x1="18%" y1="0%" x2="86%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
            <stop offset="8%" stopColor="#e8ecf2" stopOpacity="0.48" />
            <stop offset="28%" stopColor="#c4ccd8" stopOpacity="0.28" />
            <stop offset="52%" stopColor="#8b95a5" stopOpacity="0.12" />
            <stop offset="74%" stopColor="#d8dde4" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="glassSide" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.20" />
            <stop offset="18%" stopColor="#c8d0da" stopOpacity="0.14" />
            <stop offset="50%" stopColor="#6b7280" stopOpacity="0.06" />
            <stop offset="80%" stopColor="#a1aab5" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="glassHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="42%" stopColor="#ffffff" stopOpacity="0.70" />
            <stop offset="54%" stopColor="#d8dde4" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="glassRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.46" />
            <stop offset="28%" stopColor="#c4ccd8" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#a1aab5" stopOpacity="0.20" />
          </linearGradient>
          <linearGradient id="tinySpectrum" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff5a70" stopOpacity="0.46" />
            <stop offset="33%" stopColor="#ffd36a" stopOpacity="0.42" />
            <stop offset="66%" stopColor="#61d99b" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#62a8ff" stopOpacity="0.44" />
          </linearGradient>
          {spectrum.map((ray, i) => (
            <linearGradient key={`card-${i}`} id={`in-card-L${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={ray.color} stopOpacity="0.12" />
              <stop offset="26%" stopColor={ray.color} stopOpacity="0.075" />
              <stop offset="68%" stopColor={ray.color} stopOpacity="0.022" />
              <stop offset="100%" stopColor={ray.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        <AnimatePresence>
          {!collapsed && (
            <g opacity={ready ? 1 : 0}>

              {/* 入射光束 */}
              <motion.polygon points={beamPoints(42, 76)} fill="url(#incidentWide)" filter="url(#deep)"
                initial={{ opacity: 0 }} animate={{ opacity: 0.18 + 0.34 * beamEnergy }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} />
              <motion.polygon points={beamPoints(24, 48)} fill="url(#incidentWide)" filter="url(#deep)"
                initial={{ opacity: 0 }} animate={{ opacity: 0.34 + 0.42 * beamEnergy }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} />

              {/* 表面镜面反射 */}
              <motion.line x1={entry.x} y1={entry.y} x2={reflEndX} y2={reflEndY}
                stroke="#ffffff" strokeWidth="1.6" filter="url(#soft)" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.22 + 0.14 * beamEnergy }}
                exit={{ pathLength: 0, opacity: 0 }} transition={{ duration: 0.5, delay: 0.12 }} />

              {/* 内部折射路径 */}
              <motion.line x1={entry.x} y1={entry.y} x2={exit.x} y2={exit.y}
                stroke="#ffffff" strokeWidth="2" filter="url(#soft)" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.04 + 0.08 * beamEnergy }}
                exit={{ pathLength: 0, opacity: 0 }} transition={{ duration: 0.5, delay: 0.06 }} />

              <motion.g initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.65, ease: 'easeOut' }} style={{ transformOrigin: '314px 236px' }} filter="url(#glassShadow)">
                <polygon points={`${prismTop.x},${prismTop.y} ${prismLeft.x},${prismLeft.y} ${prismBase.x},${prismBase.y}`} fill="url(#glassFace)" stroke="rgba(255,255,255,0.48)" strokeWidth="1.5" opacity={0.22 + 0.78 * beamEnergy} />
                <polygon points={`${prismTop.x},${prismTop.y} ${prismBase.x},${prismBase.y} ${prismRight.x},${prismRight.y}`} fill="url(#glassSide)" stroke="rgba(219,234,254,0.34)" strokeWidth="1.3" opacity={0.18 + 0.82 * beamEnergy} />
                <polygon points={`${prismLeft.x},${prismLeft.y} ${prismBase.x},${prismBase.y} ${prismRight.x},${prismRight.y}`} fill="rgba(15,23,42,0.055)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" opacity={0.12 + 0.88 * beamEnergy} />

                <circle cx={entry.x} cy={entry.y} r="1.4" fill="#ffffff" filter="url(#soft)"
                  opacity={0.1 + 0.18 * beamEnergy} />
                <circle cx={exit.x} cy={exit.y} r="1.4" fill="#e0f2fe" filter="url(#soft)"
                  opacity={0.08 + 0.18 * beamEnergy} />

                <path d={`M${prismTop.x + 8} ${prismTop.y + 16} L${prismBase.x - 8} ${prismBase.y - 18}`} stroke="url(#glassHighlight)" strokeWidth="3.6" strokeLinecap="round" opacity={0.1 + 0.9 * beamEnergy} />
                <path d={`M${prismTop.x} ${prismTop.y} L${prismLeft.x} ${prismLeft.y} L${prismBase.x} ${prismBase.y} L${prismRight.x} ${prismRight.y} Z`} stroke="url(#glassRim)" strokeWidth="1.8" fill="none" opacity={0.08 + 0.92 * beamEnergy} />
                <path d={`M${prismLeft.x + 16} ${prismLeft.y + 5} L${prismRight.x - 13} ${prismRight.y + 2}`} stroke="url(#tinySpectrum)" strokeWidth="1.5" strokeLinecap="round" opacity={0.08 + 0.92 * beamEnergy} />
              </motion.g>

              {rays.map((ray, i) => {
                const angle = centerAngle + ray.relativeDeviation * visualDispersion;
                const travel = (topY - exit.y) / Math.max(0.08, Math.sin(angle));
                const formulaX = exit.x + Math.cos(angle) * travel;
                const normalized = ray.relativeDeviation / maxDeviation;
                const boundedX = centerTopX - normalized * targetSpan * 0.34;
                const leftBound = Math.min(...ends.map((p) => p.x));
                const rightBound = Math.max(...ends.map((p) => p.x));
                const topHit = {
                  x: Math.min(rightBound, Math.max(leftBound, formulaX * 0.25 + boundedX * 0.75)),
                  y: topY,
                };
                const bottomHit = {
                  x: topHit.x + (i - 1.5) * 1.2,
                  y: cardBottomY,
                };
                const distanceFade = 1 / (1 + Math.max(0, travel) / 1800);
                const opacity = Math.min(0.9, ray.intensity * distanceFade * spectralEnergy);
                const width = 1.35 + ray.intensity * 1.1;

                return (
                  <g key={ray.label}>
                    <motion.line x1={exit.x} y1={exit.y} x2={topHit.x} y2={topHit.y}
                      stroke={ray.color} strokeWidth={width + 5.8} opacity={opacity * 0.16} filter="url(#deep)" strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: opacity * 0.16 }} exit={{ opacity: 0 }} transition={{ duration: 0.72, delay: 0.18 + i * 0.06 }} />
                    <motion.line x1={exit.x} y1={exit.y} x2={topHit.x} y2={topHit.y}
                      stroke={ray.color} strokeWidth={Math.max(0.9, width * 0.62)} opacity={opacity * 0.78} filter="url(#soft)" strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: opacity * 0.78 }} exit={{ pathLength: 0, opacity: 0 }} transition={{ duration: 0.72, delay: 0.18 + i * 0.06, ease: 'easeOut' }} />
                    <motion.polygon
                      points={`${topHit.x - (8 + ray.intensity * 10)},${topHit.y + 2} ${topHit.x + (8 + ray.intensity * 10)},${topHit.y + 2} ${bottomHit.x + (14 + ray.intensity * 16)},${bottomHit.y - 6} ${bottomHit.x - (14 + ray.intensity * 16)},${bottomHit.y - 6}`}
                      fill={`url(#in-card-L${i})`}
                      filter="url(#refract)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: opacity * (0.22 + beamEnergy * 0.62) }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, delay: 0.5 + i * 0.06 }}
                    />
                    {[0, 1].map((spark) => (
                      <motion.circle
                        key={`${ray.label}-spark-${spark}`}
                        cx={topHit.x + (seeded(i * 10 + spark + 4) - 0.5) * 28}
                        cy={topHit.y + 28 + seeded(i * 10 + spark + 9) * 86}
                        r={0.8 + seeded(i * 10 + spark + 15) * 1.4}
                        fill={ray.color}
                        filter="url(#soft)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, opacity * (0.04 + beamEnergy * 0.24), 0] }}
                        transition={{ duration: 2.2, delay: 0.9 + spark * 0.32 + i * 0.08, repeat: Infinity }}
                      />
                    ))}
                  </g>
                );
              })}
            </g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}