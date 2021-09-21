import TextureLoader from '@/loaders/TextureLoader';
import { Loader } from 'three/src/loaders/Loader';
import { Assets } from '@/loaders/AssetsLoader';

describe('TextureLoader', () => {
  const loader = new TextureLoader(Assets.Loader);

  test('Create', () => {
    expect(loader).toBeInstanceOf(Loader);
    expect(TextureLoader).toBeDefined();
  });

  /* test('load', () => {
    const loader = new TextureLoader(Assets.Loader);
    expect(loader.load('')).toHaveReturnedWith(undefined);
  }); */
});
