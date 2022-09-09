export default class AnimationMock {
  constructor(animationOperation, index) {
    this.#animationOperation = animationOperation
    this.#index = index
    this.playing.then(() => this.#playState = 'finished').catch(() => this.#playState = 'idle')
  }

  get playState() {return this.#playState}
  get forcedAction() {return this.#forcedAction}
  get playing() {return this.#animationOperation.get(this.#index).promise}

  play() {
    this.#playState = 'running'
    this.#forcedAction = 'play'
  }

  pause() {
    this.#playState = 'paused'
    this.#forcedAction = 'pause'
  }

  cancel() {
    this.#playState = 'idle'
    this.#forcedAction = 'cancel'
  }

  finish() {
    this.#playState = 'finished'
    this.#forcedAction = 'finish'
  }

  #animationOperation
  #index
  #playState = 'idle'
  #forcedAction = 'none'
}