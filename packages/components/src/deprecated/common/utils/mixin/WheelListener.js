import {wheel} from '../../services/index.js'
import {lockable} from '../index.js'

const WheelListener = Base => class WheelListener extends Base {
  connectedCallback() {
    super.connectedCallback()
    //TODO trofima: settings validation
    const {target, throttle, listener} = this.onWheel()

    wheel.bind(this, listener, {target, throttle})
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    wheel.unbind(this)
  }

  onWheel() {
    return {
      target: window,
      throttle: true,
      listener: () => {},
    }
  }
}

export default lockable(WheelListener)
