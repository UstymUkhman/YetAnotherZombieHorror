import {
  SizeParams,
  GameManager,
  OffscreenParams
} from '@/managers/GameManager';

import type { /* LevelParams, */ RainParams } from '@/managers/worker/types';
import { updateRainParticles } from '@/managers/worker/rainParticles';
// import { getRandomCoord } from '@/managers/worker/randomCoords';

export const worker: Worker = self as never;

const parseMessage = (event: string, params?: unknown) => {
  switch (event) {
    case 'Rain:particles':
      return updateRainParticles(params as RainParams);

    // case 'Level:coord':
    //   return getRandomCoord(params as LevelParams);

    case 'transfer':
      return GameManager.takeControl(params as OffscreenParams);

    case 'resize':
      return GameManager.resize(params as SizeParams);
  }

  return params;
};

worker.onmessage = message => {
  const { event, params } = message.data;
  const response = parseMessage(event, params);

  worker.postMessage({
    name: event,
    response
  });
};

worker.onerror = error => console.error(error);
