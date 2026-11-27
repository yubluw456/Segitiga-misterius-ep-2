import React from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  Bubble,
  CamG,
  Character,
  FONT,
  Narration,
  Stage,
  autoKeys,
  bubbleAt,
  camAt,
  lineStarts,
  sec,
  totalLen,
  useLine,
  SHOW,
} from './Characters';
import type { Cam, CamKey, Line, Name, Place } from './Characters';

/* =====================================================================
   SEGITIGA MISTERIUS - PROLOG  (1280x720, 30fps)
   Jeda bubble: pembicara sama 2 detik, ganti pembicara 3 detik (mode smart).
   Scene tanpa transisi = langsung potong (fin/fout = 0).
   ===================================================================== */

type Pl = Partial<Record<Name, Place>>;

const Scn: React.FC<{ fin?: number; fout?: number; children: React.ReactNode }> = ({
  fin = 0,
  fout = 0,
  children,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = fin > 0 ? Math.min(1, f / fin) : 1;
  const b = fout > 0 ? Math.min(1, (durationInFrames - f) / fout) : 1;
  return <AbsoluteFill style={{ opacity: Math.max(0, Math.min(a, b)) }}>{children}</AbsoluteFill>;
};

const Say: React.FC<{ line?: Line; within: number; cam: Cam; places: Pl }> = ({ line, within, cam, places }) => {
  if (!line) return null;
  const p = places[line.who];
  if (!p) return null;
  return (
    <Bubble
      who={line.who}
      text={line.text}
      within={within}
      big={line.big}
      thought={line.thought}
      {...bubbleAt(cam, line.who, p)}
    />
  );
};

/* =============================== DIALOG =============================== */
const L3: Line[] = [
  { who: 'Hafizh', text: 'ih hessam lah', e: { Hafizh: 'curious', Hessam: 'neutral', Hirzi: 'neutral' } },
  { who: 'Hafizh', text: 'kenapa tu di tiktoknya ada api2 👀', e: { Hafizh: 'curious', Hessam: 'worry' } },
  { who: 'Hirzi', text: 'Waduh duh duh yahaha', e: { Hirzi: 'happy', Hafizh: 'happy', Hessam: 'worry' } },
  { who: 'Hessam', text: 'Mauk nah', e: { Hessam: 'angry', Hirzi: 'happy', Hafizh: 'happy' } },
  { who: 'Hirzi', text: 'ei si pink datang cok', e: { Hirzi: 'curious', Hafizh: 'curious', Hessam: 'neutral' } },
  { who: 'Hafizh', text: 'yah gaseru, ship Arasamsam berakhir', e: { Hafizh: 'sad', Hirzi: 'happy', Hessam: 'neutral' } },
  { who: 'Hessam', text: 'Alhamdulillah', e: { Hessam: 'happy', Hafizh: 'sad', Hirzi: 'happy' } },
];
const L5: Line[] = [
  { who: 'Hessam', text: 'Eh ada notif dari grup MTK TL', e: { Hessam: 'curious', Hirzi: 'neutral', Hafizh: 'neutral' } },
  { who: 'Hirzi', text: 'yahaha sekelompok lagi', e: { Hirzi: 'happy', Hessam: 'neutral', Hafizh: 'neutral' } },
  { who: 'Hirzi', text: 'Sama', e: { Hirzi: 'happy', Hessam: 'neutral' } },
  { who: 'Hirzi', text: 'Ara', e: { Hirzi: 'blush', Hessam: 'worry', Hafizh: 'curious' } },
  { who: 'Hafizh', text: 'Cihuyyy', e: { Hafizh: 'happy', Hirzi: 'blush', Hessam: 'worry' } },
  { who: 'Hessam', text: 'berisik nah', e: { Hessam: 'angry', Hafizh: 'happy', Hirzi: 'happy' } },
];
const L6: Line[] = [
  { who: 'Ara', text: 'sam, kamu sama hirzi udah temenan berapa lama sihhh?', e: { Ara: 'curious', Hessam: 'neutral' } },
  { who: 'Hessam', text: 'semenjak SD si. Emangnya kenapa?', e: { Hessam: 'curious', Ara: 'happy' } },
  { who: 'Ara', text: 'Ada dehh', e: { Ara: 'blush', Hessam: 'curious' } },
  {
    who: 'Hessam',
    text: '(Kok tiba2 aku kyk ada rasa suka ya?)',
    thought: true,
    e: { Hessam: 'blush', Ara: 'blush' },
    zs: [1.7, 2.0],
  },
];
const L7: Line[] = [
  { who: 'Raihan', text: 'Guys', e: { Raihan: 'neutral', Royan: 'neutral', Rasya: 'neutral' } },
  { who: 'Raihan', text: 'Aku kok ngerasa aneh ya', e: { Raihan: 'worry' } },
  { who: 'Royan', text: 'Apa yang aneh', e: { Royan: 'curious', Raihan: 'worry' } },
  { who: 'Raihan', text: 'Pinanya ada yang aku ketujui gitu', e: { Raihan: 'blush', Royan: 'curious' } },
  { who: 'Royan', text: 'Siapa yg kam ketujui?', e: { Royan: 'curious', Raihan: 'blush' } },
  { who: 'Raihan', text: 'Ara', e: { Raihan: 'blush', Royan: 'curious', Rasya: 'neutral' } },
  { who: 'Rasya', text: '', dur: 105, e: { Rasya: 'shock', Royan: 'shock', Raihan: 'worry' } }, // Rasya nyiprat kuah mi
  { who: 'Royan', text: 'HAH BEBUJUR', big: true, e: { Royan: 'shock', Rasya: 'shock', Raihan: 'worry' } },
];
const L8: Line[] = [
  { who: 'Aril', text: 'lek', e: { Aril: 'neutral', Khaliq: 'neutral' } },
  { who: 'Khaliq', text: 'Apa', e: { Khaliq: 'neutral', Aril: 'neutral' } },
  { who: 'Aril', text: 'jangan cepulah', e: { Aril: 'worry', Khaliq: 'curious' } },
  { who: 'Aril', text: 'keknya aku ketuju lwn ara', e: { Aril: 'blush', Khaliq: 'curious' } },
  { who: 'Khaliq', text: 'nyawa temakan buah kecubung kah napa?!', e: { Khaliq: 'shock', Aril: 'blush' } },
];
const L10: Line[] = [
  { who: 'Hirzi', text: 'kok', e: { Hirzi: 'worry' } },
  { who: 'Hirzi', text: 'aku cemburu ya...', e: { Hirzi: 'sad' } },
];

/* =============================== TIMELINE =============================== */
type K = 'bike' | 'meteor' | 'cls' | 'ara' | 'notif' | 'remake' | 'bench' | 'canteen' | 'kop' | 'hirzi' | 'end';
const order: K[] = ['bike', 'meteor', 'cls', 'ara', 'notif', 'remake', 'bench', 'canteen', 'kop', 'hirzi', 'end'];
const D: Record<K, number> = {
  bike: 215,
  meteor: sec(5),
  cls: totalLen(L3, 45, true),
  ara: 200,
  notif: totalLen(L5, 60, true),
  remake: totalLen(L6, 60, true),
  bench: totalLen(L7, 60, true),
  canteen: totalLen(L8, 60, true),
  kop: sec(5),
  hirzi: totalLen(L10, 30, true),
  end: sec(3),
};
const START = {} as Record<K, number>;
let acc = 0;
for (const k of order) {
  START[k] = acc;
  acc += D[k];
}
export const TOTAL_FRAMES_PROLOG = acc;

/* =============================== SCENE 1: SEPEDA =============================== */
const BUILD = [
  { x: 0, w: 120, h: 260 },
  { x: 150, w: 90, h: 340 },
  { x: 260, w: 130, h: 210 },
  { x: 420, w: 100, h: 300 },
  { x: 540, w: 140, h: 380 },
  { x: 700, w: 110, h: 240 },
  { x: 840, w: 120, h: 330 },
  { x: 990, w: 90, h: 280 },
  { x: 1100, w: 150, h: 360 },
  { x: 1270, w: 120, h: 220 },
];

const Skyline: React.FC<{ off: number; color: string; base: number; win: string }> = ({ off, color, base, win }) => {
  const o = off % 1400;
  return (
    <g>
      {[0, 1].map((c) => (
        <g key={c} transform={`translate(${c * 1400 - o},0)`}>
          {BUILD.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={base - b.h} width={b.w} height={b.h} fill={color} />
              {Array.from({ length: Math.floor(b.h / 50) }).map((_, r) => (
                <g key={r}>
                  <rect x={b.x + 14} y={base - b.h + 18 + r * 50} width={16} height={22} fill={win} />
                  <rect x={b.x + b.w - 30} y={base - b.h + 18 + r * 50} width={16} height={22} fill={win} />
                </g>
              ))}
            </g>
          ))}
        </g>
      ))}
    </g>
  );
};

const Bike: React.FC<{ x: number; g: number; color: string; deg: number }> = ({ x, g, color, deg }) => (
  <g transform={`translate(${x},${g})`}>
    {[-85, 85].map((wx) => (
      <g key={wx} transform={`translate(${wx},-62) rotate(${deg})`}>
        <circle r={62} fill="none" stroke="#1f2937" strokeWidth={8} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={0} y1={-60} x2={0} y2={60} stroke="#9ca3af" strokeWidth={2} transform={`rotate(${i * 30})`} />
        ))}
        <circle r={6} fill="#374151" />
      </g>
    ))}
    <g stroke={color} strokeWidth={7} strokeLinecap="round" fill="none">
      <line x1={-85} y1={-62} x2={0} y2={-55} />
      <line x1={0} y1={-55} x2={-22} y2={-145} />
      <line x1={-85} y1={-62} x2={-22} y2={-145} />
      <line x1={-22} y1={-145} x2={62} y2={-135} />
      <line x1={0} y1={-55} x2={62} y2={-135} />
      <line x1={62} y1={-135} x2={85} y2={-62} />
      <line x1={62} y1={-135} x2={70} y2={-155} />
    </g>
    <line x1={60} y1={-156} x2={90} y2={-150} stroke="#1f2937" strokeWidth={8} strokeLinecap="round" />
    <line x1={-38} y1={-148} x2={-6} y2={-148} stroke="#1f2937" strokeWidth={10} strokeLinecap="round" />
    <g transform={`translate(0,-55) rotate(${deg * 1.5})`}>
      <line x1={-16} y1={0} x2={16} y2={0} stroke="#374151" strokeWidth={5} />
      <rect x={-24} y={-3} width={14} height={6} fill="#111827" />
      <rect x={10} y={-3} width={14} height={6} fill="#111827" />
    </g>
  </g>
);

const scrollAt = (f: number) =>
  f <= 120 ? 6 * f : f <= 135 ? 720 + 6 * (f - 120) - 0.2 * (f - 120) * (f - 120) : 765;

const BikeScene: React.FC = () => {
  const f = useCurrentFrame();
  const sc = scrollAt(f);
  const deg = (sc / 62) * 57.3;
  const G = 560;
  const moving = f < 135;
  const mx = interpolate(f, [95, 215], [1080, 560], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const my = interpolate(f, [95, 215], [90, 210], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const meteorOn = f >= 95;
  const rLook = f >= 120;
  const nTurn = f >= 150;
  const nUp = f >= 185;
  const lean = f < 120 ? 5 : interpolate(f, [120, 128, 150], [5, 14, 6], { extrapolateRight: 'clamp' });
  const keys: CamKey[] = [
    { t: 0, cx: 640, cy: 380, z: 1 },
    { t: 110, cx: 640, cy: 380, z: 1 },
    { t: 128, cx: 470, cy: 330, z: 1.55 },
    { t: 160, cx: 850, cy: 350, z: 1.55 },
    { t: 188, cx: 680, cy: 300, z: 1.15 },
  ];
  const cam = camAt(f, keys);
  const titleO = interpolate(f, [0, 10, 65, 85], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const RASYA_Y = 415 + 55 * 1.5;
  const NASITA_Y = 415 + 55 * 1.26;
  return (
    <Scn fin={8}>
      <Stage>
        <defs>
          <linearGradient id="fogSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cfd9e2" />
            <stop offset="1" stopColor="#f1f4f7" />
          </linearGradient>
          <linearGradient id="fogV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0.8} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="fogB">
            <stop offset="0" stopColor="#fff" stopOpacity={0.7} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="tail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0.9} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CamG cam={cam}>
          <rect width={1280} height={720} fill="url(#fogSky)" />
          {meteorOn && (
            <g transform={`translate(${mx},${my})`}>
              <polygon points="0,-2 70,-30 70,-24 0,3" fill="url(#tail)" />
              <circle r={9} fill="#fff" opacity={0.35} />
              <circle r={4} fill="#fff" />
            </g>
          )}
          <Skyline off={sc * 0.12} color="#c3ced9" base={470} win="#d9e2ea" />
          <Skyline off={sc * 0.3} color="#a9b8c6" base={500} win="#c3ced9" />
          {[0, 1, 2, 3].map((i) => {
            const x = ((i * 420 - sc * 0.6) % 1680) - 160;
            return (
              <g key={i}>
                <rect x={x - 10} y={400} width={20} height={150} fill="#8a9a8c" />
                <circle cx={x} cy={380} r={70} fill="#9fb3a2" />
              </g>
            );
          })}
          <rect y={540} width={1280} height={180} fill="#a9bfa4" />
          <rect y={540} width={1280} height={110} fill="#d8d4c8" />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={((i * 200 - sc) % 1600) - 100} y={600} width={90} height={8} fill="#f4f1e8" />
          ))}
          {/* sepeda & pengendara */}
          <Bike x={480} g={G} color="#ef4444" deg={deg} />
          <Character
            name="Rasya"
            x={458}
            y={RASYA_Y}
            pose="sit"
            walking={moving}
            lean={lean}
            armR={-55}
            armL={-38}
            lookDir={0.8}
            lookUp={rLook ? 1 : 0}
            headTilt={rLook ? -10 : 0}
            expr={rLook ? 'shock' : 'happy'}
            seed={2}
            outfit={{ top: '#111827', bottom: '#9ca3af', sleeves: 'short' }}
          />
          <Bike x={840} g={G} color="#a855f7" deg={deg} />
          <Character
            name="Nasita"
            x={818}
            y={NASITA_Y}
            pose="sit"
            walking={moving}
            lean={5}
            armR={-55}
            armL={-38}
            lookDir={nTurn && !nUp ? -1 : 0.8}
            lookUp={nUp ? 1 : 0}
            headTilt={nUp ? -10 : 0}
            expr={nUp ? 'shock' : nTurn ? 'curious' : 'happy'}
            seed={5}
            outfit={{ top: '#111827', bottom: '#dc2626', sleeves: 'long', hijab: '#60a5fa' }}
          />
          {/* kabut tebal */}
          <rect y={230} width={1280} height={400} fill="url(#fogV)" />
          {[0, 1, 2, 3].map((i) => {
            const x = ((i * 460 - f * 0.9) % 1840) - 200;
            return <ellipse key={i} cx={x} cy={470 + (i % 2) * 40} rx={330} ry={90} fill="url(#fogB)" />;
          })}
        </CamG>
        <rect width={1280} height={720} fill="#fff" opacity={0.12} />
      </Stage>
      <div
        style={{
          position: 'absolute',
          left: 40,
          bottom: 36,
          opacity: titleO,
          fontFamily: FONT,
          fontWeight: 800,
          color: '#1f2937',
          textShadow: '0 2px 0 #fff',
        }}
      >
        <div style={{ fontSize: 40, letterSpacing: 2 }}>SEGITIGA MISTERIUS</div>
        <div style={{ fontSize: 30, color: '#be123c' }}>PROLOG</div>
      </div>
    </Scn>
  );
};

/* =============================== SCENE 2: METEOR =============================== */
const MeteorScene: React.FC = () => {
  const f = useCurrentFrame();
  const mx = interpolate(f, [0, 150], [900, 680]);
  const my = interpolate(f, [0, 150], [110, 330]);
  const sc = interpolate(f, [0, 150], [0.7, 1.6]);
  const sx = Math.sin(f * 2.3) * 5;
  const sy = Math.cos(f * 3.1) * 4;
  const redO = interpolate(f, [0, 150], [0, 0.35]);
  return (
    <Scn fout={6}>
      <Stage>
        <defs>
          <linearGradient id="space" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#050816" />
            <stop offset="1" stopColor="#1e3a8a" />
          </linearGradient>
          <radialGradient id="earth" cx="50%" cy="30%" r="80%">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#1d4ed8" />
          </radialGradient>
          <linearGradient id="flame" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#fde047" />
            <stop offset="0.5" stopColor="#f97316" />
            <stop offset="1" stopColor="#dc2626" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="redV" cx="50%" cy="50%" r="75%">
            <stop offset="0.4" stopColor="#ef4444" stopOpacity={0} />
            <stop offset="1" stopColor="#991b1b" stopOpacity={0.9} />
          </radialGradient>
        </defs>
        <g transform={`translate(${sx},${sy})`}>
          <rect x={-20} y={-20} width={1320} height={760} fill="url(#space)" />
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={(i * 197) % 1280} cy={(i * 89) % 420} r={1 + (i % 3)} fill="#fff" opacity={0.5 + (i % 4) * 0.12} />
          ))}
          <circle cx={640} cy={1120} r={640} fill="none" stroke="#7dd3fc" strokeWidth={14} opacity={0.5} />
          <circle cx={640} cy={1120} r={620} fill="url(#earth)" />
          {[
            [420, 560, 120, 40],
            [820, 600, 150, 36],
            [640, 680, 110, 30],
          ].map(([cx, cy, rx, ry], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" opacity={0.6} />
          ))}
          {[
            [520, 640, 90, 28],
            [760, 560, 70, 22],
          ].map(([cx, cy, rx, ry], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#4ade80" opacity={0.85} />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <circle key={i} cx={430 + ((i * 53) % 420)} cy={600 + ((i * 37) % 90)} r={2.5} fill="#fde68a" />
          ))}
          <g transform={`translate(${mx},${my}) scale(${sc})`}>
            <polygon points="-20,-30 230,-190 200,-110 260,-120 120,-30 60,20" fill="url(#flame)" opacity={0.95} />
            {Array.from({ length: 8 }).map((_, i) => {
              const t = ((f * 3 + i * 17) % 60) / 60;
              return (
                <circle key={i} cx={40 + t * 170 + (i % 3) * 8} cy={-30 - t * 110 + (i % 2) * 14} r={4 + (i % 3) * 2} fill="#fde047" opacity={1 - t} />
              );
            })}
            <circle r={68} fill="none" stroke="#fb923c" strokeWidth={9} opacity={0.7} />
            <circle r={60} fill="#57534e" stroke="#292524" strokeWidth={4} />
            <circle cx={-18} cy={-14} r={12} fill="#44403c" />
            <circle cx={20} cy={16} r={16} fill="#44403c" />
            <circle cx={-6} cy={30} r={8} fill="#44403c" />
          </g>
        </g>
        <rect width={1280} height={720} fill="url(#redV)" opacity={redO + 0.2} />
      </Stage>
    </Scn>
  );
};

/* =============================== KELAS =============================== */
const ClassBG: React.FC<{ board?: string[] }> = ({ board = ['Matematika Lanjut'] }) => (
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
    <rect x={420} y={70} width={470} height={230} fill="#fff" stroke="#94a3b8" strokeWidth={10} />
    {board.map((t, i) => (
      <text key={i} x={655} y={125 + i * 55} textAnchor="middle" fontSize={i === 0 ? 34 : 28} fontWeight={i === 0 ? 800 : 400} fill={i === 0 ? '#1d4ed8' : '#334155'} fontFamily={FONT}>
        {t}
      </text>
    ))}
    {/* pintu + papan nama kelas */}
    <rect x={1040} y={130} width={140} height={340} rx={6} fill="#b9835a" stroke="#8b5e3c" strokeWidth={6} />
    <circle cx={1160} cy={310} r={7} fill="#fde68a" />
    <rect x={1030} y={64} width={160} height={46} rx={8} fill="#8b5e3c" stroke="#5a3520" strokeWidth={3} />
    <text x={1110} y={98} textAnchor="middle" fontSize={32} fontWeight={800} fill="#fff" fontFamily={FONT}>
      XI.2
    </text>
  </g>
);

const Table: React.FC<{ x0: number; x1: number; top: number }> = ({ x0, x1, top }) => (
  <g>
    <rect x={x0} y={top} width={x1 - x0} height={24} rx={6} fill="#c08a52" stroke="#8a5a2b" strokeWidth={4} />
    <rect x={x0 + 24} y={top + 24} width={x1 - x0 - 48} height={40} fill="#a8733f" />
    <rect x={x0 + 36} y={top + 64} width={22} height={72} fill="#8a5a2b" />
    <rect x={x1 - 58} y={top + 64} width={22} height={72} fill="#8a5a2b" />
  </g>
);

const TRIO: Pl = {
  Hafizh: { x: 330, y: 585 + 55 * 1.45, pose: 'sit' },
  Hessam: { x: 640, y: 585 + 55 * 1.3, pose: 'sit' },
  Hirzi: { x: 950, y: 585 + 55 * 1.3, pose: 'sit' },
};

const WaBanner: React.FC<{ f: number }> = ({ f }) => {
  const y = interpolate(f, [0, 10, 110, 125], [-130, 40, 40, -130], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        right: 40,
        top: y,
        width: 420,
        background: '#fff',
        borderLeft: '10px solid #22c55e',
        borderRadius: 18,
        padding: '14px 20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        fontFamily: FONT,
      }}
    >
      <div style={{ fontSize: 20, color: '#16a34a', fontWeight: 800 }}>💬 WhatsApp • sekarang</div>
      <div style={{ fontSize: 32, color: '#111827', fontWeight: 800 }}>Grup MTK TL</div>
    </div>
  );
};

// scene 3 & 5: Hafizh, Hessam, Hirzi duduk bertiga
const TrioScene: React.FC<{
  lines: Line[];
  intro: number;
  araWalk?: boolean;
  banner?: boolean;
  fin?: number;
  fout?: number;
}> = ({ lines, intro, araWalk, banner, fin, fout }) => {
  const { f, within, line, speaker, ex, idx } = useLine(lines, intro, true);
  const cam = camAt(f, autoKeys(lines, intro, TRIO, { t: 0, cx: 640, cy: 400, z: 1 }, 1.35, 1.6, true));
  const araStart = lineStarts(lines, intro, true)[4] ?? 0;
  const ax = interpolate(f, [araStart, araStart + 110], [1220, 930], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const buzz = banner && f < 120 ? Math.sin(f * 3) * 3 : 0;
  const screen = banner ? '#22c55e' : '#e5e7eb';
  const fire = !banner && idx >= 1 && idx < 3;
  return (
    <Scn fin={fin} fout={fout}>
      <Stage>
        <CamG cam={cam}>
          <ClassBG board={['Matematika Lanjut']} />
          {araWalk && f >= araStart - 15 && (
            <Character name="Ara" x={ax} y={545} mul={0.7} walking={f < araStart + 110} lookDir={-1} expr="neutral" seed={1} />
          )}
          <Character name="Hafizh" {...TRIO.Hafizh!} lookDir={0.8} expr={ex('Hafizh')} speaking={speaker === 'Hafizh'} seed={3} />
          <Character name="Hessam" {...TRIO.Hessam!} lookDir={0} headTilt={8} expr={ex('Hessam')} speaking={speaker === 'Hessam'} seed={5} />
          <Character name="Hirzi" {...TRIO.Hirzi!} lookDir={-0.8} expr={ex('Hirzi')} speaking={speaker === 'Hirzi'} seed={7} />
          <Table x0={200} x1={1080} top={585} />
          <g transform={`translate(${640 + buzz},583) rotate(-8)`}>
            <rect x={-26} y={-86} width={52} height={86} rx={8} fill="#111827" />
            <rect x={-21} y={-80} width={42} height={74} rx={4} fill={screen} />
            {fire && (
              <text x={0} y={-34} textAnchor="middle" fontSize={36}>
                🔥
              </text>
            )}
            {banner && (
              <text x={0} y={-34} textAnchor="middle" fontSize={32}>
                💬
              </text>
            )}
          </g>
        </CamG>
      </Stage>
      <Say line={line} within={within} cam={cam} places={TRIO} />
      {banner && <WaBanner f={f} />}
    </Scn>
  );
};

const ClassScene3: React.FC = () => <TrioScene lines={L3} intro={45} araWalk fin={6} />;
const NotifScene: React.FC = () => <TrioScene lines={L5} intro={60} banner fout={6} />;

/* ---- Scene 4: Rakha melihat segitiga di hijab Ara ---- */
const A4: Place = { x: 430, y: 585 + 55 * 1.1, pose: 'sit' };
const R4: Place = { x: 800, y: 585 + 55 * 1.3, pose: 'sit' };

const AraScene: React.FC = () => {
  const f = useCurrentFrame();
  const keys: CamKey[] = [
    { t: 0, cx: 640, cy: 420, z: 1 },
    { t: 40, cx: 615, cy: 430, z: 1.25 },
    { t: 105, cx: 456, cy: 402, z: 3.2 },
  ];
  const cam = camAt(f, keys);
  const rExpr = f < 60 ? 'neutral' : f < 110 ? 'curious' : 'shock';
  const glint = f >= 105 ? 0.7 + 0.3 * Math.sin(f * 0.4) : 0;
  return (
    <Scn>
      <Stage>
        <CamG cam={cam}>
          <ClassBG board={['Matematika Lanjut']} />
          <Character name="Ara" {...A4} lookDir={0} expr="neutral" triangle seed={1} />
          <Character name="Rakha" {...R4} lookDir={f >= 30 ? -1 : 0} expr={rExpr} seed={6} />
          <Table x0={300} x1={560} top={585} />
          <Table x0={670} x1={930} top={585} />
          {glint > 0 && (
            <text x={474} y={392} fontSize={34 * glint} textAnchor="middle">
              ✨
            </text>
          )}
        </CamG>
      </Stage>
      <Narration items={[{ from: 100, dur: 95, text: 'Di hijab Ara, terselip sebuah segitiga misterius berwarna abu-abu...' }]} />
    </Scn>
  );
};

/* ---- Scene 6: remake kerja kelompok MTK TL ---- */
const P6: Pl = {
  Ara: { x: 380, y: 655, pose: 'sit' },
  Hessam: { x: 900, y: 655, pose: 'sit' },
};

const Heart: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={46} fill="#ff3b6b" opacity={0.25} />
    <path d="M0,18 C-42,-10 -30,-46 0,-24 C30,-46 42,-10 0,18 Z" fill="#ff3b6b" stroke="#ffb3c6" strokeWidth={3} />
  </g>
);

const RemakeScene: React.FC = () => {
  const { f, within, line, speaker, ex } = useLine(L6, 60, true);
  const cam = camAt(f, autoKeys(L6, 60, P6, { t: 0, cx: 640, cy: 420, z: 1 }, 1.3, 1.5, true));
  const ts = lineStarts(L6, 60, true)[3];
  const amt = interpolate(f, [ts, ts + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const beat = 1 + 0.14 * Math.sin(f * 0.35);
  const pop = spring({ frame: Math.max(0, f - ts), fps: 30, config: { damping: 9 } });
  return (
    <Scn fin={6} fout={6}>
      <Stage>
        <CamG cam={cam}>
          <ClassBG board={['Matematika Lanjut']} />
          <rect x={325} y={480} width={110} height={130} rx={10} fill="#8b5e3c" />
          <rect x={845} y={470} width={110} height={140} rx={10} fill="#8b5e3c" />
          <Character name="Ara" {...P6.Ara!} lookDir={1} expr={ex('Ara')} speaking={speaker === 'Ara'} seed={1} />
          <g style={{ filter: `brightness(${1 - amt})` }}>
            <Character name="Hessam" {...P6.Hessam!} lookDir={-1} expr={ex('Hessam')} speaking={speaker === 'Hessam'} seed={5} />
          </g>
          <Table x0={230} x1={1050} top={582} />
          <g transform="translate(640,582)">
            <rect x={-18} y={-78} width={36} height={78} rx={8} fill="#111" />
            <rect x={-20} y={-88} width={40} height={14} rx={5} fill="#2b2b2b" />
            <rect x={-4} y={-96} width={8} height={8} rx={3} fill="#444" />
          </g>
          <rect x={-100} y={-100} width={1480} height={920} fill="#000" opacity={amt * 0.35} />
          {amt > 0 && <Heart x={900} y={526} s={1.2 * pop * beat} />}
          {amt > 0 &&
            Array.from({ length: 5 }).map((_, i) => {
              const t = ((f * 1.2 + i * 24) % 120) / 120;
              return (
                <text key={i} x={870 + i * 18 + Math.sin(t * 6 + i) * 12} y={470 - t * 160} fontSize={26} opacity={1 - t} textAnchor="middle">
                  💗
                </text>
              );
            })}
        </CamG>
      </Stage>
      <Say line={line} within={within} cam={cam} places={P6} />
    </Scn>
  );
};

/* ---- Scene 7: depan kelas, bangku ---- */
const P7: Pl = {
  Raihan: { x: 350, y: 585 + 55 * 1.3, pose: 'sit' },
  Royan: { x: 640, y: 585 + 55 * 1.5, pose: 'sit' },
  Rasya: { x: 930, y: 585 + 55 * 1.5, pose: 'sit' },
};

const BenchScene: React.FC = () => {
  const { f, within, line, speaker, ex } = useLine(L7, 60, true);
  const cam0 = camAt(f, autoKeys(L7, 60, P7, { t: 0, cx: 640, cy: 420, z: 1 }, 1.3, 1.5, true));
  const s7 = lineStarts(L7, 60, true)[6];
  const t = f - s7;
  const s8 = lineStarts(L7, 60, true)[7];
  const amp = f >= s8 ? 7 * Math.exp(-(f - s8) / 12) : 0;
  const cam = { ...cam0 };
  const shake = { x: Math.sin(f * 2.8) * amp, y: Math.cos(f * 3.3) * amp * 0.7 };
  const bowlShake = t >= 0 && t < 45 ? Math.sin(t * 1.5) * 5 : 0;
  return (
    <Scn fin={6}>
      <Stage>
        <CamG cam={cam} sx={shake.x} sy={shake.y}>
          <rect width={1280} height={720} fill="#f3e8d3" />
          <rect y={470} width={1280} height={250} fill="#cfc7b8" />
          {[540, 620, 700].map((yy) => (
            <line key={yy} x1={0} y1={yy} x2={1280} y2={yy} stroke="#bdb5a6" strokeWidth={3} />
          ))}
          <rect x={560} y={120} width={160} height={350} rx={6} fill="#b9835a" stroke="#8b5e3c" strokeWidth={6} />
          <circle cx={700} cy={300} r={7} fill="#fde68a" />
          <rect x={550} y={54} width={180} height={46} rx={8} fill="#8b5e3c" stroke="#5a3520" strokeWidth={3} />
          <text x={640} y={88} textAnchor="middle" fontSize={32} fontWeight={800} fill="#fff" fontFamily={FONT}>
            XI.2
          </text>
          <rect x={90} y={150} width={200} height={170} rx={8} fill="#bfe3ff" stroke="#94a3b8" strokeWidth={6} />
          <rect x={980} y={150} width={200} height={170} rx={8} fill="#bfe3ff" stroke="#94a3b8" strokeWidth={6} />
          {/* bangku panjang */}
          <rect x={230} y={585} width={820} height={18} rx={5} fill="#a0643a" stroke="#7a4a27" strokeWidth={3} />
          <rect x={260} y={603} width={14} height={60} fill="#6b4226" />
          <rect x={1006} y={603} width={14} height={60} fill="#6b4226" />
          <Character name="Raihan" {...P7.Raihan!} lookDir={0.6} expr={ex('Raihan')} speaking={speaker === 'Raihan'} seed={2} />
          <Character name="Royan" {...P7.Royan!} lookDir={0} expr={ex('Royan')} speaking={speaker === 'Royan'} seed={4} />
          <Character
            name="Rasya"
            {...P7.Rasya!}
            lookDir={-0.5}
            expr={ex('Rasya', 'happy')}
            seed={6}
            outfit={undefined}
          />
          {/* mangkuk mi */}
          <g transform={`translate(930,${566 + bowlShake})`}>
            <path d="M-46,0 L46,0 L36,42 Q0,52 -36,42 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth={3} />
            <ellipse cx={0} cy={0} rx={46} ry={13} fill="#fde68a" stroke="#7f1d1d" strokeWidth={3} />
            <path d="M-30,0 Q-15,-8 0,0 Q15,8 30,0" fill="none" stroke="#f59e0b" strokeWidth={3} />
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M${-18 + i * 18},-14 q8,-14 0,-28 q-8,-14 0,-28`}
                transform={`translate(0,${-((f * 0.6 + i * 12) % 30)})`}
                fill="none"
                stroke="#fff"
                strokeWidth={4}
                opacity={0.6}
              />
            ))}
          </g>
          {t > 0 && t < 45 && (
            <g>
              {Array.from({ length: 16 }).map((_, i) => {
                const vx = -(4 + (i % 5) * 1.5);
                const vy = -2 + (i % 3) * -0.8;
                return (
                  <circle key={i} cx={930 + vx * t} cy={407 + vy * t + 0.25 * t * t} r={4 + (i % 3) * 2} fill="#fcd34d" opacity={1 - t / 45} />
                );
              })}
              <text x={820} y={380} fontSize={46} fontWeight={900} fill="#dc2626" textAnchor="middle" fontFamily={FONT}>
                PFFFT!
              </text>
            </g>
          )}
        </CamG>
      </Stage>
      <Say line={line} within={within} cam={cam} places={P7} />
      <Narration items={[{ from: s7, dur: 100, text: '*Rasya menyemburkan kuah mi*' }]} />
    </Scn>
  );
};

/* ---- Scene 8: kantin ---- */
const CAN_STOP = lineStarts(L8, 60, true)[3] + 25;
const canScroll = (f: number) => {
  let s = 0;
  for (let i = 0; i < f; i++) {
    s += i < CAN_STOP ? 4 : i < CAN_STOP + 10 ? 4 * (1 - (i - CAN_STOP) / 10) : 0;
  }
  return s;
};

const CanteenBG: React.FC<{ sc: number }> = ({ sc }) => {
  const o = sc % 1260;
  return (
    <g>
      <rect width={1280} height={720} fill="#fff1cc" />
      <rect y={470} width={1280} height={250} fill="#e3d3b4" />
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={i} x1={i * 160 - (o % 160)} y1={470} x2={i * 160 - (o % 160) - 60} y2={720} stroke="#d1bf9b" strokeWidth={3} />
      ))}
      {[0, 1].map((c) => (
        <g key={c} transform={`translate(${c * 1260 - o},0)`}>
          {[0, 1, 2].map((i) => {
            const x = i * 420 + 40;
            const colors = ['#ef4444', '#22c55e', '#3b82f6'];
            return (
              <g key={i}>
                <rect x={x} y={170} width={340} height={300} fill="#f8e5b3" stroke="#c9a15b" strokeWidth={4} />
                <path d={`M${x - 10},170 L${x + 350},170 L${x + 320},120 L${x + 20},120 Z`} fill={colors[i]} />
                <rect x={x + 20} y={330} width={300} height={140} fill="#a8733f" />
                <rect x={x + 30} y={200} width={120} height={60} fill="#fff" stroke="#c9a15b" strokeWidth={3} />
                {[0, 1, 2, 3].map((k) => (
                  <rect key={k} x={x + 170 + k * 36} y={300} width={22} height={30} rx={4} fill={['#f59e0b', '#ef4444', '#3b82f6', '#22c55e'][k]} />
                ))}
              </g>
            );
          })}
        </g>
      ))}
      <rect x={440} y={20} width={400} height={60} rx={12} fill="#8b5e3c" stroke="#5a3520" strokeWidth={4} />
      <text x={640} y={64} textAnchor="middle" fontSize={40} fontWeight={800} fill="#fff" fontFamily={FONT}>
        KANTIN
      </text>
    </g>
  );
};

const P8: Pl = { Aril: { x: 470, y: 668 }, Khaliq: { x: 800, y: 668 } };

const CanteenScene: React.FC = () => {
  const { f, within, line, speaker, ex } = useLine(L8, 60, true);
  const cam = camAt(f, autoKeys(L8, 60, P8, { t: 0, cx: 640, cy: 400, z: 1 }, 1.25, 1.45, true));
  const sc = canScroll(f);
  const walking = f < CAN_STOP + 8;
  return (
    <Scn>
      <Stage>
        <CamG cam={cam}>
          <CanteenBG sc={sc} />
          <Character name="Aril" {...P8.Aril!} walking={walking} expr={ex('Aril')} speaking={speaker === 'Aril'} seed={3} />
          <Character name="Khaliq" {...P8.Khaliq!} walking={walking} expr={ex('Khaliq')} speaking={speaker === 'Khaliq'} seed={8} />
        </CamG>
      </Stage>
      <Say line={line} within={within} cam={cam} places={P8} />
      <Narration items={[{ from: 5, dur: 50, text: 'Di kantin sekolah...' }]} />
    </Scn>
  );
};

/* ---- Scene 9: Syauqi di koperasi ---- */
const KopScene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f, [
    { t: 0, cx: 640, cy: 420, z: 1 },
    { t: 50, cx: 640, cy: 400, z: 1.25 },
    { t: 100, cx: 645, cy: 380, z: 2.2 },
  ]);
  const e = interpolate(f, [60, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const armL = 5 + (-55) * e;
  const chestY = 690 - 1.58 * 165;
  return (
    <Scn>
      <Stage>
        <CamG cam={cam}>
          <rect width={1280} height={720} fill="#e8f0ff" />
          <rect y={470} width={1280} height={250} fill="#d6cdbf" />
          {/* rak alat tulis */}
          {[0, 1].map((r) => (
            <g key={r}>
              <rect x={60} y={170 + r * 130} width={1160} height={14} fill="#8b5e3c" />
              {Array.from({ length: 16 }).map((_, i) => (
                <rect
                  key={i}
                  x={80 + i * 71}
                  y={170 + r * 130 - 70 + (i % 3) * 8}
                  width={46}
                  height={70 - (i % 3) * 8}
                  rx={4}
                  fill={['#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#a855f7'][(i + r) % 5]}
                />
              ))}
            </g>
          ))}
          <rect x={380} y={40} width={520} height={64} rx={12} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={4} />
          <text x={640} y={85} textAnchor="middle" fontSize={38} fontWeight={800} fill="#fff" fontFamily={FONT}>
            KOPERASI SEKOLAH
          </text>
          <Character
            name="Syauqi"
            x={640}
            y={690}
            lookDir={f < 90 ? -0.5 : 0}
            expr={f < 80 ? 'neutral' : 'blush'}
            armL={armL}
            seed={4}
          />
          {e >= 1 && <circle cx={646} cy={chestY} r={15} fill="#f8e1cc" stroke="#e0b48f" strokeWidth={2} />}
          {f >= 100 &&
            [0, 1, 2].map((k) => {
              const t = ((f - 100 + k * 20) % 60) / 60;
              return <circle key={k} cx={646} cy={chestY} r={20 + t * 80} fill="none" stroke="#ff4d8d" strokeWidth={5} opacity={(1 - t) * 0.8} />;
            })}
          {f >= 100 && (
            <text x={720} y={300} fontSize={50 + Math.sin(f * 0.4) * 6} textAnchor="middle">
              💓
            </text>
          )}
          {/* meja koperasi */}
          <rect x={0} y={585} width={1280} height={135} fill="#a8733f" stroke="#8a5a2b" strokeWidth={4} />
          <rect x={0} y={575} width={1280} height={20} fill="#c08a52" stroke="#8a5a2b" strokeWidth={4} />
        </CamG>
      </Stage>
    </Scn>
  );
};

/* ---- Scene 10: Hirzi cemburu ---- */
const HIRZI10: Place = { x: 980, y: 585 + 55 * 1.3, pose: 'sit' };
const P10: Pl = { Hirzi: HIRZI10 };

const HirziScene: React.FC = () => {
  const { f, within, line, speaker, idx } = useLine(L10, 30, true);
  const cam = camAt(f, autoKeys(L10, 30, P10, { t: 0, cx: 640, cy: 400, z: 1 }, 1.5, 1.9, true));
  const s1 = lineStarts(L10, 30, true)[1];
  const sinis = f >= s1 + SHOW + 30;
  const expr = sinis ? 'sinis' : idx >= 1 ? 'sad' : 'worry';
  const araTalk = Math.floor(f / 40) % 2 === 0;
  const pop = spring({ frame: Math.max(0, f - (s1 + SHOW + 30)), fps: 30, config: { damping: 8 } });
  return (
    <Scn>
      <Stage>
        <CamG cam={cam}>
          <ClassBG board={['Matematika Lanjut']} />
          {/* Ara & Hessam jauh di belakang */}
          <Character name="Ara" x={330} y={500 + 55 * 1.1 * 0.62} mul={0.62} pose="sit" lookDir={1} expr="blush" speaking={araTalk} seed={1} />
          <Character name="Hessam" x={560} y={500 + 55 * 1.3 * 0.62} mul={0.62} pose="sit" lookDir={-1} expr="happy" speaking={!araTalk} seed={5} />
          <Table x0={250} x1={640} top={500} />
          {/* Hirzi di depan */}
          <Character name="Hirzi" {...HIRZI10} lookDir={-1} expr={expr} speaking={speaker === 'Hirzi'} seed={3} />
          <Table x0={800} x1={1180} top={585} />
          {sinis && (
            <text x={HIRZI10.x + 70} y={HIRZI10.y - 1.3 * 245 + 40} fontSize={70 * pop} textAnchor="middle">
              😒
            </text>
          )}
        </CamG>
      </Stage>
      <Say line={line} within={within} cam={cam} places={P10} />
    </Scn>
  );
};

/* ---- Penutup ---- */
const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const pop = spring({ frame: Math.max(0, f - 4), fps: 30, config: { damping: 10 } });
  return (
    <Scn>
      <AbsoluteFill
        style={{
          background: 'linear-gradient(135deg,#0f172a,#4c1d95 70%,#9d174d)',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
        }}
      >
        <div style={{ transform: `scale(${pop})`, fontSize: 120, fontWeight: 800, color: '#fff', textShadow: '0 6px 0 #831843' }}>
          BERSAMBUNG
        </div>
        <div style={{ marginTop: 16, fontSize: 34, color: '#f9a8d4', fontWeight: 700 }}>Segitiga Misterius • Prolog</div>
      </AbsoluteFill>
    </Scn>
  );
};

/* =============================== VIDEO UTAMA =============================== */
export const Prolog: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: FONT }}>
    <Sequence from={START.bike} durationInFrames={D.bike}>
      <BikeScene />
    </Sequence>
    <Sequence from={START.meteor} durationInFrames={D.meteor}>
      <MeteorScene />
    </Sequence>
    <Sequence from={START.cls} durationInFrames={D.cls}>
      <ClassScene3 />
    </Sequence>
    <Sequence from={START.ara} durationInFrames={D.ara}>
      <AraScene />
    </Sequence>
    <Sequence from={START.notif} durationInFrames={D.notif}>
      <NotifScene />
    </Sequence>
    <Sequence from={START.remake} durationInFrames={D.remake}>
      <RemakeScene />
    </Sequence>
    <Sequence from={START.bench} durationInFrames={D.bench}>
      <BenchScene />
    </Sequence>
    <Sequence from={START.canteen} durationInFrames={D.canteen}>
      <CanteenScene />
    </Sequence>
    <Sequence from={START.kop} durationInFrames={D.kop}>
      <KopScene />
    </Sequence>
    <Sequence from={START.hirzi} durationInFrames={D.hirzi}>
      <HirziScene />
    </Sequence>
    <Sequence from={START.end} durationInFrames={D.end}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
