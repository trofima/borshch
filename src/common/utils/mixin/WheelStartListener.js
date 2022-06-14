import WheelListener from './WheelListener.js';
import {lockable} from '../index.js';

const WheelStartListener = Base => class WheelStart extends WheelListener(Base) {
  #deltas = [];
  #deltasToAnalyze = 10; //found by experiment

  onWheel() {
    const {target: wheelTarget, listener: wheelListener} = super.onWheel();
    const {target = wheelTarget, listener = wheelListener} = this.onWheelStart(); //TODO trofima: validation

    return {
      target,
      throttle: false,
      listener: e => {
        const {deltaY} = e;
        const absDeltaY = Math.abs(deltaY);

        wheelListener(e);
        this.#deltas.push(absDeltaY);

        if (!WheelStartListener.locked && !this.#scrollingSlowing()) {
          this.#deltas = [];
          listener({direction: deltaY / absDeltaY, event: e});
        } else e.stopPropagation();
      },
    }
  }

  onWheelStart() {
    const {element, callback} = super.onWheel();

    return {
      element,
      callback,
    }
  }

  #scrollingSlowing() { // detects for example mac scroll easing
    const deltas = this.#deltas.slice(-this.#deltasToAnalyze);
    const half = deltas.length / 2;
    const startingHalf = deltas.slice(0, half);
    const endingHalf = deltas.slice(-half);
    const startingAverage = startingHalf.reduce((sum, next) => sum + next, 0) / startingHalf.length;
    const endingAverage = endingHalf.reduce((sum, next) => sum + next, 0) / endingHalf.length;

    return endingAverage < startingAverage;
  }
};

export default lockable(WheelStartListener);
