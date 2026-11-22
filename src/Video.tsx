import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

const LINE = sec(6); // 1 slot dialog
const SHOW = sec(5); // bubble terlihat
const INTRO = sec(3); // jeda awal scene

const FONT = "'Baloo 2', 'Comic Sans MS', 'Trebuchet MS', sans-serif";

type Name = 'Ara' | 'Hirzi' | 'Hessam' | 'S' | 'Yusuf';
type Expr = 'neutral' | 'happy' | 'blush' | 'sad' | 'cry' | 'shock' | 'worry' | 'curious';
type Line = { who: Name; text: string; e?: Partial<Record<Name, Expr>> };

type Key = 'title' | 's1' | 's2' | 'montage' | 'hah' | 'heart' | 's3' | 'end';
const order: Key[] = ['title', 's1', 's2', 'montage', 'hah', 'heart', 's3', 'end'];
const D: Record<Key, number> = {
  title: sec(4),
  s1: INTRO + 3 * LINE,
  s2: INTRO + 6 * LINE,
  montage: sec(7),
  hah: LINE,
  heart: sec(5),
  s3: INTRO + 5 * LINE,
  end: sec(5),
};
const START = {} as Record<Key, number>;
let acc = 0;
for (const k of order) {
  START[k] = acc;
  acc += D[k];
}
export const TOTAL_FRAMES = acc;

const CHARS: Record<
  Name,
  { skin: string; hair: string; size: number; girl: boolean; glasses?: string }
> = {
  Ara: { skin: '#f3cfae', hair: '#3a2a20', size: 1.1, girl: true },
  Hirzi: { skin: '#f1c9a5', hair: '#1f1f1f', size: 1.3, girl: false },
  Hessam: { skin: '#f3d0ad', hair: '#2b2118', size: 1.3, girl: false, glasses: '#111827' },
  S: { skin: '#f6d5b8', hair: '#3b2a20', size: 1.22, girl: true, glasses: '#9d174d' },
  Yusuf: { skin: '#b9835a', hair: '#151515', size: 1.45, girl: false },
};
const HIJAB = '#f4b6c9';
const BUBBLE_COLOR: Record<Name, string> = {
  Ara: '#f9a8d4',
  Hirzi: '#93c5fd',
  Hessam: '#86efac',
  S: '#c4b5fd',
  Yusuf: '#fdba74',
};

type CharProps = {
  name: Name;
  x: number;
  y: number;
  expr?: Expr;
  speaking?: boolean;
  walking?: boolean;
  sitting?: boolean;
  lookDir?: number;
  holdBag?: boolean;
  seed?: number;
};

const Character: React.FC<CharProps> = ({
  name,
  x,
  y,
  expr = 'neutral',
  speaking = false,
  walking = false,
  sitting = false,
  lookDir = 0,
  holdBag = false,
  seed = 0,
}) => {
  const f = useCurrentFrame();
  const c = CHARS[name];
  const isAra = name === 'Ara';

  const w = walking ? Math.sin(f * 0.35 + seed) : 0;
  const bob = walking ? -Math.abs(w) * 9 : Math.sin(f * 0.08 + seed) * 1.5;
  const shift = sitting ? 55 : 0;
  const swing = w * 25;
  const talk = speaking ? (Math.sin(f * 0.9 + seed) + 1) / 2 : 0;
  const mouthOpen = 1.5 + talk * 8;
  const blink = (f + seed * 13) % 105 < 5;
  const sadish = expr === 'sad' || expr === 'cry' || expr === 'worry';
  const gest = speaking && !walking ? Math.sin(f * 0.18 + seed) : 0;

  let angL = 5 + swing;
  let angR = -5 + swing;
  if (speaking && !walking) angR = -(38 + 22 * gest);
  if (holdBag) {
    angR = -(8 - swing * 0.4);
    if (speaking && !walking) angL = 38 + 22 * gest;
  }

  const tilt = speaking ? Math.sin(f * 0.12 + seed) * 2.5 : expr === 'sad' || expr === 'cry' ? 4 : 0;
  const dip = expr === 'sad' || expr === 'cry' ? 3 : 0;
  const look = lookDir * 5;
  const pants = c.girl ? '#f8fafc' : '#6b7280';
  const mk = { stroke: '#7f1d1d', strokeWidth: 3, fill: 'none', strokeLinecap: 'round' as const };

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
    return (
      <g key={s}>
        <ellipse cx={cx} cy={cy + (sadish ? 1.5 : 0)} rx={5} ry={blink ? 0.8 : 6.5} fill="#1f2937" />
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
          rx={expr === 'sad' || expr === 'cry' ? 6 : 8}
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
      default:
        return <path d="M-7,-228 Q0,-224 7,-228" {...mk} />;
    }
  };

  const hairFront = () => {
    switch (name) {
      case 'Hirzi':
        return (
          <path
            d="M-41,-246 Q-46,-296 0,-294 Q46,-296 41,-246 Q38,-270 24,-274 Q8,-276 0,-262 Q-8,-276 -24,-274 Q-38,-270 -41,-246 Z"
            fill={c.hair}
          />
        );
      case 'Hessam':
        return (
          <path
            d="M-41,-246 Q-46,-296 0,-294 Q46,-296 41,-246 Q36,-272 0,-272 Q-36,-272 -41,-246 Z"
            fill={c.hair}
          />
        );
      case 'Yusuf':
        return (
          <path
            d="M-41,-246 Q-48,-290 -24,-290 L-18,-300 L-8,-290 L2,-302 L10,-290 L22,-298 L26,-288 Q48,-290 41,-246 Q36,-268 0,-270 Q-36,-268 -41,-246 Z"
            fill={c.hair}
          />
        );
      case 'S':
        return (
          <path
            d="M-41,-246 Q-46,-296 0,-294 Q46,-296 41,-246 Q30,-264 10,-270 Q-10,-262 -28,-262 Q-38,-258 -41,-246 Z"
            fill={c.hair}
          />
        );
      default:
        return null;
    }
  };

  const arm = (s: number, ang: number, bag: boolean) => (
    <g key={s} transform={`translate(${s * 29},-192) rotate(${ang})`}>
      <rect x={-6} y={-4} width={12} height={74} rx={6} fill="#fff" stroke="#cbd5e1" strokeWidth={2} />
      <circle cx={0} cy={76} r={8} fill={c.skin} />
      {bag && (
        <g transform={`translate(0,80) rotate(${-ang})`}>
          <path d="M-8,0 Q0,-8 8,0" stroke="#7e22ce" strokeWidth={3} fill="none" />
          <rect x={-9} y={22} width={8} height={22} rx={3} fill="#bae6fd" opacity={0.85} />
          <rect x={3} y={26} width={8} height={20} rx={3} fill="#bbf7d0" opacity={0.85} />
          <path
            d="M-6,2 L6,2 L22,18 Q28,52 16,70 L-16,70 Q-28,52 -22,18 Z"
            fill="#a855f7"
            stroke="#7e22ce"
            strokeWidth={2}
            opacity={0.92}
          />
          <rect x={-8} y={28} width={7} height={20} rx={3} fill="#bae6fd" opacity={0.6} />
        </g>
      )}
    </g>
  );

  return (
    <g transform={`translate(${x},${y}) scale(${c.size})`}>
      {[-1, 1].map((s) => {
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
          <path d="M-46,-250 Q-48,-302 0,-300 Q48,-302 46,-250 L50,-188 Q0,-176 -50,-188 Z" fill={c.hair} />
        )}

        <rect x={-28} y={-202} width={56} height={96} rx={12} fill="#fff" stroke="#cbd5e1" strokeWidth={2} />
        <path d="M-12,-202 L0,-186 L12,-202 Z" fill="#e5e7eb" />
        <circle cx={16} cy={-172} r={5} fill="#ef4444" />
        {c.girl ? (
          <path
            d={`M-30,-118 L30,-118 L40,${sitting ? -58 : -46} L-40,${sitting ? -58 : -46} Z`}
            fill="#6b7280"
            stroke="#4b5563"
            strokeWidth={1.5}
          />
        ) : (
          <rect x={-28} y={-114} width={56} height={10} rx={3} fill="#4b5563" />
        )}
        <rect x={-8} y={-216} width={16} height={18} fill={c.skin} />

        {arm(-1, angL, false)}
        {arm(1, angR, holdBag)}

        <g transform={`rotate(${tilt}, 0, -210) translate(0,${dip})`}>
          {isAra && (
            <path
              d="M-50,-248 Q-52,-302 0,-302 Q52,-302 50,-248 Q56,-210 42,-186 Q0,-176 -42,-186 Q-56,-210 -50,-248 Z"
              fill={HIJAB}
              stroke="#e58fae"
              strokeWidth={2}
            />
          )}
          {!isAra &&
            [-1, 1].map((s) => (
              <circle key={s} cx={s * 37} cy={-245} r={7} fill={c.skin} stroke="#e0b48f" strokeWidth={1.5} />
            ))}
          <circle cx={0} cy={-245} r={isAra ? 34 : 37} fill={c.skin} stroke="#e0b48f" strokeWidth={1.5} />

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
          {isAra && (
            <path
              d="M-37,-246 Q-38,-288 0,-288 Q38,-288 37,-246 Q32,-270 0,-270 Q-32,-270 -37,-246 Z"
              fill={HIJAB}
              stroke="#e58fae"
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
        </g>
      </g>
    </g>
  );
};

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
    {children}
  </svg>
);

const Fade: React.FC<{ children: React.ReactNode; inF?: number; outF?: number }> = ({
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

function useLine(lines: Line[], intro: number) {
  const f = useCurrentFrame();
  const t = f - intro;
  const idx = t < 0 ? -1 : Math.min(Math.floor(t / LINE), lines.length - 1);
  const within = t - idx * LINE;
  const active = idx >= 0 && t < lines.length * LINE && within < SHOW;
  const cur = idx >= 0 ? lines[idx] : undefined;
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

const Bubble: React.FC<{ who: Name; text: string; x: number; within: number }> = ({
  who,
  text,
  x,
  within,
}) => {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: Math.max(0, within), fps, config: { damping: 12, stiffness: 140 } });
  const fadeOut = interpolate(within, [SHOW - 8, SHOW], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cx = Math.max(330, Math.min(950, x));
  const color = BUBBLE_COLOR[who];
  return (
    <div
      style={{
        position: 'absolute',
        left: cx,
        top: 40,
        transform: `translateX(-50%) scale(${0.6 + 0.4 * pop})`,
        transformOrigin: '50% 100%',
        opacity: Math.min(1, pop * 1.5) * fadeOut,
        maxWidth: 640,
        minWidth: 200,
        background: '#fff',
        border: `5px solid ${color}`,
        borderRadius: 28,
        padding: '22px 28px 18px',
        fontSize: 36,
        fontWeight: 800,
        lineHeight: 1.25,
        color: '#1f2937',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -20,
          left: 20,
          background: color,
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

const Hearts: React.FC<{ cx: number; baseY: number; n?: number }> = ({ cx, baseY, n = 9 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const period = 100;
        const t = ((f + i * (period / n)) % period) / period;
        const y = baseY - t * 260;
        const x = cx + Math.sin(t * Math.PI * 2 + i) * 50 + ((i % 3) - 1) * 40;
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize={34 + (i % 4) * 10}
            textAnchor="middle"
            opacity={Math.sin(t * Math.PI)}
          >
            {i % 2 ? '💗' : '💖'}
          </text>
        );
      })}
    </>
  );
};

const ClassroomBG: React.FC = () => (
  <g>
    <rect width={1280} height={720} fill="#fdf2dc" />
    <rect y={470} width={1280} height={250} fill="#d9b48a" />
    {Array.from({ length: 9 }).map((_, i) => (
      <line key={i} x1={0} x2={1280} y1={500 + i * 28} y2={500 + i * 28} stroke="#c49a6c" strokeWidth={2} />
    ))}
    <rect y={462} width={1280} height={10} fill="#b98a5b" />
    <rect x={70} y={90} width={230} height={200} rx={8} fill="#bfe3ff" stroke="#8b6b4a" strokeWidth={8} />
    <line x1={185} y1={90} x2={185} y2={290} stroke="#8b6b4a" strokeWidth={6} />
    <line x1={70} y1={190} x2={300} y2={190} stroke="#8b6b4a" strokeWidth={6} />
    <circle cx={120} cy={130} r={18} fill="#fff" opacity={0.8} />
    <rect x={420} y={70} width={470} height={230} fill="#fff" stroke="#94a3b8" strokeWidth={10} />
    <text x={655} y={125} textAnchor="middle" fontSize={34} fontWeight={800} fill="#1d4ed8" fontFamily={FONT}>
      Matematika Lanjut
    </text>
    <text x={655} y={185} textAnchor="middle" fontSize={28} fill="#334155" fontFamily={FONT}>
      ∑ (x² + y²) = ∫ f(x) dx
    </text>
    <text x={655} y={238} textAnchor="middle" fontSize={28} fill="#334155" fontFamily={FONT}>
      sin²θ + cos²θ = 1
    </text>
    <circle cx={1110} cy={130} r={45} fill="#fff" stroke="#64748b" strokeWidth={6} />
    <line x1={1110} y1={130} x2={1110} y2={100} stroke="#1f2937" strokeWidth={4} />
    <line x1={1110} y1={130} x2={1132} y2={140} stroke="#1f2937" strokeWidth={4} />
  </g>
);

const HallBG: React.FC<{ scroll: number }> = ({ scroll }) => {
  const off = scroll % 320;
  const offT = scroll % 160;
  return (
    <g>
      <rect width={1280} height={720} fill="#e0ecff" />
      {[-1, 0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${i * 320 - off},0)`}>
          <rect x={40} y={110} width={110} height={360} rx={6} fill="#b9835a" stroke="#8b5e3c" strokeWidth={6} />
          <circle cx={130} cy={300} r={7} fill="#fde68a" />
          <rect x={190} y={130} width={100} height={150} rx={6} fill="#bfe3ff" stroke="#94a3b8" strokeWidth={6} />
          <line x1={240} y1={130} x2={240} y2={280} stroke="#94a3b8" strokeWidth={4} />
        </g>
      ))}
      <rect y={440} width={1280} height={30} fill="#c7d2e5" />
      <rect y={470} width={1280} height={250} fill="#ece7df" />
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={i} x1={i * 160 - offT} y1={470} x2={i * 160 - offT - 60} y2={720} stroke="#d6cfc2" strokeWidth={3} />
      ))}
      {[540, 620, 700].map((yy) => (
        <line key={yy} x1={0} y1={yy} x2={1280} y2={yy} stroke="#d6cfc2" strokeWidth={3} />
      ))}
    </g>
  );
};

const ParkBG: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ec9f5" />
          <stop offset="1" stopColor="#e6f4ff" />
        </linearGradient>
      </defs>
      <rect width={1280} height={480} fill="url(#sky)" />
      <circle cx={1100} cy={110} r={55} fill="#fde68a" />
      {[0, 1, 2].map((i) => {
        const cx = ((i * 520 + f * 0.4) % 1700) - 200;
        const cy = 90 + i * 60;
        return (
          <g key={i} opacity={0.9}>
            <ellipse cx={cx} cy={cy} rx={80} ry={26} fill="#fff" />
            <ellipse cx={cx + 40} cy={cy - 16} rx={50} ry={24} fill="#fff" />
            <ellipse cx={cx - 40} cy={cy - 8} rx={46} ry={20} fill="#fff" />
          </g>
        );
      })}
      {[90, 330, 800, 1080, 1220].map((tx, i) => (
        <g key={tx}>
          <rect x={tx - 14} y={300} width={28} height={190} fill="#8b5e3c" />
          <circle cx={tx} cy={260} r={90 + (i % 2) * 15} fill="#4ea85a" />
          <circle cx={tx - 50} cy={300} r={60} fill="#5bb866" />
          <circle cx={tx + 50} cy={300} r={60} fill="#5bb866" />
        </g>
      ))}
      <rect y={470} width={1280} height={250} fill="#7fc66a" />
      <path d="M0,640 Q640,590 1280,640 L1280,720 L0,720 Z" fill="#e7d3a8" />
      <rect x={420} y={470} width={200} height={90} rx={8} fill="#a0643a" stroke="#7a4a27" strokeWidth={4} />
      <rect x={405} y={590} width={230} height={18} rx={4} fill="#8b5230" stroke="#7a4a27" strokeWidth={3} />
      <rect x={425} y={608} width={12} height={52} fill="#6b4226" />
      <rect x={603} y={608} width={12} height={52} fill="#6b4226" />
    </g>
  );
};

const TitleCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: Math.max(0, f - 8), fps, config: { damping: 11 } });
  const pop2 = spring({ frame: Math.max(0, f - 36), fps, config: { damping: 12 } });
  return (
    <Fade>
      <AbsoluteFill
        style={{
          background: 'linear-gradient(135deg,#2e1065,#9d174d 60%,#f472b6)',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
        }}
      >
        <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
          {[0, 1, 2].map((i) => {
            const cx = 240 + i * 400;
            const cy = 150 + (i % 2) * 380;
            const r = 70 + i * 12;
            return (
              <polygon
                key={i}
                points={`${cx},${cy - r} ${cx - r},${cy + r * 0.8} ${cx + r},${cy + r * 0.8}`}
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={6}
                transform={`rotate(${f * (i % 2 ? -0.8 : 0.8)} ${cx} ${cy})`}
              />
            );
          })}
          {[0, 1, 2, 3].map((i) => (
            <text
              key={i}
              x={140 + i * 340}
              y={360 + Math.sin(f * 0.06 + i) * 24}
              fontSize={70}
              fill="rgba(255,255,255,0.4)"
              fontFamily={FONT}
            >
              ?
            </text>
          ))}
        </svg>
        <div
          style={{
            transform: `scale(${pop})`,
            fontSize: 108,
            fontWeight: 800,
            color: '#fff',
            textShadow: '0 6px 0 #831843, 0 12px 30px rgba(0,0,0,0.4)',
            textAlign: 'center',
            letterSpacing: 2,
          }}
        >
          SEGITIGA MISTERIUS
        </div>
        <div
          style={{
            transform: `scale(${pop2})`,
            marginTop: 20,
            fontSize: 48,
            fontWeight: 800,
            color: '#831843',
            background: '#fff',
            padding: '4px 40px',
            borderRadius: 40,
          }}
        >
          Episode 2
        </div>
      </AbsoluteFill>
    </Fade>
  );
};

const L1: Line[] = [
  { who: 'Ara', text: 'sam, kamu sama hirzi udah temenan berapa lama sihhh?', e: { Ara: 'curious', Hessam: 'neutral' } },
  { who: 'Hessam', text: 'semenjak SD si. Emangnya kenapa?', e: { Hessam: 'curious', Ara: 'happy' } },
  { who: 'Ara', text: 'Ada dehh', e: { Ara: 'blush', Hessam: 'curious' } },
];

const Scene1: React.FC = () => {
  const { within, line, speaker, ex } = useLine(L1, INTRO);
  const xs: Partial<Record<Name, number>> = { Ara: 380, Hessam: 900 };
  return (
    <Fade>
      <AbsoluteFill>
        <Stage>
          <ClassroomBG />
          <rect x={325} y={480} width={110} height={130} rx={10} fill="#8b5e3c" />
          <rect x={845} y={470} width={110} height={140} rx={10} fill="#8b5e3c" />
          <Character name="Ara" x={380} y={655} sitting lookDir={1} expr={ex('Ara')} speaking={speaker === 'Ara'} seed={1} />
          <Character name="Hessam" x={900} y={655} sitting lookDir={-1} expr={ex('Hessam')} speaking={speaker === 'Hessam'} seed={5} />
          <rect x={230} y={582} width={820} height={26} rx={6} fill="#c08a52" stroke="#8a5a2b" strokeWidth={4} />
          <rect x={260} y={608} width={760} height={40} fill="#a8733f" />
          <rect x={270} y={648} width={22} height={72} fill="#8a5a2b" />
          <rect x={988} y={648} width={22} height={72} fill="#8a5a2b" />
          <rect x={430} y={566} width={110} height={16} fill="#60a5fa" />
          <rect x={436} y={552} width={100} height={14} fill="#fbbf24" />
          <rect x={760} y={574} width={90} height={8} fill="#fff" stroke="#cbd5e1" />
          <g transform="translate(640,582)">
            <rect x={-18} y={-78} width={36} height={78} rx={8} fill="#111" />
            <rect x={-20} y={-88} width={40} height={14} rx={5} fill="#2b2b2b" />
            <rect x={-4} y={-96} width={8} height={8} rx={3} fill="#444" />
            <rect x={-12} y={-62} width={5} height={40} rx={2} fill="#fff" opacity={0.18} />
          </g>
        </Stage>
        {line && <Bubble who={line.who} text={line.text} x={xs[line.who] ?? 640} within={within} />}
      </AbsoluteFill>
    </Fade>
  );
};

const L2: Line[] = [
  { who: 'Ara', text: 'Ih zii, akuu tadii ngomong sama hessam!', e: { Ara: 'happy', Hirzi: 'neutral' } },
  { who: 'Hirzi', text: 'terus emangnya kenapa?', e: { Hirzi: 'curious', Ara: 'happy' } },
  { who: 'Ara', text: 'iiiihh kan aku suka cowo yang kacamataan 💗', e: { Ara: 'blush', Hirzi: 'neutral' } },
  { who: 'Hirzi', text: 'loh kamu gatau kah', e: { Hirzi: 'worry', Ara: 'curious' } },
  { who: 'Ara', text: 'hah, kenapa ada apa?!', e: { Ara: 'shock', Hirzi: 'worry' } },
  { who: 'Hirzi', text: 'dia udh punya deketan', e: { Hirzi: 'worry', Ara: 'shock' } },
];
const LHAH: Line[] = [{ who: 'Ara', text: 'Hah...', e: { Ara: 'shock', Hirzi: 'worry' } }];

const BrokenHeart: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: Math.max(0, f - 10), fps, config: { damping: 8 } });
  const y = 270 - Math.min(f, 90) * 0.4 + Math.sin(f * 0.1) * 4;
  return (
    <text
      x={470}
      y={y}
      fontSize={100 * pop}
      textAnchor="middle"
      transform={`rotate(${Math.sin(f * 0.15) * 6} 470 ${y})`}
    >
      💔
    </text>
  );
};

const HallScene: React.FC<{
  lines: Line[];
  intro: number;
  walking: boolean;
  base?: Partial<Record<Name, Expr>>;
  sadMood?: boolean;
}> = ({ lines, intro, walking, base = {}, sadMood = false }) => {
  const { f, within, line, speaker, ex } = useLine(lines, intro);
  const xs: Partial<Record<Name, number>> = { Ara: 470, Hirzi: 820 };
  return (
    <Fade>
      <AbsoluteFill>
        <Stage>
          <HallBG scroll={walking ? f * 3 : 60} />
          <Character
            name="Hirzi"
            x={820}
            y={668}
            walking={walking}
            lookDir={-0.7}
            expr={ex('Hirzi', base.Hirzi ?? 'neutral')}
            speaking={speaker === 'Hirzi'}
            seed={3}
          />
          <Character
            name="Ara"
            x={470}
            y={668}
            walking={walking}
            holdBag
            lookDir={0.7}
            expr={ex('Ara', base.Ara ?? 'neutral')}
            speaking={speaker === 'Ara'}
            seed={0}
          />
          {sadMood && <rect width={1280} height={720} fill="#1e2a5a" opacity={0.28} />}
          {sadMood && <BrokenHeart />}
        </Stage>
        {line && <Bubble who={line.who} text={line.text} x={xs[line.who] ?? 640} within={within} />}
      </AbsoluteFill>
    </Fade>
  );
};

const Scene2: React.FC = () => <HallScene lines={L2} intro={INTRO} walking />;
const SceneHah: React.FC = () => <HallScene lines={LHAH} intro={0} walking={false} />;
const SceneHeart: React.FC = () => (
  <HallScene lines={[]} intro={0} walking={false} base={{ Ara: 'cry', Hirzi: 'worry' }} sadMood />
);

const MontageScene: React.FC = () => {
  const f = useCurrentFrame();
  const hTalk = Math.floor(f / 45) % 2 === 0;
  return (
    <Fade>
      <AbsoluteFill>
        <Stage>
          <HallBG scroll={140} />
          <Character name="Hessam" x={500} y={668} lookDir={1} expr="happy" speaking={hTalk} seed={2} />
          <Character name="S" x={790} y={668} lookDir={-1} expr="blush" speaking={!hTalk} seed={7} />
          <defs>
            <radialGradient id="dream" cx="50%" cy="50%" r="75%">
              <stop offset="0" stopColor="#ffb6d5" stopOpacity={0.25} />
              <stop offset="0.6" stopColor="#ffb6d5" stopOpacity={0} />
              <stop offset="1" stopColor="#3c1450" stopOpacity={0.55} />
            </radialGradient>
          </defs>
          <rect width={1280} height={720} fill="url(#dream)" />
          <Hearts cx={645} baseY={330} />
        </Stage>
      </AbsoluteFill>
    </Fade>
  );
};

const L3: Line[] = [
  { who: 'Ara', text: 'kenapa si cowo yang aku sukai udah punya...', e: { Ara: 'sad' } },
  { who: 'Ara', text: 'kayak di angkatan ku ini selalu gagall ihh', e: { Ara: 'sad' } },
  { who: 'Ara', text: 'padahal aku sudah ngasi kode nge love status nya...', e: { Ara: 'cry' } },
  { who: 'Yusuf', text: 'kamu kenapa sedih ra?', e: { Yusuf: 'worry', Ara: 'cry' } },
  { who: 'Ara', text: 'yusuf..?', e: { Ara: 'shock', Yusuf: 'worry' } },
];

const Scene3: React.FC = () => {
  const { f, idx, within, line, speaker, ex } = useLine(L3, INTRO);
  const yStart = INTRO + 3 * LINE - 80;
  const yx = interpolate(f, [yStart, yStart + 80], [1450, 930], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const yWalking = f >= yStart && f < yStart + 80;
  const mood = interpolate(f, [0, 560, 700], [0.22, 0.22, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const xs: Partial<Record<Name, number>> = { Ara: 520, Yusuf: yx };
  return (
    <Fade>
      <AbsoluteFill>
        <Stage>
          <ParkBG />
          <Character
            name="Ara"
            x={520}
            y={655}
            sitting
            lookDir={idx >= 3 ? 1 : 0}
            expr={ex('Ara', 'sad')}
            speaking={speaker === 'Ara'}
            seed={1}
          />
          <Character
            name="Yusuf"
            x={yx}
            y={668}
            walking={yWalking}
            lookDir={-1}
            expr={ex('Yusuf')}
            speaking={speaker === 'Yusuf'}
            seed={9}
          />
          <rect width={1280} height={720} fill="#475569" opacity={mood} />
        </Stage>
        {line && <Bubble who={line.who} text={line.text} x={xs[line.who] ?? 640} within={within} />}
      </AbsoluteFill>
    </Fade>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: Math.max(0, f - 8), fps, config: { damping: 10 } });
  const pulse = 1 + Math.sin(f * 0.2) * 0.03;
  return (
    <Fade outF={1}>
      <AbsoluteFill
        style={{
          background: 'linear-gradient(135deg,#0f172a,#4c1d95 70%,#9d174d)',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
        }}
      >
        <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <text
              key={i}
              x={120 + i * 260}
              y={160 + ((i * 97) % 400) + Math.sin(f * 0.07 + i) * 20}
              fontSize={60 + (i % 3) * 20}
              fill="rgba(255,255,255,0.25)"
              fontFamily={FONT}
            >
              ?
            </text>
          ))}
        </svg>
        <div
          style={{
            transform: `scale(${pop * pulse})`,
            fontSize: 120,
            fontWeight: 800,
            color: '#fff',
            textShadow: '0 6px 0 #831843, 0 12px 30px rgba(0,0,0,0.5)',
          }}
        >
          BERSAMBUNGG
        </div>
        <div style={{ marginTop: 16, fontSize: 34, color: '#f9a8d4', fontWeight: 700 }}>
          Segitiga Misterius • Episode 2
        </div>
      </AbsoluteFill>
    </Fade>
  );
};

export const SegitigaMisterius: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: FONT }}>
    <Sequence from={START.title} durationInFrames={D.title}>
      <TitleCard />
    </Sequence>
    <Sequence from={START.s1} durationInFrames={D.s1}>
      <Scene1 />
    </Sequence>
    <Sequence from={START.s2} durationInFrames={D.s2}>
      <Scene2 />
    </Sequence>
    <Sequence from={START.montage} durationInFrames={D.montage}>
      <MontageScene />
    </Sequence>
    <Sequence from={START.hah} durationInFrames={D.hah}>
      <SceneHah />
    </Sequence>
    <Sequence from={START.heart} durationInFrames={D.heart}>
      <SceneHeart />
    </Sequence>
    <Sequence from={START.s3} durationInFrames={D.s3}>
      <Scene3 />
    </Sequence>
    <Sequence from={START.end} durationInFrames={D.end}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
