export type Directions = { [way in Direction]: number };
export const enum Direction { UP, RIGHT, DOWN, LEFT }
export const enum BUTTON { LEFT, WHEEL, RIGHT }
export { default } from '@/controls/Keyboard';
export const IDLING = '0000';
