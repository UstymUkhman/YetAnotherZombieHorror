<div class="aim-sight">
  <div class="sight-line horizontal"></div>
  <div class="sight-line vertical"></div>
</div>

<style>
.aim-sight {
  pointer-events: none;
  position: absolute;
  display: block;

  margin: auto;
  z-index: 1;

  height: 3vw;
  width: 3vw;

  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
}

.sight-line {
  background-color: white;
  position: absolute;
  display: block;
  margin: auto;

  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
}

.sight-line.horizontal {
  height: 2px;
  width: 100%;
}

.sight-line.vertical {
  height: 100%;
  width: 2px;
}
</style>
