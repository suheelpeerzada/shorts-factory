// Our overlays for the Remotion house style: opening title card (+ PART n badge) and one-word captions.
// WORDS: [{w, s, e, sp}] (seconds); SPEAKER_COLORS: {NARRATOR:"#fff", ...}; TITLE: {lines:["...", "..."], part: 2|null, until: 1.9}
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

export const TitleCard = ({ TITLE }) => {
  const { fps } = useVideoConfig(); const t = useCurrentFrame() / fps;
  if (!TITLE || t > TITLE.until) return null;
  const pop = (d) => { const k = Math.min(1, Math.max(0, (t - d) / 0.14)); return 0.4 + k * 0.7 - Math.max(0, Math.min(1, (t - d - 0.14) / 0.1)) * 0.1; };
  const fade = Math.min(1, (TITLE.until - t) / 0.2);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.45)', opacity: fade }}>
      {TITLE.lines.map((l, i) => (
        <div key={i} style={{ fontFamily: "'Montserrat Black','Arial Black',sans-serif", fontWeight: 900, fontSize: i === TITLE.lines.length - 1 ? 150 : 110, lineHeight: 1.05,
          color: i === TITLE.lines.length - 1 ? '#ffd23a' : '#ffffff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textAlign: 'center',
          transform: `scale(${pop(0.1 + i * 0.12) * (1 + (t / TITLE.until) * 0.05)})` }}>{l}</div>
      ))}
      {TITLE.part ? <div style={{ marginTop: 24, padding: '10px 34px', background: '#c9353a', color: '#fff', fontFamily: "'Arial Black',sans-serif", fontSize: 64, borderRadius: 16, border: '6px solid #000' }}>{typeof TITLE.part === 'string' ? TITLE.part : 'PART ' + TITLE.part}</div> : null}
    </AbsoluteFill>
  );
};

// y: a fixed '62%' or a function (wordIndex) -> '70%' / '15%' that keeps the caption off the subject
export const Captions = ({ WORDS, SPEAKER_COLORS, after = 0, y = '62%' }) => {
  const { fps } = useVideoConfig(); const t = useCurrentFrame() / fps;
  if (t < after) return null;
  const i = WORDS.findIndex((x, k) => t >= x.s - 0.03 && t < (WORDS[k + 1] ? WORDS[k + 1].s - 0.03 : x.e + 0.4));
  if (i < 0) return null; const w = WORDS[i]; if (t > w.e + 0.45) return null;
  const k = Math.min(1, (t - w.s + 0.03) / 0.07), sc = 0.7 + 0.38 * k - (t - w.s > 0.1 ? 0.08 : 0);
  return (
    <div style={{ position: 'absolute', top: typeof y === 'function' ? y(i) : y, width: '100%', textAlign: 'center', transform: `scale(${sc})`, fontFamily: "'Montserrat Black','Arial Black',sans-serif", fontWeight: 900,
      fontSize: 118, color: (SPEAKER_COLORS || {})[w.sp] || '#ffffff', WebkitTextStroke: '9px #000', paintOrder: 'stroke fill', textShadow: '0 8px 16px rgba(0,0,0,0.55)' }}>
      {w.w.toUpperCase().replace(/[,;:]$/, '')}
    </div>
  );
};
