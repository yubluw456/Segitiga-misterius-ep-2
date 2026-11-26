import React from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  Bubble,
  CamG,
  Character,
  Defs,
  Fade,
  FONT,
  LINE,
  Lightning,
  Narration,
  Rain,
  Silhouette,
  Stage,
  autoKeys,
  bubbleAt,
  camAt,
  focus,
  headCenter,
  headTop,
  sec,
  useLine,
} from './Characters';
import type { CamKey, Line, Place } from './Characters';

/* =====================================================================
   SEGITIGA MISTERIUS - EPISODE 3  (1280x720, 30fps)
   Dialog: tiap slot 6 detik (bubble 3 detik + sisanya jeda).
   Kamera otomatis bergerak ke pembicara (lihat autoKeys / camAt).
   ===================================================================== */

const INTRO = sec(3);
const sum = (l: Line[]) => l.reduce((a, x) => a + (x.dur ?? LINE), 0);

/* ------------------------------ DIALOG ------------------------------ */
// Scene 1A: taman
const L1A: Line[] = [
  { who: 'Yusuf', text: 'ceritain aja ra', e: { Yusuf: 'curious', Ara: 'sad' } },
  { who: 'Ara', text: 'jadi suf, trrnyata..', e: { Ara: 'sad', Yusuf: 'worry' } },
];
// Scene 1C: Hirzi marah
const L1C: Line[] = [
  { who: 'Hirzi', text: 'ih, kenapa sih malah yusuf yg ngedeketin.', e: { Hirzi: 'angry' }, zs: [1.5, 1.8] },
  { who: 'Hirzi', text: 'aku udah bikin ara ngga deket sama hessam lagi', e: { Hirzi: 'angry' }, zs: [1.8, 2.0] },
  { who: 'Hirzi', text: 'HARUSNYA ITU AKU', e: { Hirzi: 'angry' }, big: true, zs: [2.0, 2.3] },
];
// Scene 2: lorong hujan
const L2: Line[] = [
  { who: 'Yusuf', text: 'untung aja ngga kehujanan', e: { Yusuf: 'happy', Ara: 'sad' } },
  { who: 'Ara', text: 'iya..', e: { Ara: 'sad', Yusuf: 'neutral' } },
  { who: 'Yusuf', text: 'kamu masi sedih?', e: { Yusuf: 'worry', Ara: 'sad' } },
  { who: 'Ara', text: 'aku masi ngegalauin dia..', e: { Ara: 'cry', Yusuf: 'worry' } },
  { who: 'Yusuf', text: 'setahuku panglah, dari Hafizh', e: { Yusuf: 'curious', Ara: 'curious' } },
  { who: 'Yusuf', text: 'Hessam ni ada yg inya ketujui', e: { Yusuf: 'happy', Ara: 'shock' } },
  { who: 'Yusuf', text: 'Jar hafizh bukan yg dibilang Hirzi', e: { Yusuf: 'neutral', Ara: 'shock' } },
  { who: 'Ara', text: 'Hah...', e: { Ara: 'shock', Yusuf: 'neutral' } },
  { who: 'Ara', text: 'gausa deh, jangan beri aku harapan', e: { Ara: 'sad', Yusuf: 'worry' } },
  { who: 'Ara', text: 'Aku udah agak trauma sama cowo2 di angkatan ini', e: { Ara: 'cry', Yusuf: 'worry' } },
];
// Scene 3.1: flashback gazebo
const L31: Line[] = [
  { who: 'Ara', text: 'eh udil, ini keychain nya kamu beli dimana', e: { Ara: 'curious', Udil: 'neutral' } },
  { who: 'Udil', text: 'ohh, ini dari bububb akuu', e: { Udil: 'happy', Ara: 'curious' } },
  { who: 'Ara', text: '', dur: 120, e: { Ara: 'shock', Udil: 'happy' } },
];
// Scene 3.2: flashback Rakha & Naura
const L32: Line[] = [
  { who: 'Ara', text: 'haii rakha', e: { Ara: 'happy', Rakha: 'neutral' } },
  { who: 'Rakha', text: 'ya', e: { Rakha: 'neutral', Ara: 'happy' } },
  { who: 'Ara', text: '', dur: 120, e: { Ara: 'sinis', Rakha: 'neutral', Naura: 'neutral' } },
  { who: 'Naura', text: 'Hai rakha', e: { Naura: 'blush', Ara: 'sinis', Rakha: 'happy' } },
  { who: 'Rakha', text: 'Haiii noraa', e: { Rakha: 'happy', Naura: 'blush', Ara: 'sinis' }, zs: [1.15, 1.3] },
  { who: 'Ara', text: '', dur: 120, e: { Ara: 'shock', Rakha: 'happy', Naura: 'blush' } },
];
// Scene 4: kembali ke lorong
const L4: Line[] = [
  { who: 'Ara', text: 'aku takut keulang lagi...', e: { Ara: 'sad', Yusuf: 'worry' } },
  { who: 'Ara', text: '', dur: 150, e: { Ara: 'sad', Yusuf: 'worry' } }, // narator + kamera geser
  {
    who: 'Hessam',
    text: 'kenapa dia kek deket sama Ara sih',
    e: { Hessam: 'angry', Ara: 'sad', Yusuf: 'worry' },
    zs: [1.7, 2.0],
  },
];

/* ------------------------------ TIMELINE ------------------------------ */
type Key = 'title' | 'a' | 'b' | 'c' | 's2' | 's31' | 's32' | 's4' | 'end';
const order: Key[] = ['title', 'a', 'b', 'c', 's2', 's31', 's32', 's4', 'end'];
const D: Record<Key, number> = {
  title: sec(4),
  a: INTRO + sum(L1A) + 150, // + 5 detik kamera geser ke tembok
  b: sec(3), // siluet (2 detik + transisi)
  c: 90 + sum(L1C),
  s2: 90 + sum(L2),
  s31: 120 + sum(L31),
  s32: 60 + sum(L32),
  s4: 60 + sum(L4),
  end: sec(5),
};
const START = {} as Record<Key, number>;
let acc = 0;
for (const k of order) {
  START[k] = acc;
  acc += D[k];
}
export const TOTAL_FRAMES_EP3 = acc;

/* ------------------------------ TAMAN ------------------------------ */
const BENCH_ARA: Place = { x: 320, y: 560, mul: 0.62, pose: 'sit' };
const BENCH_YUSUF: Place = { x: 400, y: 560, mul: 0.62, pose: 'sit' };
const HIRZI: Place = { x: 980, y: 690 };

const CRACKS = [
  'M1142,436 L1170,414 L1162,388 L1198,366 L1190,336 L1220,312',
  'M1142,436 L1176,452 L1168,484 L1206,506 L1200,540',
  'M1162,388 L1146,360 L1160,330',
  'M1176,452 L1210,440 L1244,458',
];

const ParkWorld: React.FC<{
  sitters: React.ReactNode;
  hirzi?: React.ReactNode;
  crack?: number;
  impactF?: number;
  dark?: number;
}> = ({ sitters, hirzi, crack = 0, impactF = -1, dark = 0 }) => {
  const f = useCurrentFrame();
  const t = impactF >= 0 ? f - impactF : -1;
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ec9f5" />
          <stop offset="1" stopColor="#e6f4ff" />
        </linearGradient>
      </defs>
      <rect width={1280} height={480} fill="url(#sky)" />
      <circle cx={1000} cy={100} r={55} fill="#fde68a" />
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
      {[90, 230, 560, 760].map((tx, i) => (
        <g key={tx}>
          <rect x={tx - 14} y={300} width={28} height={190} fill="#8b5e3c" />
          <circle cx={tx} cy={260} r={90 + (i % 2) * 15} fill="#4ea85a" />
          <circle cx={tx - 50} cy={300} r={60} fill="#5bb866" />
          <circle cx={tx + 50} cy={300} r={60} fill="#5bb866" />
        </g>
      ))}
      <rect y={470} width={1280} height={250} fill="#7fc66a" />
      <path d="M0,640 Q640,590 1280,640 L1280,720 L0,720 Z" fill="#e7d3a8" />

      {/* bangku jauh */}
      <g transform="translate(360,560)">
        <rect x={-120} y={-100} width={240} height={50} rx={5} fill="#a0643a" stroke="#7a4a27" strokeWidth={3} />
        <rect x={-125} y={-44} width={250} height={10} rx={3} fill="#8b5230" stroke="#7a4a27" strokeWidth={2} />
        <rect x={-110} y={-34} width={8} height={34} fill="#6b4226" />
        <rect x={102} y={-34} width={8} height={34} fill="#6b4226" />
      </g>
      {sitters}

      {/* tembok bata merah */}
      <rect x={1130} y={120} width={150} height={600} fill="url(#bricks)" stroke="#6b2d20" strokeWidth={4} />
      <rect x={1120} y={104} width={170} height={22} fill="#8f4a3a" stroke="#6b2d20" strokeWidth={4} />

      {hirzi}

      {CRACKS.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - crack}
          stroke="#2b1b17"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {t >= 0 && t < 8 && <circle cx={1142} cy={436} r={14 + t * 14} fill="#fff" opacity={0.9 * (1 - t / 8)} />}
      {t > 0 &&
        t < 40 &&
        Array.from({ length: 8 }).map((_, i) => {
          const vx = -(2 + (i % 4) * 1.4);
          const vy = -4 + (i % 3) * 1.3;
          const px = 1142 + vx * t;
          const py = 436 + vy * t + 0.35 * t * t;
          const sz = 6 + (i % 3) * 3;
          return (
            <rect
              key={i}
              x={px}
              y={py}
              width={sz}
              height={sz}
              fill="#b5533c"
              opacity={1 - t / 40}
              transform={`rotate(${t * 14 * (i % 2 ? 1 : -1)} ${px} ${py})`}
            />
          );
        })}
      <rect width={1280} height={720} fill="#0b1226" opacity={dark * 0.55} />
    </g>
  );
};

/* ---- Scene 1A: Yusuf & Ara di bangku, kamera geser ke tembok ---- */
const SceneA: React.FC = () => {
  const { f, within, line, speaker, ex } = useLine(L1A, INTRO);
  const places: Partial<Record<'Ara' | 'Yusuf' | 'Hirzi', Place>> = { Ara: BENCH_ARA, Yusuf: BENCH_YUSUF };
  const keys: CamKey[] = [
    ...autoKeys(L1A, INTRO, places, { t: 0, cx: 640, cy: 400, z: 1 }, 1.9, 2.2),
    { t: 540, cx: 1130, cy: 420, z: 1.5 }, // geser ke tembok bata
    focus(600, 'Hirzi', HIRZI, 1.7),
  ];
  const cam = camAt(f, keys);
  return (
    <Fade>
      <AbsoluteFill>
        <Stage>
          <Defs />
          <CamG cam={cam}>
            <ParkWorld
              sitters={
                <>
                  <Character name="Ara" {...BENCH_ARA} lookDir={1} expr={ex('Ara')} speaking={speaker === 'Ara'} seed={1} />
                  <Character name="Yusuf" {...BENCH_YUSUF} lookDir={-1} expr={ex('Yusuf')} speaking={speaker === 'Yusuf'} seed={9} />
                </>
              }
              hirzi={
                <Character name="Hirzi" {...HIRZI} lookDir={-1} expr={f < 450 ? 'neutral' : 'sinis'} seed={3} />
              }
            />
          </CamG>
        </Stage>
        {line && (
          <Bubble
            who={line.who}
            text={line.text}
            within={within}
            {...bubbleAt(cam, line.who, line.who === 'Ara' ? BENCH_ARA : BENCH_YUSUF)}
          />
        )}
        <Narration
          items={[
            { from: 5, dur: 80, text: 'Taman sekolah, sepulang jam pelajaran...' },
            { from: 450, dur: 145, text: 'Tak jauh dari sana, seseorang memperhatikan mereka dari kejauhan...' },
          ]}
        />
      </AbsoluteFill>
    </Fade>
  );
};

/* ---- Scene 1B: siluet abu-abu (tanpa animasi, 2 detik) ---- */
const SceneB: React.FC = () => {
  const cam = { cx: 360, cy: 420, z: 2.6 };
  const sil = { filter: 'brightness(0) opacity(0.62)' };
  return (
    <Fade inF={8} outF={8}>
      <AbsoluteFill>
        <Stage>
          <Defs />
          <CamG cam={cam}>
            <ParkWorld
              sitters={
                <g style={sil}>
                  <Character name="Ara" {...BENCH_ARA} frozen seed={1} />
                  <Character name="Yusuf" {...BENCH_YUSUF} frozen seed={9} armL={128} />
                </g>
              }
            />
          </CamG>
          {/* seperti mengintip dari balik tembok */}
          <rect x={0} y={0} width={230} height={720} fill="url(#bricks)" stroke="#6b2d20" strokeWidth={4} />
          <rect x={1050} y={0} width={230} height={720} fill="url(#bricks)" stroke="#6b2d20" strokeWidth={4} />
          <rect width={1280} height={720} fill="url(#vig)" />
        </Stage>
      </AbsoluteFill>
    </Fade>
  );
};

/* ---- Scene 1C: Hirzi memukul tembok ---- */
const SceneC: React.FC = () => {
  const { f, within, line, speaker, ex } = useLine(L1C, 90);
  const keys: CamKey[] = autoKeys(L1C, 90, { Hirzi: HIRZI }, focus(0, 'Hirzi', HIRZI, 1.3), 1.5, 1.8);
  const cam = camAt(f, keys);

  const armR =
    f < 30
      ? -8
      : f < 42
        ? interpolate(f, [30, 42], [-8, 38])
        : f < 47
          ? interpolate(f, [42, 47], [38, -92])
          : f < 110
            ? -92
            : interpolate(f, [110, 135], [-92, -8], { extrapolateRight: 'clamp' });

  const crack = interpolate(f, [47, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dark = interpolate(f, [150, 450], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rain = interpolate(f, [200, 420], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fury = interpolate(f, [440, 500], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const amp = (f >= 47 ? 16 * Math.exp(-(f - 47) / 9) : 0) + (f >= 440 && f < 500 ? 5 : 0);

  return (
    <Fade>
      <AbsoluteFill>
        <Stage>
          <Defs />
          <CamG cam={cam} sx={Math.sin(f * 2.9) * amp} sy={Math.cos(f * 3.7) * amp * 0.7}>
            <ParkWorld
              crack={crack}
              impactF={47}
              dark={dark}
              sitters={
                <>
                  <Character name="Ara" {...BENCH_ARA} lookDir={1} expr="sad" seed={1} />
                  <Character name="Yusuf" {...BENCH_YUSUF} lookDir={-1} expr="neutral" seed={9} />
                </>
              }
              hirzi={
                <Character
                  name="Hirzi"
                  {...HIRZI}
                  lookDir={f < 40 ? -1 : 0.6}
                  expr={ex('Hirzi', f < 47 ? 'sinis' : 'angry')}
                  speaking={speaker === 'Hirzi'}
                  armR={armR}
                  fury={fury}
                  seed={3}
                />
              }
            />
          </CamG>
          <Rain intensity={rain} />
          <Lightning at={[300, 455, 520]} x={760} />
        </Stage>
        {line && <Bubble who={line.who} text={line.text} within={within} big={line.big} {...bubbleAt(cam, 'Hirzi', HIRZI)} />}
      </AbsoluteFill>
    </Fade>
  );
};

/* ------------------------------ LORONG ------------------------------ */
const COR_ARA: Place = { x: 560, y: 668 };
const COR_YUSUF: Place = { x: 800, y: 668 };

const SILS = [
  { x0: 150, v: 0.9, girl: false, y: 520, s: 0.55, seed: 1 },
  { x0: 700, v: -0.7, girl: true, y: 515, s: 0.5, seed: 2 },
  { x0: 420, v: 0, girl: true, y: 525, s: 0.55, seed: 3 },
  { x0: 1000, v: 0, girl: false, y: 520, s: 0.55, seed: 4 },
  { x0: 1100, v: -0.5, girl: true, y: 512, s: 0.48, seed: 5 },
  { x0: 300, v: 0.6, girl: true, y: 518, s: 0.52, seed: 7 },
  { x0: 880, v: 0, girl: true, y: 510, s: 0.5, seed: 8 },
];

const CorridorWorld: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <defs>
        <linearGradient id="rainSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7b8794" />
          <stop offset="1" stopColor="#b8c2cc" />
        </linearGradient>
      </defs>
      <rect width={1280} height={720} fill="url(#rainSky)" />
      {[700, 900, 1120, 1250].map((tx) => (
        <g key={tx}>
          <rect x={tx - 10} y={260} width={20} height={210} fill="#4b5563" />
          <circle cx={tx} cy={230} r={90} fill="#64748b" />
        </g>
      ))}
      <Rain x0={540} x1={1280} intensity={0.9} />
      {/* dinding kiri */}
      <rect x={0} y={0} width={540} height={470} fill="#e8dcc8" />
      <rect x={60} y={120} width={110} height={350} rx={6} fill="#b9835a" stroke="#8b5e3c" strokeWidth={6} />
      <rect x={230} y={150} width={100} height={150} rx={6} fill="#bfe3ff" stroke="#94a3b8" strokeWidth={6} />
      <rect x={380} y={120} width={110} height={350} rx={6} fill="#b9835a" stroke="#8b5e3c" strokeWidth={6} />
      {/* atap */}
      <rect x={0} y={0} width={1280} height={96} fill="#7c6f64" />
      <rect x={0} y={90} width={1280} height={10} fill="#5f554c" />
      {[520, 1000].map((px) => (
        <rect key={px} x={px} y={96} width={36} height={374} fill="#cbb9a8" stroke="#a39382" strokeWidth={3} />
      ))}
      {/* pagar */}
      <rect x={556} y={420} width={724} height={10} fill="#8b8f98" />
      {[600, 680, 760, 840, 920, 1060, 1140, 1220].map((px) => (
        <rect key={px} x={px} y={420} width={8} height={50} fill="#8b8f98" />
      ))}
      <rect y={470} width={1280} height={250} fill="#d6d0c6" />
      <rect y={470} width={1280} height={14} fill="#b9b2a6" />
      {[540, 620, 700].map((yy) => (
        <line key={yy} x1={0} y1={yy} x2={1280} y2={yy} stroke="#c3bcb0" strokeWidth={3} />
      ))}
      {/* siluet orang abu-abu (perempuan berhijab) */}
      {SILS.map((s, i) => {
        const x = s.v === 0 ? s.x0 : ((((s.x0 + s.v * f) % 1500) + 1500) % 1500) - 110;
        return <Silhouette key={i} x={x} y={s.y} s={s.s} girl={s.girl} walking={s.v !== 0} seed={s.seed} />;
      })}
      {children}
    </g>
  );
};

/* ---- Scene 2: lorong, melihat hujan ---- */
const Scene2: React.FC = () => {
  const { f, idx, within, line, speaker, ex } = useLine(L2, 90);
  const places = { Ara: COR_ARA, Yusuf: COR_YUSUF };
  const cam = camAt(f, autoKeys(L2, 90, places, { t: 0, cx: 640, cy: 400, z: 1 }, 1.35, 1.6));
  const sh = f >= 1365 && f < 1385 ? 6 * (1 - (f - 1365) / 20) : 0;
  return (
    <Fade>
      <AbsoluteFill>
        <Stage>
          <Defs />
          <CamG cam={cam} sx={Math.sin(f * 3) * sh} sy={Math.cos(f * 4) * sh}>
            <CorridorWorld>
              <Character name="Ara" {...COR_ARA} lookDir={idx < 2 ? 1 : 0.4} expr={ex('Ara', 'sad')} speaking={speaker === 'Ara'} seed={1} />
              <Character name="Yusuf" {...COR_YUSUF} lookDir={idx < 2 ? 1 : -0.4} expr={ex('Yusuf')} speaking={speaker === 'Yusuf'} seed={9} />
            </CorridorWorld>
          </CamG>
          <rect width={1280} height={720} fill="#1e293b" opacity={0.12} />
          <Lightning at={[1365]} x={800} />
        </Stage>
        {line && (
          <Bubble
            who={line.who}
            text={line.text}
            within={within}
            {...bubbleAt(cam, line.who, line.who === 'Ara' ? COR_ARA : COR_YUSUF)}
          />
        )}
        <Narration items={[{ from: 5, dur: 80, text: 'Hujan deras turun sore itu...' }]} />
      </AbsoluteFill>
    </Fade>
  );
};

/* ------------------------------ FLASHBACK ------------------------------ */
const FlashLabel: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 30,
      left: 30,
      background: '#fff',
      color: '#111',
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: 26,
      padding: '4px 18px',
      borderRadius: 12,
      letterSpacing: 3,
    }}
  >
    FLASHBACK
  </div>
);

const A31: Place = { x: 650, y: 655, pose: 'floor' };
const U31: Place = { x: 900, y: 655, pose: 'floor' };

const GazeboBG: React.FC = () => (
  <g>
    <rect width={1280} height={720} fill="#cfe8c7" />
    {[60, 300, 980, 1200].map((tx, i) => (
      <circle key={tx} cx={tx} cy={300 + (i % 2) * 20} r={100} fill="#6fbf73" />
    ))}
    <rect y={470} width={1280} height={250} fill="#b8865a" />
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={i} x1={0} x2={1280} y1={500 + i * 32} y2={500 + i * 32} stroke="#9a6b43" strokeWidth={2} />
    ))}
    <rect y={462} width={1280} height={12} fill="#8a5a2b" />
    <rect x={110} y={110} width={34} height={360} fill="#d9c3a0" stroke="#a88b63" strokeWidth={3} />
    <rect x={1136} y={110} width={34} height={360} fill="#d9c3a0" stroke="#a88b63" strokeWidth={3} />
    <polygon points="0,120 640,10 1280,120 1280,170 0,170" fill="#7c4a2d" stroke="#5a3520" strokeWidth={4} />
    <rect x={144} y={380} width={992} height={12} fill="#c9ad82" />
  </g>
);

const Scene31: React.FC = () => {
  const { f, within, line, speaker, ex } = useLine(L31, 120);
  const places = { Ara: A31, Udil: U31 };
  const cam = camAt(f, autoKeys(L31, 120, places, { t: 0, cx: 640, cy: 440, z: 1 }, 1.3, 1.5));
  return (
    <Fade>
      <AbsoluteFill>
        <Stage style={{ filter: 'grayscale(1) contrast(1.1)' }}>
          <Defs />
          <CamG cam={cam}>
            <GazeboBG />
            {/* tas Udil + keychain boneka rajut */}
            <g transform="translate(765,655)">
              <rect x={-30} y={-70} width={60} height={70} rx={12} fill="#2563eb" stroke="#1e3a8a" strokeWidth={3} />
              <rect x={-22} y={-30} width={44} height={22} rx={6} fill="#3b82f6" stroke="#1e3a8a" strokeWidth={2} />
              <line x1={-26} y1={-58} x2={26} y2={-58} stroke="#1e3a8a" strokeWidth={2} />
              <line x1={-15} y1={-66} x2={-15} y2={-56} stroke="#f9a8d4" strokeWidth={2} />
              <circle cx={-15} cy={-52} r={7} fill="#f9a8d4" stroke="#be185d" strokeWidth={1.5} />
              <ellipse cx={-15} cy={-40} rx={6} ry={8} fill="#fde68a" stroke="#b45309" strokeWidth={1.5} />
            </g>
            <Character
              name="Ara"
              {...A31}
              lookDir={1}
              expr={ex('Ara')}
              speaking={speaker === 'Ara'}
              armR={-55 + Math.sin(f * 0.1) * 3}
              seed={1}
            />
            <Character name="Udil" {...U31} lookDir={-1} expr={ex('Udil')} speaking={speaker === 'Udil'} seed={4} />
          </CamG>
          <rect width={1280} height={720} fill="url(#vig)" />
        </Stage>
        <FlashLabel />
        {line && (
          <Bubble
            who={line.who}
            text={line.text}
            within={within}
            {...bubbleAt(cam, line.who, line.who === 'Ara' ? A31 : U31)}
          />
        )}
        <Narration items={[{ from: 5, dur: 110, text: 'Eskul Miraku — kegiatan berkumpul di gazebo sekolah.' }]} />
      </AbsoluteFill>
    </Fade>
  );
};

const A32: Place = { x: 330, y: 668 };
const R32: Place = { x: 620, y: 668 };
const N32: Place = { x: 930, y: 668 };

const YardBG: React.FC = () => (
  <g>
    <rect width={1280} height={720} fill="#dbe7f7" />
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(${i * 320},0)`}>
        <rect x={40} y={110} width={110} height={360} rx={6} fill="#b9835a" stroke="#8b5e3c" strokeWidth={6} />
        <rect x={190} y={130} width={100} height={150} rx={6} fill="#bfe3ff" stroke="#94a3b8" strokeWidth={6} />
      </g>
    ))}
    <rect y={440} width={1280} height={30} fill="#c7d2e5" />
    <rect y={470} width={1280} height={250} fill="#ece7df" />
    {[540, 620, 700].map((yy) => (
      <line key={yy} x1={0} y1={yy} x2={1280} y2={yy} stroke="#d6cfc2" strokeWidth={3} />
    ))}
  </g>
);

const Glow: React.FC<{ cx: number; cy: number; s: number }> = ({ cx, cy, s }) => {
  const f = useCurrentFrame();
  if (s <= 0.01) return null;
  return (
    <g opacity={s}>
      <circle cx={cx} cy={cy} r={190 + Math.sin(f * 0.3) * 12} fill="url(#glowG)" />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = f * 0.04 + i * (Math.PI / 3);
        const r = 90 + (i % 2) * 30;
        return (
          <text
            key={i}
            x={cx + Math.cos(a) * r}
            y={cy + Math.sin(a) * r}
            fontSize={34}
            textAnchor="middle"
            opacity={0.6 + 0.4 * Math.sin(f * 0.3 + i)}
          >
            ✨
          </text>
        );
      })}
    </g>
  );
};

const Scene32: React.FC = () => {
  const { f, within, line, speaker, ex } = useLine(L32, 60);
  const { fps } = useVideoConfig();
  const places = { Ara: A32, Rakha: R32, Naura: N32 };
  const cam = camAt(f, autoKeys(L32, 60, places, { t: 0, cx: 640, cy: 420, z: 1 }, 1.3, 1.5));
  const nx = interpolate(f, [420, 520], [1450, N32.x], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const nWalk = f >= 420 && f < 520;
  const gl = interpolate(f, [720, 745, 860, 900], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const flash = f >= 720 && f < 735 ? 0.8 * (1 - (f - 720) / 15) : 0;
  const pop = spring({ frame: Math.max(0, f - 430), fps, config: { damping: 8 } });
  const bubblePlace = line ? places[line.who as 'Ara' | 'Rakha' | 'Naura'] : undefined;
  return (
    <Fade>
      <AbsoluteFill>
        <Stage style={{ filter: 'grayscale(1) contrast(1.1)' }}>
          <Defs />
          <CamG cam={cam}>
            <YardBG />
            <Character name="Ara" {...A32} lookDir={1} expr={ex('Ara')} speaking={speaker === 'Ara'} seed={1} />
            <Character name="Rakha" {...R32} lookDir={f < 420 ? -1 : 0.8} expr={ex('Rakha')} speaking={speaker === 'Rakha'} seed={6} />
            <Character
              name="Naura"
              x={nx}
              y={N32.y}
              walking={nWalk}
              lookDir={-1}
              expr={ex('Naura')}
              speaking={speaker === 'Naura'}
              seed={8}
            />
            <Glow cx={R32.x} cy={headCenter('Rakha', R32)} s={gl} />
            <Glow cx={N32.x} cy={headCenter('Naura', N32)} s={gl} />
            {f >= 430 && f < 900 && (
              <text
                x={A32.x + 62}
                y={headTop('Ara', A32) + 14}
                fontSize={64 * pop}
                textAnchor="middle"
              >
                😒
              </text>
            )}
          </CamG>
          <rect width={1280} height={720} fill="#fff" opacity={flash} />
          <rect width={1280} height={720} fill="url(#vig)" />
        </Stage>
        <FlashLabel />
        {line && bubblePlace && (
          <Bubble who={line.who} text={line.text} within={within} {...bubbleAt(cam, line.who, bubblePlace)} />
        )}
        <Narration items={[{ from: 3, dur: 50, text: 'Di lain waktu...' }]} />
      </AbsoluteFill>
    </Fade>
  );
};

/* ---- Scene 4: kembali ke lorong, Hessam mengintip ---- */
const HESSAM4: Place = { x: 1160, y: 668 };

const Scene4: React.FC = () => {
  const { f, within, line, speaker, ex } = useLine(L4, 60);
  const places = { Ara: COR_ARA, Yusuf: COR_YUSUF, Hessam: HESSAM4 };
  const cam = camAt(f, autoKeys(L4, 60, places, { t: 0, cx: 640, cy: 400, z: 1 }, 1.35, 1.6));
  const hx = interpolate(f, [240, 275], [1235, HESSAM4.x], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hPlace: Place = { x: hx, y: HESSAM4.y };
  return (
    <Fade>
      <AbsoluteFill>
        <Stage>
          <Defs />
          <CamG cam={cam}>
            <CorridorWorld>
              <Character name="Ara" {...COR_ARA} lookDir={1} expr={ex('Ara', 'sad')} speaking={speaker === 'Ara'} seed={1} />
              <Character name="Yusuf" {...COR_YUSUF} lookDir={-0.5} expr={ex('Yusuf')} seed={9} />
              {f >= 235 && (
                <Character
                  name="Hessam"
                  {...hPlace}
                  lookDir={-1}
                  expr={ex('Hessam', 'angry')}
                  speaking={speaker === 'Hessam'}
                  fury={0.25}
                  seed={2}
                />
              )}
              {/* dinding tempat Hessam bersembunyi */}
              <rect x={1195} y={96} width={95} height={624} fill="#e8dcc8" stroke="#b9a98f" strokeWidth={4} />
            </CorridorWorld>
          </CamG>
          <rect width={1280} height={720} fill="#1e293b" opacity={0.12} />
        </Stage>
        {line && (
          <Bubble
            who={line.who}
            text={line.text}
            within={within}
            {...bubbleAt(cam, line.who, line.who === 'Hessam' ? hPlace : line.who === 'Ara' ? COR_ARA : COR_YUSUF)}
          />
        )}
        <Narration
          items={[{ from: 245, dur: 140, text: 'Dari kejauhan, di balik dinding, Hessam melihat sekilas Yusuf dan Ara...' }]}
        />
      </AbsoluteFill>
    </Fade>
  );
};

/* ------------------------------ JUDUL & PENUTUP ------------------------------ */
const TitleCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: Math.max(0, f - 8), fps, config: { damping: 11 } });
  const pop2 = spring({ frame: Math.max(0, f - 36), fps, config: { damping: 12 } });
  return (
    <Fade>
      <AbsoluteFill
        style={{
          background: 'linear-gradient(135deg,#1e1b4b,#7f1d1d 60%,#f472b6)',
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
        </svg>
        <div
          style={{
            transform: `scale(${pop})`,
            fontSize: 108,
            fontWeight: 800,
            color: '#fff',
            textShadow: '0 6px 0 #450a0a, 0 12px 30px rgba(0,0,0,0.4)',
            textAlign: 'center',
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
            color: '#7f1d1d',
            background: '#fff',
            padding: '4px 40px',
            borderRadius: 40,
          }}
        >
          Episode 3
        </div>
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
        <div
          style={{
            transform: `scale(${pop * pulse})`,
            fontSize: 120,
            fontWeight: 800,
            color: '#fff',
            textShadow: '0 6px 0 #831843, 0 12px 30px rgba(0,0,0,0.5)',
          }}
        >
          BERSAMBUNG
        </div>
        <div style={{ marginTop: 16, fontSize: 34, color: '#f9a8d4', fontWeight: 700 }}>
          Segitiga Misterius • Episode 3
        </div>
      </AbsoluteFill>
    </Fade>
  );
};

/* ------------------------------ VIDEO UTAMA ------------------------------ */
export const Episode3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: FONT }}>
    <Sequence from={START.title} durationInFrames={D.title}>
      <TitleCard />
    </Sequence>
    <Sequence from={START.a} durationInFrames={D.a}>
      <SceneA />
    </Sequence>
    <Sequence from={START.b} durationInFrames={D.b}>
      <SceneB />
    </Sequence>
    <Sequence from={START.c} durationInFrames={D.c}>
      <SceneC />
    </Sequence>
    <Sequence from={START.s2} durationInFrames={D.s2}>
      <Scene2 />
    </Sequence>
    <Sequence from={START.s31} durationInFrames={D.s31}>
      <Scene31 />
    </Sequence>
    <Sequence from={START.s32} durationInFrames={D.s32}>
      <Scene32 />
    </Sequence>
    <Sequence from={START.s4} durationInFrames={D.s4}>
      <Scene4 />
    </Sequence>
    <Sequence from={START.end} durationInFrames={D.end}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
