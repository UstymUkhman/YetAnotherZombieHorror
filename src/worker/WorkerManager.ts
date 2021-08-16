import type { OffscreenParams, SizeParams } from '@/offscreen/types';
import { updateRainParticles } from '@/worker/updateRainParticles';
import { OffscreenManager } from '@/offscreen/OffscreenManager';

import type { LevelParams, RainParams } from '@/worker/types';
import type { Event } from 'three/src/core/EventDispatcher';
import { getRandomCoord } from '@/worker/getRandomCoord';

const parseMessage = (event: string, params?: unknown) => {
  switch (event) {
    case 'Rain::UpdateParticles':
      return updateRainParticles(params as RainParams);

    case 'Level::GetRandomCoord':
      return getRandomCoord(params as LevelParams);

    case 'Offscreen::Transfer':
      return OffscreenManager.takeControl(params as OffscreenParams);

    case 'Game::Resize':
      return OffscreenManager.resize(params as SizeParams);

    case 'EventsTarget::Dispatch':
      return OffscreenManager.dispatch(params as Event);
  }

  return params;
};

self.onmessage = message => {
  const { event, params } = message.data;
  const response = parseMessage(event, params);

  self.postMessage({
    name: event,
    response
  });
};

self.onerror = error => console.error(error);

export default self;
