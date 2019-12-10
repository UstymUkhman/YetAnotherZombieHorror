function getColor (hex) {
  const color = parseInt(hex.slice(1), 16);

	return {
    r: (color >> 16) & 255,
    g: (color >> 8) & 255,
    b: color & 255
  };
}

function blend (initial, target, p = 0.5) {
	const initialColor = getColor(initial);
	const targetColor = getColor(target);

	return '#' + (0x100000000 +
		(Math.round(((targetColor.r - initialColor.r) * p) + initialColor.r) * 0x10000) +
		(Math.round(((targetColor.g - initialColor.g) * p) + initialColor.g) * 0x100) +
		Math.round(((targetColor.b - initialColor.b) * p) + initialColor.b)
	).toString(16).slice(3);
}

export { blend };
