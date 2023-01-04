import {EventEmitterSpy, FunctionSpy} from '.'

export default class HistorySpy extends EventEmitterSpy {
  constructor({path}) {
    super()
    this.#path = path
  }

  get path() {return this.#path}
  navigate = new FunctionSpy()

  #path = ''
}
