import Music from '@/managers/Music';

describe('Music', () => {
  const music = new Music();

  test('Create', () => {
    expect(music).toBeInstanceOf(Music);
  });

  test('play', () => {
    const play = jest.fn(music.play.bind(music));
    play();
    expect(play).toHaveReturnedWith(undefined);
  });

  test('pause', () => {
    const pause = jest.fn(music.pause.bind(music));
    pause();
    expect(pause).toHaveReturnedWith(undefined);
  });

  test('dispose', () => {
    const dispose = jest.fn(music.dispose.bind(music));
    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });

  test('volume', () => {
    music.volume = 0.5;
    expect(music.volume).toStrictEqual(0.5);
  });

  test('muted', () => {
    music.muted = true;
    expect(music.muted).toStrictEqual(true);
  });
});
