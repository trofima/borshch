export default class BorshchTransition {
  constructor(animation) {
    this.#animation = animation
  }

  get running() {return this.#animation.finished}
  get state() {return this.#animation.playState}

  play() {
    this.#animation.play()
  }

  pause() {
    this.#animation.pause()
  }

  cancel() {
    this.#animation.cancel()
  }

  finish() {
    this.#animation.finish()
  }

  #animation
}