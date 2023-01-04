import {FunctionSpy} from '.'

export default class AnimationSpy {
  constructor({playing = Promise.resolve(), playState = 'idle'} = {}) {
    this.stubPlayState(playState)
    this.stubPlaying(playing)
  }

  get playState() {return this.#playState}
  get playing() {return this.#playing}

  play = new FunctionSpy()
  pause = new FunctionSpy()
  cancel = new FunctionSpy()
  finish = new FunctionSpy()

  stubPlayState(playState) {
    this.#playState = playState
  }

  stubPlaying(playing) {
    this.#playing = playing
  }

  #playState
  #playing
}