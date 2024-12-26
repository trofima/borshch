import TouchListener from './TouchListener.js'
import {lockable} from '../index.js'

const SwipeStartListener = Base => class SwipeStart extends TouchListener(Base) {
  #touchStartX = 0
  #touchStartY = 0

  onTouch() {
    const {target: touchTarget, start, end, move} = super.onTouch()
    const {target = touchTarget, listener = () => {}} = this.onSwipeStart() //TODO: validation

    return {
      target,
      throttle: false,
      start: e => {
        const {touches: [{clientX, clientY}]} = e

        start(e)
        this.#touchStartX = clientX
        this.#touchStartY = clientY
      },
      end: e => (end(e), this.#touchStartX = 0, this.#touchStartY = 0),
      move: e => {
        const {touches: [{clientY, clientX}]} = e

        move(e)
        e.preventDefault() // disable scroll bouncing

        if (!SwipeStartListener.locked)
          listener({
            event: e, //TODO trofima: calculate main axis
            directionY: this.#touchStartY > clientY ? 1 : -1,
            directionX: this.#touchStartX > clientX ? 1 : -1,
          })
      },
    }
  }

  onSwipeStart() {
    const {target} = super.onTouch()

    return {
      target,
      listener: () => {},
    }
  }
}

export default lockable(SwipeStartListener)
