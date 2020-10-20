import { Elastic } from '@/utils/Elastic';

describe('Elastic', () => {
  test('Number', () => {
    const elasticNumber = new Elastic.Number(1);
    expect(elasticNumber.value).toStrictEqual(1);

    elasticNumber.set(2);
    elasticNumber.update();
    expect(elasticNumber.value).toBeCloseTo(1.166);

    elasticNumber.update();
    expect(elasticNumber.value).toBeCloseTo(1.305);
  });
});
