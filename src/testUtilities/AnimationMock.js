export default class AnimationMock {
  constructor(animation, index) {
    this.#animation = animation
    this.#index = index
  }

  get isFinishing() {return this.#isFinishing}
  get playing() {return this.#animation.at(this.#index).promise}

  async finish() {
    this.#isFinishing = true
    return this.#animation.succeed(this.#index)
  }

  #animation
  #index
  #isFinishing = false
}