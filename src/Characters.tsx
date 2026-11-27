import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
export const LINE = sec(6); // 1 slot dialog = 6 detik
export const SHOW = sec(3); // bubble tampil 3 detik (sisanya jeda sampai slot 6 detik habis)
export const FONT = "'Baloo 2', 'Comic Sans MS', 'Trebuchet MS', sans-serif";

export type Name =
  | 'Ara'
  | 'Hirzi'
  | 'Hessam'
  | 'S'
  | 'Yusuf'
  | 'Udil'
  | 'Rakha'
  | 'Naura'
  | 'Raihan'
  | 'Royan'
  | 'Rasya'
  | 'Niko'
  | 'Febri'
  | 'Hana'
  | 'Riri'
  | 'Azka'
  | 'Rifky'
  | 'Hafizh'
  | 'Syauqi'
  | 'Aril'
  | 'Khaliq'
  | 'Nasita';
export type Expr =
  | 'neutral'
  | 'happy'
  | 'blush'
  | 'sad'
  | 'cry'
  | 'shock'
  | 'worry'
  | 'curious'
  | 'angry'
  | 'sinis';
export type Pose = 'stand' | 'sit' | 'floor';
export type Place = { x: number; y: number; mul?: number; pose?: Pose };
export type Line = {
  who: Name;
  text: string; // kosong = adegan tanpa bubble
  e?: Partial<Record<Name, Expr>>;
  dur?: number; // panjang slot (default 6 detik)
  big?: boolean; // bubble teriak
  thought?: boolean; // dialog dalam hati
  zs?: [number, number]; // zoom kamera awal/akhir
};

const SHIFT: Record<Pose, number> = { stand: 0, sit: 55, floor: 98 };

type CharDef = {
  skin: string;
  hair: string;
  size: number;
  girl: boolean;
  glasses?: string;
  glassShape?: 'round' | 'square';
  sw?: number; // lebar bahu
  taper?: number; // 1 = lurus, <1 = bentuk V
  armW?: number; // tebal lengan
  hijab?: { fill: string; stroke: string };
  sleeve?: string; // warna lengan (jas / jubah)
  long?: boolean; // lengan panjang (jas lab / jubah)
  coat?: 'lab' | 'robe';
};

const WHITE = '#f8e1cc'; // kulit putih
const TAN = '#dc9f7e'; // kulit seperti Yusuf
const HIJAB_W = { fill: '#ffffff', stroke: '#cbd5e1' };

export const CHARS: Record<Name, CharDef> = {
  Ara: { skin: '#f3cfae', hair: '#3a2a20', size: 1.1, girl: true, hijab: { fill: '#f4b6c9', stroke: '#e58fae' } },
  Hirzi: { skin: '#f1c9a5', hair: '#1f1f1f', size: 1.3, girl: false },
  Hessam: { skin: '#f3d0ad', hair: '#2b2118', size: 1.3, girl: false, glasses: '#111827' },
  S: { skin: '#f6d5b8', hair: '#3b2a20', size: 1.22, girl: true, glasses: '#9d174d' },
  Yusuf: { skin: TAN, hair: '#151515', size: 1.45, girl: false },
  Udil: { skin: '#f1c9a5', hair: '#1a1a1a', size: 1.28, girl: false, glasses: '#111827' },
  Rakha: { skin: '#e8bd98', hair: '#151515', size: 1.3, girl: false, sw: 1.25 },
  Naura: { skin: '#f6d5b8', hair: '#3a2a20', size: 1.18, girl: true, glasses: '#374151', hijab: HIJAB_W },
  // ---- karakter baru (Episode 4) ----
  Raihan: { skin: TAN, hair: '#1a1a1a', size: 1.3, girl: false },
  Royan: { skin: WHITE, hair: '#1a1a1a', size: 1.5, girl: false },
  Rasya: { skin: WHITE, hair: '#1a1a1a', size: 1.5, girl: false, sw: 1.25 },
  Niko: { skin: WHITE, hair: '#111111', size: 1.45, girl: false, sw: 0.85 },
  Febri: { skin: TAN, hair: '#2a2a2a', size: 1.3, girl: false, sw: 1.25 },
  Hana: { skin: WHITE, hair: '#3a2a20', size: 1.26, girl: true, glasses: '#e8d5a3', hijab: HIJAB_W },
  Riri: { skin: WHITE, hair: '#3a2a20', size: 1.3, girl: true, hijab: HIJAB_W },
  Azka: { skin: WHITE, hair: '#1f1f1f', size: 1.3, girl: false, glasses: '#111827', coat: 'lab', long: true, sleeve: '#ffffff' },
  Rifky: { skin: WHITE, hair: '#1f1f1f', size: 1.5, girl: false, coat: 'robe', long: true, sleeve: '#bfdbfe' },
  Hafizh: { skin: '#c98a68', hair: '#1f1f1f', size: 1.45, girl: false, sw: 1.5, taper: 0.7, armW: 20 },
  Syauqi: { skin: WHITE, hair: '#1a1a1a', size: 1.58, girl: false, glasses: '#111827', glassShape: 'square' },
  Aril: { skin: WHITE, hair: '#1a1a1a', size: 1.5, girl: false, sw: 1.35 },
  Khaliq: { skin: TAN, hair: '#1a1a1a', size: 1.5, girl: false, sw: 1.35 },
  Nasita: { skin: WHITE, hair: '#3a2a20', size: 1.26, girl: true, hijab: { fill: '#93c5fd', stroke: '#60a5fa' } },
};

export const BUBBLE_COLOR: Record<Name, string> = {
  Ara: '#f9a8d4',
  Hirzi: '#93c5fd',
  Hessam: '#86efac',
  S: '#c4b5fd',
  Yusuf: '#fdba74',
  Udil: '#fde68a',
  Rakha: '#fca5a5',
  Naura: '#a5f3fc',
  Raihan: '#fdba74',
  Royan: '#bae6fd',
  Rasya: '#fecaca',
  Niko: '#c7d2fe',
  Febri: '#fed7aa',
  Hana: '#fbcfe8',
  Riri: '#ddd6fe',
  Azka: '#a7f3d0',
  Rifky: '#bfdbfe',
  Hafizh: '#fcd34d',
  Syauqi: '#99f6e4',
  Aril: '#d9f99e',
  Khaliq: '#fda4af',
  Nasita: '#a5d8ff',
};

export const headTop = (n: Name, p: Place) =>
  p.y - CHARS[n].size * (p.mul ?? 1) * (300 - SHIFT[p.pose ?? 'stand']);
export const headCenter = (n: Name, p: Place) =>
  p.y - CHARS[n].size * (p.mul ?? 1) * (245 - SHIFT[p.pose ?? 'stand']);

/* ============================== KAMERA ============================== */
export type CamKey = { t: number; cx: number; cy: number; z: number };
export type Cam = { cx: number; cy: number; z: number };

export const focus = (t: number, n: Name, p: Place, z: number): CamKey => ({
  t,
  cx: p.x,
  cy: headCenter(n, p) - 30 / z,
  z,
});

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const CAM_SPEED = 2.4; // makin besar = kamera makin cepat sampai di tujuan

export function camAt(f: number, keys: CamKey[]): Cam {
  let a = keys[0];
  let b = keys[0];
  let p = 0;
  if (f >= keys[keys.length - 1].t) {
    a = b = keys[keys.length - 1];
  } else if (f > keys[0].t) {
    for (let i = 0; i < keys.length - 1; i++) {
      if (f >= keys[i].t && f < keys[i + 1].t) {
        a = keys[i];
        b = keys[i + 1];
        p = ease(Math.min(1, ((f - a.t) / (b.t - a.t)) * CAM_SPEED));
        break;
      }
    }
  }
  const z = a.z + (b.z - a.z) * p;
  let cx = a.cx + (b.cx - a.cx) * p;
  let cy = a.cy + (b.cy - a.cy) * p;
  cx = Math.max(640 / z, Math.min(1280 - 640 / z, cx));
  cy = Math.max(360 / z, Math.min(720 - 360 / z, cy));
  return { cx, cy, z };
}

export const CamG: React.FC<{ cam: Cam; sx?: number; sy?: number; children: React.ReactNode }> = ({
  cam,
  sx = 0,
  sy = 0,
  children,
}) => (
  <g transform={`translate(${640 + sx},${360 + sy}) scale(${cam.z}) translate(${-cam.cx},${-cam.cy})`}>
    {children}
  </g>
);

// jeda antar bubble (mode smart): pembicara sama = 2 detik, ganti pembicara = 3 detik
export const GAP_SAME = sec(2);
export const GAP_CHANGE = sec(3);
export const slotLen = (lines: Line[], i: number, smart: boolean) => {
  const l = lines[i];
  if (l.dur !== undefined) return l.dur;
  if (!smart) return LINE;
  const nx = lines[i + 1];
  return SHOW + (nx && nx.text && nx.who === l.who ? GAP_SAME : GAP_CHANGE);
};
export const lineStarts = (lines: Line[], intro: number, smart = false) => {
  let s = intro;
  return lines.map((_, i) => {
    const a = s;
    s += slotLen(lines, i, smart);
    return a;
  });
};
export const totalLen = (lines: Line[], intro: number, smart = false) =>
  lines.reduce((a, _, i) => a + slotLen(lines, i, smart), intro);

// kamera otomatis menuju pembicara
export function autoKeys(
  lines: Line[],
  intro: number,
  places: Partial<Record<Name, Place>>,
  first: CamKey,
  zA = 1.35,
  zB = 1.6,
  smart = false,
): CamKey[] {
  const st = lineStarts(lines, intro, smart);
  const keys: CamKey[] = [first];
  let last: Name | null = null;
  lines.forEach((l, i) => {
    const p = places[l.who];
    if (!l.text || !p) return;
    const [a, b] = l.zs ?? [zA, zB];
    const sameRun = smart && last === l.who;
    if (!sameRun) keys.push(focus(st[i], l.who, p, a));
    keys.push(focus(st[i] + SHOW, l.who, p, sameRun ? Math.max(b, keys[keys.length - 1].z) : b));
    last = l.who;
  });
  return keys;
}

// posisi bubble di layar: tepat di atas kepala pembicara
export function bubbleAt(cam: Cam, n: Name, p: Place) {
  const x = 640 + (p.x - cam.cx) * cam.z;
  const top = 360 + (headTop(n, p) - cam.cy) * cam.z;
  return { x, bottom: Math.max(210, top - 26) };
}

/* ============================== DIALOG ============================== */
export function useLine(lines: Line[], intro: number, smart = false) {
  const f = useCurrentFrame();
  const st = lineStarts(lines, intro, smart);
  let idx = -1;
  st.forEach((s, i) => {
    if (f >= s) idx = i;
  });
  const cur = idx >= 0 ? lines[idx] : undefined;
  const within = idx >= 0 ? f - st[idx] : 0;
  const dur = cur ? slotLen(lines, idx, smart) : 0;
  const active = !!cur && !!cur.text && within < Math.min(SHOW, dur);
  const ex = (n: Name, base: Expr = 'neutral'): Expr => cur?.e?.[n] ?? base;
  return {
    f,
    idx,
    within,
    line: active ? cur : undefined,
    speaker: active ? cur!.who : undefined,
    ex,
  };
}

export const Bubble: React.FC<{
  who: Name;
  text: string;
  x: number;
  bottom: number;
  within: number;
  big?: boolean;
  thought?: boolean;
}> = ({ who, text, x, bottom, within, big, thought }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: Math.max(0, within), fps, config: { damping: 12, stiffness: 140 } });
  const fadeOut = interpolate(within, [SHOW - 8, SHOW], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cx = Math.max(320, Math.min(960, x));
  const color = big ? '#dc2626' : BUBBLE_COLOR[who];
  const jitter = big ? Math.sin(within * 1.7) * 1.2 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx,
        top: bottom,
        transform: `translate(-50%,-100%) rotate(${jitter}deg) scale(${0.6 + 0.4 * pop})`,
        transformOrigin: '50% 100%',
        opacity: Math.min(1, pop * 1.5) * fadeOut,
        maxWidth: 600,
        minWidth: 200,
        background: thought ? '#f5f3ff' : '#fff',
        border: `5px ${thought ? 'dashed' : 'solid'} ${color}`,
        borderRadius: 28,
        padding: '22px 28px 18px',
        fontSize: big ? 54 : 36,
        fontWeight: big ? 900 : 800,
        fontStyle: thought ? 'italic' : 'normal',
        lineHeight: 1.2,
        color: big ? '#b91c1c' : thought ? '#4c1d95' : '#1f2937',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -20,
          left: 20,
          background: BUBBLE_COLOR[who],
          color: '#1f2937',
          fontSize: 22,
          fontWeight: 800,
          padding: '2px 16px',
          borderRadius: 14,
        }}
      >
        {who}
      </div>
      {text}
      <div
        style={{
          position: 'absolute',
          bottom: -17,
          left: `calc(50% + ${x - cx - 14}px)`,
          width: 28,
          height: 28,
          background: thought ? '#f5f3ff' : '#fff',
          borderRight: `5px solid ${color}`,
          borderBottom: `5px solid ${color}`,
          transform: 'rotate(45deg)',
        }}
      />
    </div>
  );
};

export type Narr = { from: number; dur: number; text: string };
export const Narration: React.FC<{ items: Narr[] }> = ({ items }) => {
  const f = useCurrentFrame();
  const it = items.find((i) => f >= i.from && f < i.from + i.dur);
  if (!it) return null;
  const o = interpolate(f, [it.from, it.from + 10, it.from + it.dur - 10, it.from + it.dur], [0, 1, 1, 0]);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 40,
        transform: 'translateX(-50%)',
        maxWidth: 900,
        background: 'rgba(0,0,0,0.78)',
        color: '#fff',
        fontSize: 30,
        fontStyle: 'italic',
        fontWeight: 700,
        padding: '12px 28px',
        borderRadius: 16,
        textAlign: 'center',
        opacity: o,
        fontFamily: FONT,
      }}
    >
      <span
        style={{
          background: '#fbbf24',
          color: '#1f2937',
          fontStyle: 'normal',
          fontSize: 20,
          fontWeight: 800,
          padding: '2px 12px',
          borderRadius: 10,
          marginRight: 12,
        }}
      >
        Narator
      </span>
      {it.text}
    </div>
  );
};

/* ============================== UTILITAS ============================== */
export const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', inset: 0, ...style }}>
    {children}
  </svg>
);

export const Fade: React.FC<{ children: React.ReactNode; inF?: number; outF?: number }> = ({
  children,
  inF = 5,
  outF = 5,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = inF > 0 ? Math.min(1, f / inF) : 1;
  const b = outF > 0 ? Math.min(1, (durationInFrames - f) / outF) : 1;
  return <AbsoluteFill style={{ opacity: Math.max(0, Math.min(a, b)) }}>{children}</AbsoluteFill>;
};

export const Defs: React.FC = () => (
  <defs>
    <pattern id="bricks" width={60} height={56} patternUnits="userSpaceOnUse">
      <rect width={60} height={56} fill="#b5533c" />
      <path
        d="M0,0 H60 M0,28 H60 M0,56 H60 M30,0 V28 M0,28 V56 M60,28 V56"
        stroke="#e0c9ad"
        strokeWidth={3}
        fill="none"
      />
    </pattern>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%">
      <stop offset="0.45" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.8} />
    </radialGradient>
    <radialGradient id="glowG">
      <stop offset="0" stopColor="#fffbe0" stopOpacity={0.95} />
      <stop offset="1" stopColor="#fffbe0" stopOpacity={0} />
    </radialGradient>
  </defs>
);

export const Rain: React.FC<{ intensity?: number; x0?: number; x1?: number }> = ({
  intensity = 1,
  x0 = 0,
  x1 = 1280,
}) => {
  const f = useCurrentFrame();
  const n = Math.floor(70 * intensity);
  return (
    <g stroke="#dbeafe" strokeWidth={2} opacity={0.5} strokeLinecap="round">
      {Array.from({ length: n }).map((_, i) => {
        const x = x0 + ((i * 97 + f * 7) % (x1 - x0));
        const y = ((i * 53 + f * 38) % 780) - 40;
        return <line key={i} x1={x} y1={y} x2={x - 9} y2={y + 34} />;
      })}
    </g>
  );
};

export const Lightning: React.FC<{ at: number[]; x?: number }> = ({ at, x = 720 }) => {
  const f = useCurrentFrame();
  const fl = (T: number) => (f >= T && f < T + 9 ? 1 - (f - T) / 9 : 0);
  const v = Math.max(0, ...at.map((T) => Math.max(fl(T), 0.6 * fl(T + 12))));
  if (v <= 0.01) return null;
  return (
    <g>
      <polyline
        points={`${x},0 ${x - 40},180 ${x + 10},200 ${x - 60},420`}
        stroke="#fef9c3"
        strokeWidth={9}
        fill="none"
        opacity={v}
      />
      <rect width={1280} height={720} fill="#fff" opacity={v * 0.55} />
    </g>
  );
};

// siluet orang abu-abu (perempuan selalu berhijab)
export const Silhouette: React.FC<{
  x: number;
  y: number;
  s?: number;
  girl?: boolean;
  walking?: boolean;
  seed?: number;
}> = ({ x, y, s = 0.55, girl = false, walking = false, seed = 0 }) => {
  const f = useCurrentFrame();
  const w = walking ? Math.sin(f * 0.28 + seed) : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} fill="#6b7280" opacity={0.55}>
      {[-1, 1].map((k) => (
        <rect
          key={k}
          x={k * 13 - 8}
          y={-112}
          width={16}
          height={112}
          rx={7}
          transform={`rotate(${k * w * 14},${k * 13},-110)`}
        />
      ))}
      {girl ? (
        <path d="M-30,-205 L30,-205 L44,-60 L-44,-60 Z" />
      ) : (
        <rect x={-28} y={-205} width={56} height={100} rx={14} />
      )}
      {[-1, 1].map((k) => (
        <rect
          key={'a' + k}
          x={k * 33 - 6}
          y={-198}
          width={12}
          height={78}
          rx={6}
          transform={`rotate(${-k * w * 18},${k * 33},-196)`}
        />
      ))}
      {girl ? (
        <>
          <ellipse cx={0} cy={-232} rx={42} ry={46} />
          <path d="M-42,-228 Q-48,-185 -34,-168 L34,-168 Q48,-185 42,-228 Z" />
        </>
      ) : (
        <>
          <circle cx={0} cy={-236} r={32} />
          <path d="M-32,-240 Q0,-282 32,-240 Z" />
        </>
      )}
    </g>
  );
};

/* ============================== KARAKTER ============================== */
export type CharProps = {
  name: Name;
  x: number;
  y: number;
  mul?: number;
  pose?: Pose;
  expr?: Expr;
  speaking?: boolean;
  walking?: boolean;
  lookDir?: number;
  seed?: number;
  fury?: number; // 0..1 muka memerah + asap
  frozen?: boolean; // diam total (tanpa animasi)
  armL?: number; // paksa sudut lengan kiri (positif = keluar)
  armR?: number; // paksa sudut lengan kanan (negatif = keluar)
  lean?: number; // miring badan (derajat), untuk bersandar di dinding
  crossed?: boolean; // tangan dilipat di dada (gaya cool)
  outfit?: { top?: string; bottom?: string; sleeves?: 'long' | 'short'; hijab?: string }; // baju bebas (bukan seragam)
  lookUp?: number; // 0..1 menengadah melihat ke atas
  headTilt?: number; // miringkan kepala (derajat)
  triangle?: boolean; // segitiga misterius di hijab
};

export const Character: React.FC<CharProps> = ({
  name,
  x,
  y,
  mul = 1,
  pose = 'stand',
  expr = 'neutral',
  speaking = false,
  walking = false,
  lookDir = 0,
  seed = 0,
  fury = 0,
  frozen = false,
  armL,
  armR,
  lean = 0,
  crossed = false,
  outfit,
  lookUp = 0,
  headTilt = 0,
  triangle = false,
}) => {
  const cf = useCurrentFrame();
  const f = frozen ? 0 : cf;
  const c = CHARS[name];
  const hj = outfit?.hijab ? { fill: outfit.hijab, stroke: 'rgba(0,0,0,0.2)' } : c.hijab;
  const sw = c.sw ?? 1;
  const shift = SHIFT[pose];
  const sitting = pose === 'sit';
  const onFloor = pose === 'floor';
  const faceR = hj ? 34 : 37;

  const w = walking ? Math.sin(f * 0.35 + seed) : 0;
  const bob = walking ? -Math.abs(w) * 9 : Math.sin(f * 0.08 + seed) * 1.5;
  const swing = w * 25;
  const talk = speaking ? (Math.sin(f * 0.9 + seed) + 1) / 2 : 0;
  const mouthOpen = 1.5 + talk * 8;
  const blink = (f + seed * 13) % 105 < 5;
  const sadish = expr === 'sad' || expr === 'cry' || expr === 'worry';
  const angry = expr === 'angry';
  const gest = speaking && !walking ? Math.sin(f * 0.18 + seed) : 0;

  let angL = 5 + swing;
  let angR = -5 + swing;
  if (speaking && !walking) angR = -(38 + 22 * gest);
  if (armL !== undefined) angL = armL;
  if (armR !== undefined) angR = armR;
  if (crossed) {
    angL = -62;
    angR = 62;
  }

  const tilt =
    (speaking ? Math.sin(f * 0.12 + seed) * 2.5 : expr === 'sad' || expr === 'cry' ? 4 : 0) + headTilt;
  const dip = expr === 'sad' || expr === 'cry' ? 3 : 0;
  const look = lookDir * 5;
  const pants = outfit?.bottom ?? (c.girl ? '#f8fafc' : '#6b7280');
  const topFill = outfit?.top ?? '#fff';
  const mk = { stroke: '#7f1d1d', strokeWidth: 3, fill: 'none', strokeLinecap: 'round' as const };
  const skirtBottom = onFloor ? -92 : sitting ? -58 : -46;
  const taper = c.taper ?? 1;
  const tw = 28 * sw;
  const bw = tw * taper;
  const torsoD = `M${-tw},-190 Q${-tw},-202 ${-tw + 12},-202 L${tw - 12},-202 Q${tw},-202 ${tw},-190 L${bw},-118 Q${bw},-106 ${bw - 12},-106 L${-bw + 12},-106 Q${-bw},-106 ${-bw},-118 Z`;

  const eye = (s: number) => {
    const cx = s * 15;
    const cy = -248;
    if (expr === 'happy' || expr === 'blush') {
      return (
        <path
          key={s}
          d={`M${cx - 7},${cy + 3} Q${cx},${cy - 8} ${cx + 7},${cy + 3}`}
          stroke="#1f2937"
          strokeWidth={3.5}
          fill="none"
          strokeLinecap="round"
        />
      );
    }
    if (expr === 'shock' && !blink) {
      return (
        <g key={s}>
          <circle cx={cx} cy={cy} r={8} fill="#fff" stroke="#1f2937" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={3} fill="#1f2937" />
        </g>
      );
    }
    if (expr === 'sinis') {
      return (
        <g key={s}>
          <ellipse cx={cx + lookDir * 1.5} cy={cy} rx={5} ry={6.5} fill="#1f2937" />
          <rect x={cx - 8} y={cy - 9} width={16} height={9.5} fill={c.skin} />
          <line x1={cx - 7} y1={cy + 0.5} x2={cx + 7} y2={cy + 0.5} stroke="#1f2937" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    }
    return (
      <g key={s}>
        <ellipse cx={cx} cy={cy + (sadish ? 1.5 : 0)} rx={5} ry={blink ? 0.8 : angry ? 5 : 6.5} fill="#1f2937" />
        {!blink && <circle cx={cx + 1.6} cy={cy - 2} r={1.7} fill="#fff" />}
      </g>
    );
  };

  const brow = (s: number) => {
    const by = -262;
    let io = 0;
    let oo = 0;
    if (sadish) {
      io = -4;
      oo = 2;
    } else if (angry) {
      io = 5;
      oo = -3;
    } else if (expr === 'sinis') {
      io = 3;
      oo = -1;
    } else if (expr === 'happy' || expr === 'blush') {
      io = oo = -2;
    } else if (expr === 'shock') {
      io = oo = -8;
    } else if (expr === 'curious' && s === -1) {
      io = oo = -6;
    }
    return (
      <path
        key={s}
        d={`M${s * 22},${by + oo} L${s * 8},${by + io}`}
        stroke={c.hair}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    );
  };

  const mouth = () => {
    if (speaking) {
      return (
        <ellipse
          cx={0}
          cy={-228}
          rx={expr === 'sad' || expr === 'cry' ? 6 : angry ? 9 : 8}
          ry={mouthOpen}
          fill="#7f1d1d"
        />
      );
    }
    switch (expr) {
      case 'happy':
      case 'blush':
        return (
          <path d="M-10,-231 Q0,-217 10,-231 Z" fill="#7f1d1d" stroke="#7f1d1d" strokeWidth={2} strokeLinejoin="round" />
        );
      case 'sad':
        return <path d="M-8,-225 Q0,-232 8,-225" {...mk} />;
      case 'cry':
        return <path d="M-9,-224 Q0,-235 9,-224" {...mk} />;
      case 'shock':
        return <ellipse cx={0} cy={-226} rx={6} ry={9} fill="#7f1d1d" />;
      case 'worry':
        return <path d="M-8,-227 Q-4,-231 0,-227 Q4,-223 8,-227" {...mk} />;
      case 'curious':
        return <path d="M-7,-228 Q0,-225 8,-231" {...mk} />;
      case 'sinis':
        return <path d="M-6,-226 L6,-229" {...mk} />;
      case 'angry':
        return (
          <g>
            <rect x={-9} y={-232} width={18} height={9} rx={2} fill="#fff" stroke="#7f1d1d" strokeWidth={2.5} />
            <line x1={-3} y1={-232} x2={-3} y2={-223} stroke="#7f1d1d" strokeWidth={1.5} />
            <line x1={3} y1={-232} x2={3} y2={-223} stroke="#7f1d1d" strokeWidth={1.5} />
          </g>
        );
      default:
        return <path d="M-7,-228 Q0,-224 7,-228" {...mk} />;
    }
  };

  // rambut dibuat mengikuti lingkar kepala (radius 40 di pusat kepala)
  const flatHair = (
    <path d="M-40,-247 A40,40 0 0 1 40,-247 Q36,-268 0,-268 Q-36,-268 -40,-247 Z" fill={c.hair} />
  );
  const quiffHair = (
    <path
      d="M-40,-247 A40,40 0 0 1 40,-247 Q38,-266 22,-270 Q18,-298 -8,-296 Q-30,-290 -34,-266 Q-40,-258 -40,-247 Z"
      fill={c.hair}
    />
  );
  const neatHair = (
    <path
      d="M-40,-247 A40,40 0 0 1 40,-247 Q34,-264 12,-268 Q-14,-266 -34,-258 Q-40,-254 -40,-247 Z"
      fill={c.hair}
    />
  );
  const curlyHair = (
    <g fill={c.hair}>
      <path d="M-40,-247 A40,40 0 0 1 40,-247 Q36,-262 0,-264 Q-36,-262 -40,-247 Z" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const a = Math.PI * (1.1 + i * 0.13);
        return <circle key={i} cx={Math.cos(a) * 38} cy={-247 + Math.sin(a) * 38} r={11} />;
      })}
    </g>
  );
  const hairFront = () => {
    switch (name) {
      case 'Hirzi': // belah tengah
        return (
          <path
            d="M-40,-247 A40,40 0 0 1 40,-247 Q38,-262 24,-266 Q8,-268 0,-256 Q-8,-268 -24,-266 Q-38,-262 -40,-247 Z"
            fill={c.hair}
          />
        );
      case 'Hessam':
        return <path d="M-40,-247 A40,40 0 0 1 40,-247 Q36,-268 0,-268 Q-36,-268 -40,-247 Z" fill={c.hair} />;
      case 'Yusuf':
        return (
          <path
            d="M-40,-247 A40,40 0 0 1 40,-247 Q36,-266 18,-269 Q0,-262 -16,-269 Q-34,-266 -40,-247 Z"
            fill={c.hair}
          />
        );
      case 'S':
        return (
          <path
            d="M-40,-247 A40,40 0 0 1 40,-247 Q30,-262 8,-268 Q-12,-262 -30,-260 Q-38,-256 -40,-247 Z"
            fill={c.hair}
          />
        );
      case 'Udil': // rambut mangkok
        return (
          <path
            d="M-42,-245 A42,42 0 0 1 42,-245 L42,-230 L37,-230 L37,-267 L-37,-267 L-37,-230 L-42,-230 Z"
            fill={c.hair}
          />
        );
      case 'Rakha': // tebal & tegak
        return (
          <path
            d="M-41,-247 Q-47,-298 -22,-304 Q0,-312 22,-304 Q47,-298 41,-247 Q36,-268 0,-268 Q-36,-268 -41,-247 Z"
            fill={c.hair}
          />
        );
      case 'Royan':
        return flatHair;
      case 'Rasya':
      case 'Syauqi':
        return quiffHair;
      case 'Rifky':
      case 'Khaliq':
        return neatHair;
      case 'Raihan':
        return curlyHair;
      case 'Niko': // spiky ala Naruto
        return (
          <g fill={c.hair}>
            <path d="M-40,-247 A40,40 0 0 1 40,-247 Q36,-266 0,-268 Q-36,-266 -40,-247 Z" />
            <polygon points="-38,-262 -58,-282 -30,-276" />
            <polygon points="-30,-276 -40,-310 -8,-284" />
            <polygon points="-12,-284 -6,-316 14,-284" />
            <polygon points="10,-284 28,-312 34,-278" />
            <polygon points="30,-276 60,-290 40,-260" />
            <polygon points="-40,-256 -64,-250 -42,-240" />
          </g>
        );
      case 'Azka': // agak berduri
        return (
          <g fill={c.hair}>
            <path d="M-40,-247 A40,40 0 0 1 40,-247 Q36,-266 0,-268 Q-36,-266 -40,-247 Z" />
            <polygon points="-30,-272 -34,-292 -16,-278" />
            <polygon points="-14,-278 -8,-298 6,-278" />
            <polygon points="6,-278 20,-296 26,-274" />
            <polygon points="24,-272 42,-286 36,-262" />
          </g>
        );
      case 'Febri': // rambut tipis
        return <path d="M-34,-262 Q0,-286 34,-262 Q0,-274 -34,-262 Z" fill={c.hair} />;
      case 'Hafizh': // hampir botak
        return <path d="M-30,-268 Q0,-284 30,-268 Q0,-276 -30,-268 Z" fill={c.hair} opacity={0.6} />;
      case 'Aril': // keriting + topi SMA
        return (
          <g>
            {[-1, 1].map((k) => (
              <circle key={k} cx={k * 38} cy={-254} r={9} fill={c.hair} />
            ))}
            <path d="M-43,-268 Q-44,-306 0,-304 Q44,-306 43,-268 Z" fill="#6b7280" stroke="#4b5563" strokeWidth={2} />
            <path d="M-44,-270 L44,-270 Q48,-264 40,-260 L-40,-260 Q-48,-264 -44,-270 Z" fill="#4b5563" />
          </g>
        );
      default:
        return null;
    }
  };

  const aw = c.armW ?? 12;
  const shortSleeve = !c.girl && !c.long && outfit?.sleeves !== 'long';
  const sleeveFill = c.sleeve ?? topFill;
  const sleeveStroke = c.sleeve || outfit ? 'rgba(0,0,0,0.2)' : '#cbd5e1';
  const arm = (s: number, ang: number) => (
    <g key={s} transform={`translate(${s * 29 * sw},-192) rotate(${ang})`}>
      {shortSleeve ? (
        <>
          <rect x={-(aw - 2) / 2} y={20} width={aw - 2} height={52} rx={(aw - 2) / 2} fill={c.skin} stroke="#e0b48f" strokeWidth={1.5} />
          <rect x={-aw / 2} y={-4} width={aw} height={34} rx={aw / 2} fill={topFill} stroke={sleeveStroke} strokeWidth={2} />
        </>
      ) : (
        <rect x={-aw / 2} y={-4} width={aw} height={74} rx={aw / 2} fill={sleeveFill} stroke={sleeveStroke} strokeWidth={2} />
      )}
      <circle cx={0} cy={76} r={8 + (aw - 12) / 4} fill={c.skin} />
    </g>
  );

  return (
    <g transform={`translate(${x},${y}) rotate(${lean}) scale(${c.size * mul})`}>
      {/* kaki */}
      {!onFloor &&
        [-1, 1].map((s) => {
          const hx = s * 14;
          const lift = walking ? Math.max(0, s * w) * 16 : 0;
          return (
            <g
              key={s}
              transform={`translate(0,${-lift}) rotate(${walking ? s * w * 10 : 0}, ${hx}, -110)`}
            >
              <rect
                x={hx - 8}
                y={sitting ? -55 : -112}
                width={16}
                height={sitting ? 43 : 102}
                rx={6}
                fill={pants}
                stroke={outfit ? 'rgba(0,0,0,0.25)' : c.girl ? '#cbd5e1' : '#4b5563'}
                strokeWidth={1.5}
              />
              <rect x={hx - 11} y={-13} width={24} height={13} rx={6} fill="#1f2937" />
            </g>
          );
        })}

      <g transform={`translate(0,${bob + shift})`}>
        {name === 'S' && (
          <path d="M-42,-250 A42,42 0 0 1 42,-250 L48,-195 Q0,-182 -48,-195 Z" fill={c.hair} />
        )}

        {/* badan + dasi abu-abu */}
        <path d={torsoD} fill={topFill} stroke={outfit ? "rgba(0,0,0,0.25)" : "#cbd5e1"} strokeWidth={2} />
        {!outfit && (
          <>
        <path d="M-12,-202 L0,-186 L12,-202 Z" fill="#e5e7eb" />
        <path d="M-5,-198 L5,-198 L7,-190 L-7,-190 Z" fill="#6b7280" stroke="#4b5563" strokeWidth={1} />
        <path d="M-7,-190 L7,-190 L9,-150 L0,-140 L-9,-150 Z" fill="#6b7280" stroke="#4b5563" strokeWidth={1.2} />
        {/* lencana OSIS: tameng coklat */}
        <g transform={`translate(${18 * sw},-172)`}>
          <path d="M0,-9 L8,-6 L8,3 Q8,9 0,13 Q-8,9 -8,3 L-8,-6 Z" fill="#8b5a2b" stroke="#5a3a1a" strokeWidth={1.5} />
          <path d="M0,-5 L4.5,-3.5 L4.5,2 Q4.5,5.5 0,8 Q-4.5,5.5 -4.5,2 L-4.5,-3.5 Z" fill="#d9a35f" />
        </g>
          </>
        )}
        {outfit?.bottom ? null : c.girl ? (
          <path
            d={`M-30,-118 L30,-118 L40,${skirtBottom} L-40,${skirtBottom} Z`}
            fill="#6b7280"
            stroke="#4b5563"
            strokeWidth={1.5}
          />
        ) : (
          <rect x={-bw} y={-114} width={2 * bw} height={10} rx={3} fill="#4b5563" />
        )}
        <rect x={-8} y={-216} width={16} height={18} fill={c.skin} />
        {c.coat === 'lab' && (
          <g>
            <path d={`M${-tw - 6},-204 L-9,-204 L-14,-56 L${-tw - 6},-56 Z`} fill="#fff" stroke="#cbd5e1" strokeWidth={2} />
            <path d={`M${tw + 6},-204 L9,-204 L14,-56 L${tw + 6},-56 Z`} fill="#fff" stroke="#cbd5e1" strokeWidth={2} />
            <rect x={-tw} y={-150} width={14} height={16} fill="none" stroke="#cbd5e1" strokeWidth={2} />
          </g>
        )}
        {c.coat === 'robe' && (
          <g>
            <path
              d={`M${-tw - 8},-204 L${tw + 8},-204 L${tw + 14},-22 L${-tw - 14},-22 Z`}
              fill="#bfdbfe"
              stroke="#93c5fd"
              strokeWidth={2}
            />
            <line x1={0} y1={-190} x2={0} y2={-22} stroke="#93c5fd" strokeWidth={2} />
            <path d="M-14,-204 L0,-182 L14,-204 Z" fill="#dbeafe" stroke="#93c5fd" strokeWidth={1.5} />
          </g>
        )}

        {arm(-1, angL)}
        {arm(1, angR)}

        {/* kepala */}
        <g transform={`rotate(${tilt}, 0, -210) translate(0,${dip})`}>
          {hj && (
            <path
              d="M-50,-248 Q-52,-302 0,-302 Q52,-302 50,-248 Q56,-210 42,-186 Q0,-176 -42,-186 Q-56,-210 -50,-248 Z"
              fill={hj.fill}
              stroke={hj.stroke}
              strokeWidth={2}
            />
          )}
          {!hj &&
            [-1, 1].map((s) => (
              <circle key={s} cx={s * 37} cy={-245} r={7} fill={c.skin} stroke="#e0b48f" strokeWidth={1.5} />
            ))}
          <circle cx={0} cy={-245} r={faceR} fill={c.skin} stroke="#e0b48f" strokeWidth={1.5} />
          {fury > 0 && <circle cx={0} cy={-245} r={faceR} fill="#ef4444" opacity={fury * 0.72} />}

          <g transform={`translate(${look},${-lookUp * 7})`}>
            {(expr === 'blush' || expr === 'happy') && (
              <>
                <ellipse cx={-25} cy={-234} rx={8} ry={5} fill="#fb7185" opacity={expr === 'blush' ? 0.7 : 0.18} />
                <ellipse cx={25} cy={-234} rx={8} ry={5} fill="#fb7185" opacity={expr === 'blush' ? 0.7 : 0.18} />
              </>
            )}
            {[-1, 1].map(eye)}
            {[-1, 1].map(brow)}
            <path d="M-2,-240 Q0,-237 2,-240" stroke="#c9946b" strokeWidth={2} fill="none" />
            {mouth()}
            {expr === 'cry' &&
              [-1, 1].map((s) => {
                const t = (f * 1.2 + (s > 0 ? 20 : 0)) % 40;
                return (
                  <ellipse key={s} cx={s * 17} cy={-240 + t} rx={3} ry={5} fill="#7dd3fc" opacity={1 - t / 40} />
                );
              })}
            {expr === 'worry' && (
              <path
                d={`M34,${-272 + Math.sin(f * 0.2) * 2} Q30,${-262 + Math.sin(f * 0.2) * 2} 34,${-258 + Math.sin(f * 0.2) * 2} Q38,${-262 + Math.sin(f * 0.2) * 2} 34,${-272 + Math.sin(f * 0.2) * 2} Z`}
                fill="#7dd3fc"
              />
            )}
          </g>

          {hairFront()}
          {hj && (
            <path
              d="M-37,-246 Q-38,-288 0,-288 Q38,-288 37,-246 Q32,-270 0,-270 Q-32,-270 -37,-246 Z"
              fill={hj.fill}
              stroke={hj.stroke}
              strokeWidth={2}
            />
          )}

          {triangle && (
            <g>
              <circle cx={24} cy={-276} r={16 + Math.sin(f * 0.2) * 3} fill="rgba(255,255,255,0.35)" />
              <polygon points="24,-292 35,-270 13,-270" fill="#9ca3af" stroke="#4b5563" strokeWidth={2} />
            </g>
          )}

          {c.glasses && (
            <g transform={`translate(${look},${-lookUp * 7})`} stroke={c.glasses} strokeWidth={3} fill="rgba(186,230,253,0.25)">
              {c.glassShape === 'square' ? (
                <>
                  <rect x={-28} y={-258} width={26} height={20} rx={3} />
                  <rect x={2} y={-258} width={26} height={20} rx={3} />
                </>
              ) : (
                <>
                  <circle cx={-15} cy={-248} r={12} />
                  <circle cx={15} cy={-248} r={12} />
                </>
              )}
              <line x1={-3} y1={-249} x2={3} y2={-249} />
              <line x1={-27} y1={-250} x2={-37} y2={-252} />
              <line x1={27} y1={-250} x2={37} y2={-252} />
            </g>
          )}

          {/* asap dari telinga saat marah */}
          {fury > 0.3 &&
            [-1, 1].flatMap((s) =>
              [0, 1, 2].map((i) => {
                const t = ((f * 1.5 + i * 15 + (s > 0 ? 7 : 0)) % 45) / 45;
                return (
                  <circle
                    key={`${s}${i}`}
                    cx={s * (42 + t * 20 + i * 4)}
                    cy={-262 - t * 62}
                    r={7 + t * 12}
                    fill="#e5e7eb"
                    opacity={(1 - t) * 0.9 * fury}
                  />
                );
              }),
            )}
        </g>
      </g>

      {/* duduk bersila di lantai */}
      {onFloor && (
        <g>
          <path
            d="M-54,-16 Q-54,-36 -30,-36 L30,-36 Q54,-36 54,-16 Q54,0 30,0 L-30,0 Q-54,0 -54,-16 Z"
            fill="#6b7280"
            stroke="#4b5563"
            strokeWidth={1.5}
          />
          <ellipse cx={-30} cy={-7} rx={14} ry={8} fill="#1f2937" />
          <ellipse cx={30} cy={-7} rx={14} ry={8} fill="#1f2937" />
          <path d="M-10,-36 Q0,-18 10,-36" stroke="#4b5563" fill="none" strokeWidth={2} />
        </g>
      )}
    </g>
  );
};
