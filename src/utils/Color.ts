type Color = { r: number, g: number, b: number };

const getColor = (hex: string): Color => {
  const color = parseInt(hex.slice(1), 16);

	return {
    r: (color >> 16) & 255,
    g: (color >> 8) & 255,
    b: color & 255
  };
};

export const blend = (initial: string, target: string, p = 0.5): string => {
	const iColor: Color = getColor(initial);
	const tColor: Color = getColor(target);

	return '#' + (0x100000000 +
		(Math.round(((tColor.r - iColor.r) * p) + iColor.r) * 0x10000) +
		(Math.round(((tColor.g - iColor.g) * p) + iColor.g) * 0x100) +
		Math.round(((tColor.b - iColor.b) * p) + iColor.b)
	).toString(16).slice(3);
};
