import Keyboard from '@/controls/Keyboard';

export type Directions = { [way in Direction]: number };
export const enum Direction { UP, RIGHT, DOWN, LEFT }

export default Keyboard;
