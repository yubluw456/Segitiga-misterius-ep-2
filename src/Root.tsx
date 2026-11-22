import React from 'react';
import { Composition } from 'remotion';
import { SegitigaMisterius, FPS, TOTAL_FRAMES } from './Video';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SegitigaMisteriusEp2"
      component={SegitigaMisterius}
      durationInFrames={TOTAL_FRAMES} // 3600 frame = 2 menit @30fps
      fps={FPS}
      width={1280}
      height={720}
    />
  );
};
