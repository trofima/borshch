
import AnimationMock from './AnimationMock'
import AsyncOperationMock from './AsyncOperationMock'

export default class RouteMock {
  constructor({path} = {}) {
    this.#path = path
  }

  get rendered() {return this.#rendered}
  get path() {return this.#path}
  get style() {return this.#style}
  get animation() {return this.#animation}
  get currentAnimation() {return this.#currentAnimation}

  render() {
    this.#rendered = true
  }

  clear() {
    this.#rendered = false
  }

  setStyle(style) {
    this.#style = style
  }

  animate(transitions, options) {
    this.#animation.create({transitions, options})
    const index = this.#animation.callCount - 1

    this.#currentAnimation = new AnimationMock(this.#animation, index)

    return this.#currentAnimation
  }

  #path
  #rendered = false
  #style = {}
  #animation = new AsyncOperationMock('route animation')
  #currentAnimation
}
