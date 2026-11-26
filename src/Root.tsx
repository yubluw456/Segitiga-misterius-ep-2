import React from 'react';
import { Composition } from 'remotion';
import { SegitigaMisterius, FPS, TOTAL_FRAMES } from './Video';
import { Episode3, TOTAL_FRAMES_EP3 } from './Video3';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SegitigaMisteriusEp2"
        component={SegitigaMisterius}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1280}
        height={720}
      />
      <Composition
        id="SegitigaMisteriusEp3"
        component={Episode3}
        durationInFrames={TOTAL_FRAMES_EP3}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
