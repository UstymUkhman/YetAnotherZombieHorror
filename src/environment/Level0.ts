// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />

type OrbitControls = import('@controls/OrbitControls').OrbitControls;
type Stats = typeof import('three/examples/js/libs/stats.min');

import GameLevel from '@/environment/GameLevel';
import Settings from '@/settings';

export default class Level0 extends GameLevel {
  private controls?: OrbitControls;
  private stats?: Stats = null;
  private raf: number;

  public constructor () {
    super();

    if (Settings.DEBUG) {
      import(/* webpackChunkName: "stats.min" */ 'three/examples/js/libs/stats.min').then((Stats) => {
        this.stats = new Stats.default();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.domElement);
      });

      import(/* webpackChunkName: "orbit-controls" */ '@controls/OrbitControls').then((Controls) => {
        this.controls = new Controls.OrbitControls(this.camera, this.canvas);
        this.controls.target.set(0, 0, 25);
        this.controls.update();
      });
    }

    this.raf = requestAnimationFrame(this.render.bind(this));
  }

  public render (): void {
    this.stats?.begin();

    super.render();
    this.controls?.update();
    this.raf = requestAnimationFrame(this.render.bind(this));

    this.stats?.end();
  }

  public destroy (): void {
    cancelAnimationFrame(this.raf);
    super.destroy();

    if (Settings.DEBUG) {
      document.body.removeChild(this.stats.domElement);
      this.controls?.dispose();

      delete this.controls;
      delete this.stats;
    }
  }
}
