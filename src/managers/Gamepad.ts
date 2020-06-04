// import { clamp } from '@/utils/Number';
// import Input from '@/managers/Input';

const BUTTONS: Map<number, string> = new Map();

BUTTONS.set(8, 'SELECT');
BUTTONS.set(9, 'START');
BUTTONS.set(10, 'RUN');
BUTTONS.set(6, 'AIM');
BUTTONS.set(7, 'SHOOT');
BUTTONS.set(2, 'RELOAD');
BUTTONS.set(5, 'CHANGE');

class Gamepad {
  private readonly moves: Array<number> = [0, 0, 0, 0];
  private readonly gamepad: Gamepad | null = null;

  private reloading = false;
  private changing = false;
  private shooting = false;
  private running = false;
  private aiming = false;

  private frame = -1;
  private index = -1;
}

export default new Gamepad();
