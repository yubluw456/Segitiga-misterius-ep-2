import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
export const LINE = sec(6); // 1 slot dialog = 6 detik
export const SHOW = sec(3); // bubble tampil 3 detik (sisanya jeda sampai slot 6 detik habis)
export const FONT = "'Baloo 2', 'Comic Sans MS', 'Trebuchet MS', sans-serif";

export type Name = 'Ara' | 'Hirzi' | 'Hessam' | 'S' | 'Yusuf' | 'Udil' | 'Rakha' | 'Naura';
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
  zs?: [number, number]; // zoom kamera awal/akhir
};

const SHIFT: Record<Pose, number> = { stand: 0, sit: 55, floor: 98 };

export const CHARS: Record<
  Name,
  {
    skin: string;
    hair: string;
    size: number;
    girl: boolean;
    glasses?: string;
    sw?: number;
    hijab?: { fill: string; stroke: string };
  }
> = {
  Ara: { skin: '#f3cfae', hair: '#3a2a20', size: 1.1, girl: true, hijab: { fill: '#f4b6c9', stroke: '#e58fae' } },
  Hirzi: { skin: '#f1c9a5', hair: '#1f1f1f', size: 1.3, girl: false },
  Hessam: { skin: '#f3d0ad', hair: '#2b2118', size: 1.3, girl: false, glasses: '#111827' },
  S: { skin: '#f6d5b8', hair: '#3b2a20', size: 1.22, girl: true, glasses: '#9d174d' },
  Yusuf: { skin: '#dc9f7e', hair: '#151515', size: 1.45, girl: false }, // lebih cerah & kemerahan
  Udil: { skin: '#f1c9a5', hair: '#1a1a1a', size: 1.28, girl: false, glasses: '#111827' },
  Rakha: { skin: '#e8bd98', hair: '#151515', size: 1.3, girl: false, sw: 1.25 }, // bahu lebar
  Naura: { skin: '#f6d5b8', hair: '#3a2a20', size: 1.18, girl: true, glasses: '#374151', hijab: { fill: '#ffffff', stroke: '#cbd5e1' } },
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
        p = ease((f - a.t) / (b.t - a.t));
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

export const lineStarts = (lines: Line[], intro: number) => {
  let s = intro;
  return lines.map((l) => {
    const a = s;
    s += l.dur ?? LINE;
    return a;
  });
};

// kamera otomatis menuju pembicara (pelan-pelan mendekat selama dia bicara)
export function autoKeys(
  lines: Line[],
  intro: number,
  places: Partial<Record<Name, Place>>,
  first: CamKey,
  zA = 1.35,
  zB = 1.6,
): CamKey[] {
  const st = lineStarts(lines, intro);
  const keys: CamKey[] = [first];
  lines.forEach((l, i) => {
    const p = places[l.who];
    if (!l.text || !p) return;
    const [a, b] = l.zs ?? [zA, zB];
    keys.push(focus(st[i], l.who, p, a));
    keys.push(focus(st[i] + SHOW, l.who, p, b));
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
export function useLine(lines: Line[], intro: number) {
  const f = useCurrentFrame();
  const st = lineStarts(lines, intro);
  let idx = -1;
  st.forEach((s, i) => {
    if (f >= s) idx = i;
  });
  const cur = idx >= 0 ? lines[idx] : undefined;
  const within = idx >= 0 ? f - st[idx] : 0;
  const dur = cur ? cur.dur ?? LINE : 0;
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
}> = ({ who, text, x, bottom, within, big }) => {
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
        background: '#fff',
        border: `5px solid ${color}`,
        borderRadius: 28,
        padding: '22px 28px 18px',
        fontSize: big ? 54 : 36,
        fontWeight: big ? 900 : 800,
        lineHeight: 1.2,
        color: big ? '#b91c1c' : '#1f2937',
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
          background: '#fff',
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
  inF = 12,
  outF = 12,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(f, [0, inF, durationInFrames - outF, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
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
}) => {
  const cf = useCurrentFrame();
  const f = frozen ? 0 : cf;
  const c = CHARS[name];
  const hj = c.hijab;
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

  const tilt = speaking ? Math.sin(f * 0.12 + seed) * 2.5 : expr === 'sad' || expr === 'cry' ? 4 : 0;
  const dip = expr === 'sad' || expr === 'cry' ? 3 : 0;
  const look = lookDir * 5;
  const pants = c.girl ? '#f8fafc' : '#6b7280';
  const mk = { stroke: '#7f1d1d', strokeWidth: 3, fill: 'none', strokeLinecap: 'round' as const };
  const skirtBottom = onFloor ? -92 : sitting ? -58 : -46;

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
      default:
        return null;
    }
  };

  const arm = (s: number, ang: number) => (
    <g key={s} transform={`translate(${s * 29 * sw},-192) rotate(${ang})`}>
      <rect x={-6} y={-4} width={12} height={74} rx={6} fill="#fff" stroke="#cbd5e1" strokeWidth={2} />
      <circle cx={0} cy={76} r={8} fill={c.skin} />
    </g>
  );

  return (
    <g transform={`translate(${x},${y}) scale(${c.size * mul})`}>
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
                stroke={c.girl ? '#cbd5e1' : '#4b5563'}
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
        <rect x={-28 * sw} y={-202} width={56 * sw} height={96} rx={12} fill="#fff" stroke="#cbd5e1" strokeWidth={2} />
        <path d="M-12,-202 L0,-186 L12,-202 Z" fill="#e5e7eb" />
        <path d="M-5,-198 L5,-198 L7,-190 L-7,-190 Z" fill="#6b7280" stroke="#4b5563" strokeWidth={1} />
        <path d="M-7,-190 L7,-190 L9,-150 L0,-140 L-9,-150 Z" fill="#6b7280" stroke="#4b5563" strokeWidth={1.2} />
        <circle cx={18 * sw} cy={-172} r={5} fill="#ef4444" />
        {c.girl ? (
          <path
            d={`M-30,-118 L30,-118 L40,${skirtBottom} L-40,${skirtBottom} Z`}
            fill="#6b7280"
            stroke="#4b5563"
            strokeWidth={1.5}
          />
        ) : (
          <rect x={-28 * sw} y={-114} width={56 * sw} height={10} rx={3} fill="#4b5563" />
        )}
        <rect x={-8} y={-216} width={16} height={18} fill={c.skin} />

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

          <g transform={`translate(${look},0)`}>
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

          {c.glasses && (
            <g transform={`translate(${look},0)`} stroke={c.glasses} strokeWidth={3} fill="rgba(186,230,253,0.25)">
              <circle cx={-15} cy={-248} r={12} />
              <circle cx={15} cy={-248} r={12} />
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
