import type { OffscreenParams, SizeParams } from '@/offscreen/types';
import { updateRainParticles } from '@/worker/updateRainParticles';
import type { Event } from 'three/src/core/EventDispatcher';

import OffscreenManager from '@/offscreen/OffscreenManager';
import { getRandomCoord } from '@/worker/getRandomCoord';
import type { RainParams } from '@/environment/types';
import type { LevelParams } from '@/scenes/types';

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

    case 'Game::Inputs': {
      const { disabled } = params as { disabled: boolean };
      return OffscreenManager.inputs = disabled;
    }

    case 'Game::Pause': {
      const { paused } = params as { paused: boolean };
      return OffscreenManager.pause = paused;
    }

    case 'EventsTarget::Dispatch':
      return OffscreenManager.dispatch(params as Event);
  }

  return params;
};

self.onmessage = message => {
  const { event, params } = message.data;
  const response = parseMessage(event, params);

  self.postMessage({ name: event, response });
};

self.onerror = error => console.error(error);

export default self;
