import {touch} from '../../services'

export default Base => class TouchListener extends Base {
  connectedCallback() {
    super.connectedCallback()
    //TODO trofima: settings validation

    const {target, throttle, start, end, move} = this.onTouch()

    if (start) touch.bind(this, 'touchstart', start, {target})
    if (end) touch.bind(this, 'touchend', end, {target})
    if (move) touch.bind(this, 'touchmove', move, {target, throttle})
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    touch.unbind(this)
  }

  onTouch() {
    return {
      target: window,
      throttle: true,
      start: () => {},
      end: () => {},
      move: () => {},
    }
  }
}
