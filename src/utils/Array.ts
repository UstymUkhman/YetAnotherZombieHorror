export const clone = (a: Array<Array<number>>): Array<Array<number>> => JSON.parse(JSON.stringify(a));

export const min = (a: Array<number>): number => {
  let l = a.length, m = Infinity;
  while (l--) if (a[l] < m) m = a[l];
  return m;
};

export const max = (a: Array<number>): number => {
  let l = a.length, m = -Infinity;
  while (l--) if (a[l] > m) m = a[l];
  return m;
};
