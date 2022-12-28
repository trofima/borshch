import {AsyncOperationMock, AnimationMock} from '.'

export default class ElementMock {
  get children() {return this.#children}
  get style() {return this.#style}
  get removed() {return this.#removed}
  get animationOperation() {return this.#animationOperation}
  get currentAnimation() {return this.#currentAnimation}

  appendChild(el) {
    this.#children.push(el)
  }

  removeChild(el) {
    this.#children = this.#children.filter(child => child !== el)
  }

  replaceChildren(el) {
    this.#children = [el]
  }

  attachChild(htmlString) {
    throw new Error('not implemented')
  }

  removeChildren() {
    this.#children = []
  }

  setStyle(style) {
    this.#style = style
  }

  animate(keyframes, options) {
    this.#animationOperation.create({keyframes, options})
    const index = this.#animationOperation.callCount - 1
    this.#currentAnimation = new AnimationMock(this.#animationOperation, index)
    this.#currentAnimation.play()

    return this.#currentAnimation
  }

  select(selector) {
    throw new Error('not implemented')
  }

  #children = []
  #removed = false
  #style = {}
  #animationOperation = new AsyncOperationMock('element animation')
  #currentAnimation
}