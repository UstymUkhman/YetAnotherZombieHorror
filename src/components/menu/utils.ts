const keys = ['ArrowUp', 'ArrowDown', 'Enter'];

const updateSelected = (key: string, selected: number, items: number) =>
  Math.abs((items + selected + (+(key === 'ArrowDown') * 2 - 1)) % items);

export default (event: KeyboardEvent, selected: number, items: number) => {
  event.stopPropagation();
  event.preventDefault();
  const key = event.key;

  if (!keys.includes(key)) return selected;
  else if (key === 'Enter') return -1;

  return updateSelected(key, selected, items);
};
