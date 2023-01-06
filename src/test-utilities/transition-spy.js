import {FunctionSpy} from '.'

export default class TransitionSpy {
  constructor({running = Promise.resolve(), state = 'idle'} = {}) {
    this.stubState(state)
    this.stubRunning(running)
  }

  get state() {return this.#state}
  get playing() {return this.#running}

  play = new FunctionSpy()
  pause = new FunctionSpy()
  cancel = new FunctionSpy()
  finish = new FunctionSpy()

  stubState(state) {
    this.#state = state
  }

  stubRunning(running) {
    this.#running = running
  }

  #state
  #running
}