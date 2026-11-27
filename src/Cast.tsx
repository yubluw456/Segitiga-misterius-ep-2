import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Character, FONT, Stage } from './Characters';
import type { Name } from './Characters';

// Foto semua karakter (untuk cek tampilan sebelum bikin episode)
const CAST: Name[] = [
  'Ara', 'Hirzi', 'Hessam', 'S', 'Yusuf', 'Udil', 'Rakha',
  'Naura', 'Raihan', 'Royan', 'Rasya', 'Niko', 'Febri', 'Hana',
  'Riri', 'Azka', 'Rifky', 'Hafizh', 'Syauqi', 'Aril', 'Khaliq', 'Nasita',
];

export const CastPreview: React.FC = () => (
  <AbsoluteFill style={{ background: '#e9eef5', fontFamily: FONT }}>
    <Stage>
      <rect width={1280} height={720} fill="#e9eef5" />
      {CAST.map((n, i) => {
        const col = i % 8;
        const row = Math.floor(i / 8);
        const x = 80 + col * 160;
        const y = 225 + row * 230;
        return (
          <g key={n}>
            <line x1={x - 80} y1={y} x2={x + 80} y2={y} stroke="#c3cbd6" strokeWidth={3} />
            <Character
              name={n}
              x={x}
              y={y}
              mul={0.4}
              expr="happy"
              seed={i + 1}
              crossed={n === 'Niko'}
              lean={n === 'Niko' ? -6 : 0}
            />
            <text x={x} y={y + 24} textAnchor="middle" fontSize={22} fontWeight={800} fill="#1f2937" fontFamily={FONT}>
              {n}
            </text>
          </g>
        );
      })}
    </Stage>
  </AbsoluteFill>
);
