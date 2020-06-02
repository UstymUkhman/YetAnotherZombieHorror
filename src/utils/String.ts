export const replaceAll = (t: string, s: string, r: string): string => t.replace(new RegExp(s, 'g'), r);
export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
