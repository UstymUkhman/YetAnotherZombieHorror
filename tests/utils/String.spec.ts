import { replaceAll, capitalize, camelCase } from '@/utils/String';

describe('String', () => {
  test('replaceAll', () => {
    const multipleReplacements = 'A car without a car engine';
    const oneReplacement = 'A game with a game engine';
    const replace = 'A game without a game engine';
    const noReplacement = replace;

    expect(replaceAll(replace, 'game', 'car')).toStrictEqual(multipleReplacements);
    expect(replaceAll(replace, 'without', 'with')).toStrictEqual(oneReplacement);
    expect(replaceAll(replace, 'zombie', 'enemy')).toStrictEqual(noReplacement);
  });

  test('capitalize', () => {
    const name = 'another dumb zombie game';
    const capitalized = 'Another dumb zombie game';
    expect(capitalize(name)).toStrictEqual(capitalized);
  });

  test('camelCase', () => {
    const name = 'AnotherDumbZombieGame';
    const camelCased = 'anotherDumbZombieGame';
    expect(camelCase(name)).toStrictEqual(camelCased);
  });
});
