import { LevelParams, getRandomCoord } from './randomCoords';
export const worker: Worker = self as never;

const getEventData = (event: string, params?: unknown) => {
  switch (event) {
    case 'Level:coord':
      return getRandomCoord(params as LevelParams);

    default:
      return undefined;
  }
};

worker.onmessage = (message => {
  const { event, params } = message.data;
  const data = getEventData(event, params);

  worker.postMessage({
    response: data,
    name: event
  });
});

worker.onerror = (error => {
  console.error(error);
});
