const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
const camelCase = s => s.charAt(0).toLowerCase() + s.slice(1);

export { capitalize, camelCase };
